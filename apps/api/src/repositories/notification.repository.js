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

// 아직 삭제되지 않은 알림을 전부 삭제 처리(soft delete, deletedAt 기록)
export function deleteAll(userId) {
  return prisma.notification.updateMany({
    where: { userId, deletedAt: null },
    data: { deletedAt: new Date() },
  });
}

// 삭제되지 않은 안읽음 알림을 전부 읽음 처리
export function markAllRead(userId) {
  return prisma.notification.updateMany({
    where: { userId, deletedAt: null, isRead: false },
    data: { isRead: true },
  });
}

// 알림 하나를 읽음/안읽음 처리 — where에 userId를 같이 걸어서 본인 것만, updateMany라 없거나 남의 것이면 count 0
export function setRead(userId, notificationId, isRead) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId, deletedAt: null },
    data: { isRead },
  });
}

// 알림 하나를 삭제 처리(soft delete)
export function deleteOne(userId, notificationId) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId, deletedAt: null },
    data: { deletedAt: new Date() },
  });
}
