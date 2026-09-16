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
