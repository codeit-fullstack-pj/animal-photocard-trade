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
