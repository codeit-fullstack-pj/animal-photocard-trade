import { ApiError } from "../../lib/api-error.js";
import { createAuthClient } from "../../lib/supabase.js";
import {
  createUser,
  findUserByEmail,
  findUserByNickname,
} from "../../repositories/user.repository.js";

export async function signup({ email, nickname, password }) {
  // Supabase 계정을 만들기 전에 DB 쪽 조건을 먼저 확인해 뒤의 DB 저장이 실패하지 않게 한다
  if (await findUserByEmail(email)) {
    throw new ApiError(409, "EMAIL_ALREADY_EXISTS", "이미 가입된 이메일입니다");
  }
  if (await findUserByNickname(nickname)) {
    throw new ApiError(409, "NICKNAME_ALREADY_EXISTS", "이미 사용 중인 닉네임입니다");
  }

  const supabase = createAuthClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    if (error.code === "user_already_exists") {
      throw new ApiError(409, "EMAIL_ALREADY_EXISTS", "이미 가입된 이메일입니다");
    }
    // Supabase가 거절한 입력값 (예: example.com과 같은 예약 도메인, 너무 약한 비밀번호)
    if (error.status < 500) {
      throw new ApiError(400, "VALIDATION_ERROR", error.message);
    }
    throw error;
  }

  if (data.session) {
    await supabase.auth.admin.signOut(data.session.access_token);
  }

  const user = await createUser({
    email,
    nickname,
    provider: "local",
    providerUid: data.user.id,
  });
  return { id: user.id, nickname: user.nickname, createdAt: user.createdAt };
}
