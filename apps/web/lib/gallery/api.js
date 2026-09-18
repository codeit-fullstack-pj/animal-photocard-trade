import { apiFetch } from "@/lib/api-client";

// gallery 도메인 API — 마이갤러리 페이지에서 사용

// GalleryToolbar 의 정렬 값 → API orderBy
const SORT_TO_ORDER_BY = {
  score_desc: "highestScore",
  score_asc: "lowestScore",
  created_desc: "latest",
  created_asc: "oldest",
};

/**
 * GET /cards — 로그인 유저가 보유한 카드 목록 (페이지네이션)
 * @param {{
 *   page: number,
 *   pageSize: number,
 *   sort: string,          // GalleryToolbar 값 (score_desc 등)
 *   keyword: string,
 *   categories: string[],  // ["DOG", "CAT"]
 * }} params
 * @returns {Promise<{ items: object[], totalCount: number, totalPages: number }>}
 */
export function fetchMyCards({ page, pageSize, sort, keyword, categories }) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  params.set("orderBy", SORT_TO_ORDER_BY[sort] ?? "latest");

  const trimmed = keyword.trim();
  if (trimmed) params.set("keyword", trimmed);
  for (const category of categories) params.append("category", category);

  return apiFetch(`/cards?${params.toString()}`);
}

const PICKER_PAGE_SIZE = 12;

// useInfiniteFetch가 기대하는 { cards, hasNextPage, meta } 형태로 GET /cards 결과를 변환.
// 판매글/교환 제시 등록 시 "내 카드 고르기" 목록에서 쓴다
export async function fetchMyCardsPage({ page, keyword = "", categories = [] }) {
  const result = await fetchMyCards({
    page,
    pageSize: PICKER_PAGE_SIZE,
    sort: "created_desc",
    keyword,
    categories,
  });

  return {
    cards: result.items,
    hasNextPage: page < result.totalPages,
    meta: { categoryCounts: result.categoryCounts },
  };
}
