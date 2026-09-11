import { ApiError } from "../lib/api-error.js";
import { findCardsAndCount } from "../repositories/card.repository.js";
import { findUserById } from "../repositories/user.repository.js";

// orderBy 파라미터 → Prisma orderBy
const ORDER_BY_CLAUSE = {
  highestScore: [{ topScore: "desc" }, { createdAt: "desc" }],
  lowestScore: [{ topScore: "asc" }, { createdAt: "desc" }],
  latest: [{ createdAt: "desc" }],
  oldest: [{ createdAt: "asc" }],
};

/**
 * 특정 유저가 보유(ownerId)한 카드 목록 (마이갤러리).
 * @param {{
 *   ownerId: string,
 *   page: number,
 *   pageSize: number,
 *   orderBy: keyof typeof ORDER_BY_CLAUSE,
 *   keyword: string,
 *   categories: ("DOG" | "CAT")[],
 * }} params
 */
export async function listCards({ ownerId, page, pageSize, orderBy, keyword, categories }) {
  const owner = await findUserById(ownerId);
  if (!owner) {
    throw new ApiError(404, "USER_NOT_FOUND", "해당 유저를 찾을 수 없습니다");
  }

  const where = {
    ownerId,
    ...(keyword ? { name: { contains: keyword, mode: "insensitive" } } : {}),
    ...(categories.length > 0 ? { image: { category: { in: categories } } } : {}),
  };

  const [cards, totalCount] = await findCardsAndCount({
    where,
    orderBy: ORDER_BY_CLAUSE[orderBy],
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return {
    items: cards.map(toCardResponse),
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

function toCardResponse(card) {
  return {
    id: card.id,
    ownerId: card.ownerId,
    createdById: card.createdById,
    name: card.name,
    category: card.image.category,
    imageUrl: card.image.imageUrl,
    filterType: card.filterType,
    tag: card.tag,
    score: card.image.score,
    topScore: card.topScore,
    description: card.description,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  };
}
