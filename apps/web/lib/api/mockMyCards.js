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
