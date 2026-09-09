import { apiFetch } from "@/lib/api-client";

// auth 도메인 API (/signup, /login 페이지에서 사용). signin, signout도 여기에 추가한다

// POST /auth/signup — 성공하면 { user: { id, nickname, createdAt } }
export function signup({ email, nickname, password, passwordConfirm }) {
  return apiFetch("/auth/signup", {
    method: "POST",
    body: { email, nickname, password, passwordConfirm },
  });
}
