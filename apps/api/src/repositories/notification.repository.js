import { prisma } from "../lib/prisma.js";

export function countUnread(userId) {
  return prisma.notification.count({ where: { userId, deletedAt: null, isRead: false } });
}

//여러 알람 동시생성 notification = { userId, type, content, targetId } [] 형태
export function createManyNotifications(tx, notifications) {
  return tx.notification.createMany({ data: notifications });
}
