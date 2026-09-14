import { prisma } from "../lib/prisma.js";

export function countUnread(userId) {
  return prisma.notification.count({ where: { userId, deletedAt: null, isRead: false } });
}
