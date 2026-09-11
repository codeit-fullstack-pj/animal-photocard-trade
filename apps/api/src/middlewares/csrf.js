import { ApiError } from "../lib/api-error.js";
import { CSRF_TOKEN_COOKIE } from "../lib/auth-cookies.js";

export function requireCsrfToken(req, res, next) {
  const fromHeader = req.get("X-CSRF-TOKEN");
  const fromCookie = req.cookies[CSRF_TOKEN_COOKIE];

  if (!fromHeader || !fromCookie || fromHeader !== fromCookie) {
    throw new ApiError(403, "CSRF_TOKEN_INVALID", "CSRF 토큰이 올바르지 않습니다");
  }
  next();
}
