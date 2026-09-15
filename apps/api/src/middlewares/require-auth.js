import { ACCESS_TOKEN_COOKIE } from "../lib/auth-cookies.js";
import { ApiError } from "../lib/api-error.js";
import { createAuthClient } from "../lib/supabase.js";
import { findUserByProviderUid } from "../repositories/user.repository.js";

// Authorization: Bearer <accessToken> 이 없으면 쿠키의 토큰을 쓴다 (auth.controller.js signout과 동일한 방식)
export async function requireAuth(req, res, next) {
  const bearer = req.get("Authorization")?.replace(/^Bearer\s+/i, "");
  const accessToken = bearer || req.cookies[ACCESS_TOKEN_COOKIE];
  if (!accessToken) {
    throw new ApiError(401, "UNAUTHORIZED", "로그인이 필요합니다");
  }

  const supabase = createAuthClient();
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) {
    throw new ApiError(401, "UNAUTHORIZED", "로그인이 필요합니다");
  }

  const user = await findUserByProviderUid(data.user.id);
  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "로그인이 필요합니다");
  }

  req.user = user;
  req.accessToken = accessToken;
  next();
}
