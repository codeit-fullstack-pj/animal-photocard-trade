import { apiFetch, csrfHeaders } from "@/lib/api-client";

// auth 도메인 API (/signup, /login 페이지에서 사용). 소셜 로그인은 API 주소로 이동만 하므로 여기에 없다

// POST /auth/signup — 성공하면 { user: { id, nickname, createdAt } }
export function signup({ email, nickname, password, passwordConfirm }) {
  return apiFetch("/auth/signup", {
    method: "POST",
    body: { email, nickname, password, passwordConfirm },
  });
}

// POST /auth/signin — 성공하면 { user, accessToken, refreshToken }. 토큰은 httpOnly 쿠키에도 심어진다
export function signin({ email, password }) {
  return apiFetch("/auth/signin", { method: "POST", body: { email, password } });
}

// GET /auth/me — 로그인한 유저 정보. 성공하면 { user }, 로그인 안 했으면 401
export function getCurrentUser() {
  return apiFetch("/auth/me");
}

// POST /auth/signout — 204
export async function signout() {
  return apiFetch("/auth/signout", { method: "POST", headers: await csrfHeaders() });
}

// POST /auth/refresh-token — 성공하면 { accessToken }
export async function refreshAccessToken() {
  return apiFetch("/auth/refresh-token", { method: "POST", headers: await csrfHeaders() });
}
