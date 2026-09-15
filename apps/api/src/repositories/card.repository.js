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
