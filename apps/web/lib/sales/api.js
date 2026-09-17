import { apiFetch } from "@/lib/api-client";

// 판매 목록 조회에 필요한 쿼리 파라미터를 구성
export function getSales({
  limit,
  category,
  keyword,
  includeSoldOut,
  status,
  sellerId,
  orderBy,
  cursor,
  page,
} = {}) {
  const params = new URLSearchParams();

  if (limit !== undefined) params.set("limit", String(limit));
  if (category) params.set("category", category);
  if (keyword) params.set("keyword", keyword);
  if (includeSoldOut !== undefined) {
    params.set("includeSoldOut", String(includeSoldOut));
  }
  if (status) params.set("status", status);
  if (sellerId) params.set("sellerId", sellerId);
  if (orderBy) params.set("orderBy", orderBy);
  if (cursor) params.set("cursor", cursor);

  // 페이지 번호 기반 페이지네이션을 사용하는 경우 page를 쿼리에 추가
  if (page !== undefined) params.set("page", String(page));

  const queryString = params.toString();

  return apiFetch(`/sales${queryString ? `?${queryString}` : ""}`);
}

// 판매글 등록
export function createSale({ cardId, description, canExchange, price }) {
  return apiFetch("/sales", {
    method: "POST",
    body: { cardId, description, canExchange, price },
  });
}
