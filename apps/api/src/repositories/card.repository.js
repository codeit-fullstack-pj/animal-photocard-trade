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
