import { apiFetch } from "@/lib/api-client";

// gallery 도메인 API — 마이갤러리 페이지에서 사용

// GalleryToolbar 의 정렬 값 → API orderBy
const SORT_TO_ORDER_BY = {
  score_desc: "highestScore",
  score_asc: "lowestScore",
  created_desc: "latest",
  created_asc: "oldest",
};

// TODO: 인증 연동 시 제거. 지금 API 가 ?ownerId= 를 요구함 (인증 파트 담당 팀원 작업 대기)
const DEV_OWNER_ID = "user-001";

/**
 * GET /cards — 로그인 유저가 보유한 카드 목록 (페이지네이션)
 * @param {{
 *   page: number,
 *   pageSize: number,
 *   sort: string,          // GalleryToolbar 값 (score_desc 등)
 *   keyword: string,
 *   categories: string[],  // ["dog", "cat"]
 * }} params
 * @returns {Promise<{ items: object[], totalCount: number, totalPages: number }>}
 */
export function fetchMyCards({ page, pageSize, sort, keyword, categories }) {
  const params = new URLSearchParams();
  params.set("ownerId", DEV_OWNER_ID);
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  params.set("orderBy", SORT_TO_ORDER_BY[sort] ?? "latest");

  const trimmed = keyword.trim();
  if (trimmed) params.set("keyword", trimmed);
  for (const category of categories) params.append("category", category);

  return apiFetch(`/cards?${params.toString()}`);
}
