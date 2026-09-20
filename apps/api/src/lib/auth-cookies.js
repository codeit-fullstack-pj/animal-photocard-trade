import { randomUUID } from "node:crypto";

export const ACCESS_TOKEN_COOKIE = "accessToken";
export const REFRESH_TOKEN_COOKIE = "refreshToken";
export const CSRF_TOKEN_COOKIE = "csrfToken";
export const OAUTH_VERIFIER_COOKIE = "oauthCodeVerifier";

const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30일
const OAUTH_VERIFIER_MAX_AGE = 10 * 60 * 1000; // 소셜 로그인 왕복에 충분한 10분

// 배포에서는 웹과 API 도메인이 다르므로(교차 사이트) 쿠키가 오가려면 sameSite: "none" + secure(https)가 필요하다.
// 교차 사이트 배포는 CORS_ENABLED=true 로 켜므로, 그 값으로 배포 여부를 판단한다.
// 로컬(CORS_ENABLED=false, http://localhost:3000 ↔ 4000)은 같은 사이트이고 http라서 lax + secure 끔
const isCrossSite = process.env.CORS_ENABLED === "true";
const BASE_OPTIONS = {
  httpOnly: true,
  secure: isCrossSite,
  sameSite: isCrossSite ? "none" : "lax",
  path: "/",
};

// 로그인·토큰 재발급 후 토큰을 쿠키로 내려준다. CSRF 쿠키는 여기서 건드리지 않는다
// (재발급 때마다 CSRF 값이 바뀌면 클라이언트가 들고 있던 값이 무효가 되어 다음 요청이 403이 난다)
export function setAuthCookies(res, { accessToken, refreshToken, expiresIn = 60 * 60 }) {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, { ...BASE_OPTIONS, maxAge: expiresIn * 1000 });
  if (refreshToken) {
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...BASE_OPTIONS,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  }
}

// CSRF 토큰 쿠키를 새로 발급하고 그 값을 돌려준다.
// 도메인이 다르면 웹 JS가 이 쿠키를 읽을 수 없으므로 값은 GET /auth/csrf-token 응답으로 따로 알려준다
export function setCsrfCookie(res) {
  const token = randomUUID();
  res.cookie(CSRF_TOKEN_COOKIE, token, { ...BASE_OPTIONS, maxAge: REFRESH_TOKEN_MAX_AGE });
  return token;
}

export function clearAuthCookies(res) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, BASE_OPTIONS);
  res.clearCookie(REFRESH_TOKEN_COOKIE, BASE_OPTIONS);
  res.clearCookie(CSRF_TOKEN_COOKIE, BASE_OPTIONS);
}

export function setOAuthVerifierCookie(res, codeVerifier) {
  res.cookie(OAUTH_VERIFIER_COOKIE, codeVerifier, {
    ...BASE_OPTIONS,
    maxAge: OAUTH_VERIFIER_MAX_AGE,
  });
}

export function clearOAuthVerifierCookie(res) {
  res.clearCookie(OAUTH_VERIFIER_COOKIE, BASE_OPTIONS);
}
