import { apiFetch, csrfHeaders } from "@/lib/api-client";

// card 도메인 API (포토카드 생성 페이지에서 사용)

// POST /cards — 성공하면 생성된 카드 전체
// { id, ownerId, createdById, imageId, name, category, description, filterType, imageUrl, tag, topScore, score, createdAt, updatedAt }
export async function createCard({ imageId, filterType, name }) {
  return apiFetch("/cards", {
    method: "POST",
    body: { imageId, filterType, name },
    headers: await csrfHeaders(),
  });
}

// GET /cards/remaining-count — 오늘 남은 카드 생성 가능 횟수. 성공하면 { remainingCount, limit }
export function getRemainingCount() {
  return apiFetch("/cards/remaining-count");
}
