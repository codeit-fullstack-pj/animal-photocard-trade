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
