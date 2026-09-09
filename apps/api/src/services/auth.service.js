import { randomUUID } from "node:crypto";

import { ApiError } from "../lib/api-error.js";
import { createAuthClient } from "../lib/supabase.js";
import {
  createUser,
  deleteUser,
  findUserByEmail,
  findUserByNickname,
  updateProviderUid,
} from "../repositories/user.repository.js";

export async function signup({ email, nickname, password }) {
  if (await findUserByEmail(email)) {
    throw new ApiError(409, "EMAIL_ALREADY_EXISTS", "이미 가입된 이메일입니다");
  }
  if (await findUserByNickname(nickname)) {
    throw new ApiError(409, "NICKNAME_ALREADY_EXISTS", "이미 사용 중인 닉네임입니다");
  }

  // DB 행을 먼저 만들어 이메일·닉네임을 선점한다(unique 제약이 동시 요청도 막아 준다).
  // Supabase 계정은 그 다음에 만들고, 실패하면 DB 행을 지워 되돌린다. 그래서 service_role 키가 필요 없다
  const user = await createUser({
    email,
    nickname,
    provider: "local",
    providerUid: `pending-${randomUUID()}`,
  });

  const supabase = createAuthClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    await deleteUser(user.id);
    if (error.code === "user_already_exists") {
      throw new ApiError(409, "EMAIL_ALREADY_EXISTS", "이미 가입된 이메일입니다");
    }
    // Supabase가 거절한 입력값 (예: example.com과 같은 예약 도메인, 너무 약한 비밀번호)
    if (error.status < 500) {
      throw new ApiError(400, "VALIDATION_ERROR", error.message);
    }
    throw error;
  }

  // 이메일 인증 없이 가입만 완료시키므로, 가입 시 발급된 토큰은 admin.signOut으로 바로 무효화한다 (명세).
  // 사용자 토큰을 Bearer로 보내는 호출이라 service_role 키 없이 공개 키로 동작한다
  if (data.session) {
    await supabase.auth.admin.signOut(data.session.access_token);
  }

  await updateProviderUid(user.id, data.user.id);
  return { id: user.id, nickname: user.nickname, createdAt: user.createdAt };
}
