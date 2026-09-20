import { prisma } from "../lib/prisma.js";

export function createCard({
  ownerId,
  createdById,
  imageId,
  name,
  filterType,
  tag,
  topScore,
  description,
}) {
  return prisma.card.create({
    data: { ownerId, createdById, imageId, name, filterType, tag, topScore, description },
    include: { image: true },
  });
}

// 목록 + 전체 개수를 한 트랜잭션으로. image(ImageData)를 조인해 category·imageUrl·score를 함께 가져온다
export function findCardsAndCount({ where, orderBy, skip, take }) {
  return prisma.$transaction([
    prisma.card.findMany({ where, orderBy, skip, take, include: { image: true } }),
    prisma.card.count({ where }),
  ]);
}

// since 이후 해당 유저가 만든(창작자 기준) 카드 개수. 하루 생성 한도 계산에 쓴다
export function countCardsCreatedSince({ createdById, since }) {
  return prisma.card.count({ where: { createdById, createdAt: { gte: since } } });
}

// baseWhere(카테고리 필터는 뺀 조건)를 기준으로 카테고리별 개수를 한 번에 센다.
// category는 Card가 아니라 조인된 ImageData 쪽 필드라 Prisma groupBy로는 못 묶어서, 카테고리 수만큼 count를 나눠 돌린다
export function countCardsByCategory({ baseWhere, categoryValues }) {
  return prisma.$transaction(
    categoryValues.map((category) =>
      prisma.card.count({ where: { ...baseWhere, image: { category } } }),
    ),
  );
}

//교환 또는 구매 진행중인 카드 행 잠금 (SQL예외 LOCK처리)
export function lockCardForUpdate(tx, cardId) {
  return tx.$queryRaw`SELECT * FROM "Card" WHERE id = ${cardId} FOR UPDATE`;
}

//카드 소유권 이전
// 판매·교환에서 동일 카드 잠금과 상태 검증을 보장하면 소유자 불일치는 방지되며,
// ownerId 검증은 기존 데이터 불일치에 대비한 추가 방어다.
export function transferCardOwner(tx, cardId, sellerId, buyerId) {
  return tx.card.updateMany({
    where: { id: cardId, ownerId: sellerId },
    data: { ownerId: buyerId },
  });
}

// 교환 제시(createExchange) 트랜잭션 전용 — 존재 확인 + 소유자 확인용 단순 조회
export function findCardById(tx, cardId) {
  return tx.card.findUnique({ where: { id: cardId } });
}
