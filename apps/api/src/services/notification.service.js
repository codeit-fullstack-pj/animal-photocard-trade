import { ApiError } from "../lib/api-error.js";
import * as notificationRepository from "../repositories/notification.repository.js";

// 조회한 알림 데이터를 API 응답 형식으로 변환
export async function getNotifications({ userId, cursor, limit = 20 }) {
  const [notifications, unreadCount] = await Promise.all([
    notificationRepository.findMany(userId, { cursor, limit }),
    notificationRepository.countUnread(userId),
  ]);

  // 요청한 개수보다 1개 더 조회됐으면 다음 페이지가 존재
  const hasNextPage = notifications.length > limit;

  // 실제 응답에는 요청한 개수만 포함
  const pageNotifications = hasNextPage ? notifications.slice(0, limit) : notifications;

  // 다음 페이지가 있으면 현재 페이지의 마지막 알림 ID를 cursor로 사용
  const nextCursor = hasNextPage ? pageNotifications[pageNotifications.length - 1].id : null;

  const lists = pageNotifications.map((notification) => ({
    id: notification.id,
    type: notification.type,
    content: notification.content,
    targetId: notification.targetId,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  }));

  return { lists, unreadCount, nextCursor };
}

// 로그인한 유저의 알림을 전부 삭제 처리
export async function deleteAllNotifications(userId) {
  const { count } = await notificationRepository.deleteAll(userId);
  return { deletedCount: count };
}

// 로그인한 유저의 알림을 전부 읽음 처리
export async function markAllNotificationsRead(userId) {
  const { count } = await notificationRepository.markAllRead(userId);
  return { updatedCount: count };
}

// 알림 하나를 읽음/안읽음 처리 — 본인 소유가 아니거나 없으면 404
export async function setNotificationRead(userId, notificationId, isRead) {
  const { count } = await notificationRepository.setRead(userId, notificationId, isRead);
  if (count === 0) {
    throw new ApiError(404, "NOTIFICATION_NOT_FOUND", "알림을 찾을 수 없습니다");
  }
  return { updatedCount: count };
}

// 알림 하나를 삭제 처리 — 본인 소유가 아니거나 없으면 404
export async function deleteNotification(userId, notificationId) {
  const { count } = await notificationRepository.deleteOne(userId, notificationId);
  if (count === 0) {
    throw new ApiError(404, "NOTIFICATION_NOT_FOUND", "알림을 찾을 수 없습니다");
  }
  return { deletedCount: count };
}
