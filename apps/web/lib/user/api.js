import { apiFetch, csrfHeaders } from "@/lib/api-client";

// 현재 로그인 사용자의 랜덤 포인트 추첨을 요청
export async function drawRandomPoint() {
  return apiFetch("/users/me/random-point", {
    method: "POST",
    headers: await csrfHeaders(),
  });
}
