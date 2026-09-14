import { ApiError } from "../lib/api-error.js";
import { ACCESS_TOKEN_COOKIE } from "../lib/auth-cookies.js";
import { createAuthClient } from "../lib/supabase.js";
import { findUserByProviderUid } from "../repositories/user.repository.js";

// Authorization: Bearer 토큰을 우선 쓰고, 없으면 accessToken 쿠키를 쓴다 (auth.controller.js의 signout과 동일한 방식)
function extractToken(req) {
  const bearer = req.get("Authorization")?.replace(/^Bearer\s+/i, "");
  return bearer || req.cookies[ACCESS_TOKEN_COOKIE];
}

// 토큰을 검증하고 우리 User 행을 찾는다. 실패하면 무조건 401
async function resolveUser(token) {
  const supabase = createAuthClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw new ApiError(401, "UNAUTHORIZED", "인증 정보가 올바르지 않습니다");
  }

  const user = await findUserByProviderUid(data.user.id);
  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "인증 정보가 올바르지 않습니다");
  }

  return user;
}

// 로그인 필수 라우트에 붙인다. req.user에 우리 User 행을 넣는다
export async function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    throw new ApiError(401, "UNAUTHORIZED", "로그인이 필요합니다");
  }

  req.user = await resolveUser(token);
  next();
}

// 비회원도 허용하는 라우트에 붙인다. 토큰이 없으면 req.user 없이 통과.
// 토큰이 있는데 유효하지 않으면 requireAuth와 동일하게 401 — 위조·만료된 토큰을
// 조용히 비회원 취급하면 탐지가 어려워지므로, "없음"과 "잘못됨"은 구분한다
export async function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (token) {
    req.user = await resolveUser(token);
  }
  next();
}
