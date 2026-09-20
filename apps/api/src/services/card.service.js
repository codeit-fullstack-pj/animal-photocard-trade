import { ApiError } from "../lib/api-error.js";
import { deriveCardDescription, deriveCardTag } from "../lib/card-flavor.js";
import {
  countCardsByCategory,
  countCardsCreatedSince,
  createCard,
  findCardsAndCount,
} from "../repositories/card.repository.js";
import { findImageById } from "../repositories/image.repository.js";
import { findUserById } from "../repositories/user.repository.js";

const PRISMA_UNIQUE_CONSTRAINT_CODE = "P2002";
const DAILY_CREATE_LIMIT = 5;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const CATEGORY_VALUES = ["DOG", "CAT"];

// orderBy 파라미터 → Prisma orderBy
const ORDER_BY_CLAUSE = {
  highestScore: [{ topScore: "desc" }, { createdAt: "desc" }],
  lowestScore: [{ topScore: "asc" }, { createdAt: "desc" }],
  latest: [{ createdAt: "desc" }],
  oldest: [{ createdAt: "asc" }],
};

export async function createCardFromImage({ ownerId, imageId, filterType, name }) {
  const usedToday = await countCardsCreatedSince({
    createdById: ownerId,
    since: startOfTodayKst(),
  });
  if (usedToday >= DAILY_CREATE_LIMIT) {
    throw new ApiError(
      429,
      "DAILY_CREATE_LIMIT_EXCEEDED",
      "오늘 생성 가능한 카드 횟수를 모두 사용했습니다",
    );
  }

  const image = await findImageById(imageId);
  // 존재하지 않는 이미지와 "남의 이미지"를 구분해서 응답하면 다른 사람의 imageId 존재 여부가 새어나가므로 똑같이 404 처리한다
  if (!image || image.uploaderId !== ownerId) {
    throw new ApiError(404, "IMAGE_NOT_FOUND", "이미지를 찾을 수 없습니다");
  }

  const topScore = Math.max(...image.score.axes.map((axis) => axis.value));
  const tag = deriveCardTag(image.category, image.score.axes);
  // 사용자가 직접 입력하던 설명을 ML 1·2등 축 조합 기반 자동 생성으로 대체 (카테고리당 12가지 × 2모델 = 24가지)
  const description = deriveCardDescription(image.category, image.score.axes);

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

  // 카테고리 필터를 뺀 조건 — 필터 UI에 "카테고리별 개수"를 보여줄 때는 다른 카테고리를
  // 골랐을 때의 개수도 알아야 해서, 지금 고른 카테고리로 좁히기 전 기준으로 센다
  const baseWhere = {
    ownerId,
    ...(keyword ? { name: { contains: keyword, mode: "insensitive" } } : {}),
    // 판매 중이거나(Sale.status=ON_SALE) 교환을 제시한(Exchange.status=PENDING) 카드는
    // 마이갤러리에서 숨긴다 — 이미 판매·교환에 걸려 있어 지금 다시 팔거나 제시할 수 없는 카드라서
    NOT: {
      OR: [
        { sales: { some: { status: "ON_SALE" } } },
        { offeredExchanges: { some: { status: "PENDING" } } },
      ],
    },
  };
  const where = {
    ...baseWhere,
    ...(categories.length > 0 ? { image: { category: { in: categories } } } : {}),
  };

  const [[cards, totalCount], categoryCountValues] = await Promise.all([
    findCardsAndCount({
      where,
      // id(유일값)를 마지막 기준으로 추가해 동점/동시각 행의 순서를 페이지 간에도 고정한다 (안 그러면 페이지네이션에서 중복·누락 발생 가능)
      orderBy: [...ORDER_BY_CLAUSE[orderBy], { id: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    countCardsByCategory({ baseWhere, categoryValues: CATEGORY_VALUES }),
  ]);

  return {
    items: cards.map(toCardResponse),
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    categoryCounts: Object.fromEntries(
      CATEGORY_VALUES.map((category, i) => [category, categoryCountValues[i]]),
    ),
  };
}

// 오늘(KST 기준) 만든 카드 수를 빼고 남은 생성 가능 횟수. 서버 지역 설정과 무관하게 UTC 연산으로 KST 자정을 구한다
export async function getRemainingCreateCount(userId) {
  const usedToday = await countCardsCreatedSince({
    createdById: userId,
    since: startOfTodayKst(),
  });
  return { remainingCount: Math.max(0, DAILY_CREATE_LIMIT - usedToday), limit: DAILY_CREATE_LIMIT };
}

// 지금 이 순간의 KST 날짜로 자정을 구해서, 그 시각의 UTC 타임스탬프로 돌려준다
function startOfTodayKst() {
  const kstNow = new Date(Date.now() + KST_OFFSET_MS);
  const kstMidnight = Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate());
  return new Date(kstMidnight - KST_OFFSET_MS);
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
