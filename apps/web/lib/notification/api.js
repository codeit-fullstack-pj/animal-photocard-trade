import { apiFetch } from "@/lib/api-client";

// notification 도메인 API (Notification.jsx의 알림 드롭다운에서 사용)

// GET /notification — 로그인한 유저의 알림 목록(최신순, 커서 페이지네이션).
// 성공하면 { lists, unreadCount, nextCursor }
export function getNotifications({ cursor, limit } = {}) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", String(limit));

  const query = params.toString();
  return apiFetch(`/notification${query ? `?${query}` : ""}`);
}

// PATCH /notification/delete-all — 로그인한 유저의 알림 전체 삭제. 성공하면 { deletedCount }
export function deleteAllNotifications() {
  return apiFetch("/notification/delete-all", { method: "PATCH" });
}

// PATCH /notification/read-all — 로그인한 유저의 알림 전체 읽음 처리. 성공하면 { updatedCount }
export function markAllNotificationsRead() {
  return apiFetch("/notification/read-all", { method: "PATCH" });
}

// PATCH /notification/:notiId/read — 알림 하나를 읽음 처리. 성공하면 { updatedCount }
export function markNotificationRead(notiId) {
  return apiFetch(`/notification/${notiId}/read`, { method: "PATCH" });
}

// PATCH /notification/:notiId/delete — 알림 하나를 삭제. 성공하면 { deletedCount }
export function deleteNotification(notiId) {
  return apiFetch(`/notification/${notiId}/delete`, { method: "PATCH" });
}
