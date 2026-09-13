import { prisma } from "../lib/prisma.js";

export function createImage({ uploaderId, imageUrl, category, score }) {
  return prisma.imageData.create({ data: { uploaderId, imageUrl, category, score } });
}
