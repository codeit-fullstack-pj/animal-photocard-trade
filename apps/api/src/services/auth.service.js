import { randomInt, randomUUID } from "node:crypto";

import { ApiError } from "../lib/api-error.js";
import { OAUTH_VERIFIER_KEY, createAuthClient, createOAuthClient } from "../lib/supabase.js";
import {
  createUser,
  deleteUser,
  findUserByEmail,
  findUserByNickname,
  findUserByProviderUid,
  updateProviderUid,
} from "../repositories/user.repository.js";

const ACCESS_TOKEN_EXPIRES_IN = 60 * 60;
const SOCIAL_PROVIDERS = ["google"];

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

// 로그인: Supabase가 비밀번호를 확인하고 토큰을 발급한다.
export async function signin({ email, password }) {
  const supabase = createAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "이메일 또는 비밀번호가 올바르지 않습니다");
  }

  const user = await findUserByProviderUid(data.user.id);
  if (!user) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "이메일 또는 비밀번호가 올바르지 않습니다");
  }

  return { user: toPublicUser(user), session: toSession(data.session) };
}

// 로그아웃: Supabase 세션을 무효화한다.
export async function signout(accessToken) {
  if (!accessToken) return;
  const supabase = createAuthClient();
  await supabase.auth.admin.signOut(accessToken).catch(() => {});
}

// 토큰 재발급: refreshToken으로 새 세션을 받는다 (refreshToken도 함께 새것으로 바뀐다)
export async function refresh(refreshToken) {
  if (!refreshToken) {
    throw new ApiError(401, "REFRESH_TOKEN_INVALID", "리프레시 토큰이 없습니다");
  }

  const supabase = createAuthClient();
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session) {
    const isExpired = error?.message?.toLowerCase().includes("expired");
    throw new ApiError(
      401,
      isExpired ? "REFRESH_TOKEN_EXPIRED" : "REFRESH_TOKEN_INVALID",
      isExpired
        ? "로그인이 만료되었습니다. 다시 로그인해 주세요"
        : "리프레시 토큰이 올바르지 않습니다",
    );
  }

  return toSession(data.session);
}

// 소셜 로그인 1단계: Supabase OAuth 페이지 주소를 만든다. code_verifier는 콜백 때 다시 필요하므로 함께 돌려준다
export async function startSocialLogin(provider, callbackUrl) {
  if (!SOCIAL_PROVIDERS.includes(provider)) {
    throw new ApiError(400, "VALIDATION_ERROR", "지원하지 않는 로그인 방식입니다");
  }

  const store = new Map();
  const supabase = createOAuthClient(store);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: callbackUrl, skipBrowserRedirect: true },
  });
  if (error) throw error;

  return { url: data.url, codeVerifier: store.get(OAUTH_VERIFIER_KEY) };
}

// 소셜 로그인 2단계: Supabase가 돌려준 code를 code_verifier와 함께 세션으로 바꾼 뒤, 명세의 callback 로직을 태운다
export async function finishSocialLogin({ code, codeVerifier }) {
  if (!code || !codeVerifier) {
    throw new ApiError(
      401,
      "INVALID_SOCIAL_TOKEN",
      "소셜 로그인 정보가 없습니다. 다시 시도해 주세요",
    );
  }

  const supabase = createOAuthClient(new Map([[OAUTH_VERIFIER_KEY, codeVerifier]]));
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session) {
    throw new ApiError(401, "INVALID_SOCIAL_TOKEN", "소셜 로그인 토큰이 올바르지 않습니다");
  }

  return socialCallback({
    supabaseAccessToken: data.session.access_token,
    supabaseRefreshToken: data.session.refresh_token,
  });
}

// 소셜 로그인/회원가입 (명세 POST /auth/social/callback): 토큰을 검증하고, 처음이면 사용자를 만든다
export async function socialCallback({ supabaseAccessToken, supabaseRefreshToken }) {
  const supabase = createAuthClient();
  const { data, error } = await supabase.auth.getUser(supabaseAccessToken);
  if (error || !data.user) {
    throw new ApiError(401, "INVALID_SOCIAL_TOKEN", "소셜 로그인 토큰이 올바르지 않습니다");
  }

  const supabaseUser = data.user;
  let user = await findUserByProviderUid(supabaseUser.id);

  if (!user) {
    const email = supabaseUser.email?.toLowerCase();
    if (!email) {
      throw new ApiError(401, "INVALID_SOCIAL_TOKEN", "이메일 제공에 동의해야 가입할 수 있습니다");
    }
    // 명세: provider가 달라도 같은 이메일이면 반려 (로그인 수단당 하나의 계정, 계정 연동 미지원)
    if (await findUserByEmail(email)) {
      throw new ApiError(409, "EMAIL_ALREADY_EXISTS", "다른 방식으로 이미 가입된 이메일입니다");
    }

    const baseNickname = supabaseUser.user_metadata?.name ?? email.split("@")[0];
    user = await createUser({
      email,
      nickname: await makeUniqueNickname(baseNickname),
      provider: supabaseUser.app_metadata?.provider ?? "social",
      providerUid: supabaseUser.id,
    });
  }

  return {
    user: toPublicUser(user),
    session: {
      accessToken: supabaseAccessToken,
      refreshToken: supabaseRefreshToken ?? null,
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    },
  };
}

// 소셜 가입 시 닉네임이 겹치면 뒤에 숫자 4자리를 붙여 본다
async function makeUniqueNickname(baseNickname) {
  const base = baseNickname.trim().slice(0, 16) || "멍냥이";
  if (!(await findUserByNickname(base))) return base;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = `${base}${randomInt(1000, 9999)}`;
    if (!(await findUserByNickname(candidate))) return candidate;
  }
  throw new ApiError(
    409,
    "NICKNAME_ALREADY_EXISTS",
    "닉네임을 만들지 못했습니다. 다시 시도해 주세요",
  );
}

// 응답에 실을 사용자 정보 (point는 BigInt라 JSON으로 바로 못 보내므로 숫자로 바꾼다)
function toPublicUser(user) {
  return {
    id: user.id,
    nickname: user.nickname,
    point: Number(user.point),
    lastDrawAt: user.lastDrawAt,
    createdAt: user.createdAt,
  };
}

function toSession(session) {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresIn: session.expires_in ?? ACCESS_TOKEN_EXPIRES_IN,
  };
}
