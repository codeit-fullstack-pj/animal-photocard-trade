import { ApiError } from "../lib/api-error.js";
import { deriveCardTag } from "../lib/card-flavor.js";
import { createCard, findCardsAndCount } from "../repositories/card.repository.js";
import { findImageById } from "../repositories/image.repository.js";
import { findUserById } from "../repositories/user.repository.js";

const PRISMA_UNIQUE_CONSTRAINT_CODE = "P2002";

// orderBy 파라미터 → Prisma orderBy
const ORDER_BY_CLAUSE = {
  highestScore: [{ topScore: "desc" }, { createdAt: "desc" }],
  lowestScore: [{ topScore: "asc" }, { createdAt: "desc" }],
  latest: [{ createdAt: "desc" }],
  oldest: [{ createdAt: "asc" }],
};

export async function createCardFromImage({ ownerId, imageId, filterType, name, description }) {
  const image = await findImageById(imageId);
  // 존재하지 않는 이미지와 "남의 이미지"를 구분해서 응답하면 다른 사람의 imageId 존재 여부가 새어나가므로 똑같이 404 처리한다
  if (!image || image.uploaderId !== ownerId) {
    throw new ApiError(404, "IMAGE_NOT_FOUND", "이미지를 찾을 수 없습니다");
  }

  const topScore = Math.max(...image.score.axes.map((axis) => axis.value));
  const tag = deriveCardTag(image.category, image.score.axes);

  let card;
  try {
    card = await createCard({
      ownerId,
      createdById: ownerId,
      imageId,
      name,
      filterType,
      tag,
      topScore,
      description,
    });
  } catch (error) {
    // Card.imageId 는 @unique — 이미 카드로 쓰인 이미지로 또 만들려고 하면 여기서 걸린다
    // (뒤로가기로 되돌아온 폼 재제출, 중복 탭, 요청 재시도 등으로 발생 가능)
    if (error.code === PRISMA_UNIQUE_CONSTRAINT_CODE) {
      throw new ApiError(409, "IMAGE_ALREADY_USED", "이미 카드로 만들어진 이미지입니다");
    }
    throw error;
  }

  return toCardResponse(card);
}

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
    // id(유일값)를 마지막 기준으로 추가해 동점/동시각 행의 순서를 페이지 간에도 고정한다 (안 그러면 페이지네이션에서 중복·누락 발생 가능)
    orderBy: [...ORDER_BY_CLAUSE[orderBy], { id: "asc" }],
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
    imageId: card.imageId,
    name: card.name,
    category: card.image.category,
    description: card.description,
    filterType: card.filterType,
    imageUrl: card.image.imageUrl,
    tag: card.tag,
    topScore: card.topScore,
    score: card.image.score,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  };
}
