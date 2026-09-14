import { apiFetch } from "@/lib/api-client";

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

// 로그아웃·토큰 재발급은 X-CSRF-TOKEN 헤더가 필요하다.
// 웹과 API 도메인이 달라 쿠키를 직접 읽을 수 없으므로 서버에 값을 물어본 뒤 헤더로 보낸다
async function csrfHeaders() {
  const { csrfToken } = await apiFetch("/auth/csrf-token");
  return { "X-CSRF-TOKEN": csrfToken };
}

// POST /auth/signout — 204
export async function signout() {
  return apiFetch("/auth/signout", { method: "POST", headers: await csrfHeaders() });
}

// POST /auth/refresh-token — 성공하면 { accessToken }
export async function refreshAccessToken() {
  return apiFetch("/auth/refresh-token", { method: "POST", headers: await csrfHeaders() });
}
