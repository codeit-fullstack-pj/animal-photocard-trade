import { prisma } from "../lib/prisma.js";

export function countUnread(userId) {
  return prisma.notification.count({ where: { userId, deletedAt: null, isRead: false } });
}

// 알림 목록을 최신순으로 조회 (삭제되지 않은 것만)
export function findMany(userId, { cursor, limit }) {
  return prisma.notification.findMany({
    where: { userId, deletedAt: null },

    // 최신순으로 정렬하고 동일한 값은 id로 순서를 고정
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],

    // cursor가 있으면 해당 알림 다음부터 조회
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),

    take: limit + 1,
  });
}

//여러 알람 동시생성 notification = { userId, type, content, targetId } [] 형태
export function createManyNotifications(tx, notifications) {
  return tx.notification.createMany({ data: notifications });
}
