import { apiFetch, csrfHeaders } from "@/lib/api-client";

// card 도메인 API (포토카드 생성 페이지에서 사용)

// POST /cards — 성공하면 생성된 카드 전체
// { id, ownerId, createdById, imageId, name, category, description, filterType, imageUrl, tag, topScore, score, createdAt, updatedAt }
export async function createCard({ imageId, filterType, name, description }) {
  return apiFetch("/cards", {
    method: "POST",
    body: { imageId, filterType, name, description },
    headers: await csrfHeaders(),
  });
}
