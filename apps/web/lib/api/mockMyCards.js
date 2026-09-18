import { mockCards } from "@/mocks/cards";

const WHITESPACE_PATTERN = /\s+/g;
export async function fetchMockMyCards({
  page = 1,
  limit = 6,
  keyword = "",
  categories = [],
} = {}) {
  const norlmalizedKeyword = keyword.replace(WHITESPACE_PATTERN, "");
  const filteredCards = mockCards.filter(
    (card) =>
      card.name.replace(WHITESPACE_PATTERN, "").includes(norlmalizedKeyword) &&
      (categories.length === 0 || categories.includes(card.category)),
  );
  const startIndex = (page - 1) * limit;
  const cards = filteredCards.slice(startIndex, startIndex + limit);

  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    cards,
    hasNextPage: startIndex + limit < filteredCards.length,
  };
}

// 카테고리 필터 바텀시트에 개수를 보여주기 위한 집계. 카테고리 선택 자체는 무시하고
// keyword만 반영한다 (그래야 강아지를 선택해도 고양이 개수가 그대로 보인다)
export function getMockCategoryCounts(keyword = "") {
  const normalizedKeyword = keyword.replace(WHITESPACE_PATTERN, "");
  const matched = mockCards.filter((card) =>
    card.name.replace(WHITESPACE_PATTERN, "").includes(normalizedKeyword),
  );

  return matched.reduce((counts, card) => {
    counts[card.category] = (counts[card.category] ?? 0) + 1;
    return counts;
  }, {});
}
