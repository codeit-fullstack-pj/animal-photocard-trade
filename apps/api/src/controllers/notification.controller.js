import { refine, string, type, validate } from "superstruct";

import { ApiError } from "../lib/api-error.js";
import * as notificationService from "../services/notification.service.js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /notification 쿼리 파라미터를 확인하고 로그인한 유저의 알림 목록을 반환
export async function getNotifications(req, res) {
  const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);
  const cursor = req.query.cursor;

  if (!Number.isInteger(limit) || limit < 1) {
    throw new ApiError(400, "VALIDATION_ERROR", "limit은 1 이상의 정수여야 합니다");
  }

  // cursor가 전달되면 빈 값은 허용하지 않음
  if (cursor !== undefined && cursor.trim() === "") {
    throw new ApiError(400, "VALIDATION_ERROR", "cursor 값이 올바르지 않습니다");
  }

  const { lists, unreadCount, nextCursor } = await notificationService.getNotifications({
    userId: req.user.id,
    cursor,
    limit,
  });

  res.status(200).json({
    data: {
      lists,
      unreadCount,
      nextCursor,
    },
  });
}

// PATCH /notification/delete-all 로그인한 유저의 알림을 전부 삭제 처리
export async function deleteAllNotifications(req, res) {
  const result = await notificationService.deleteAllNotifications(req.user.id);
  res.status(200).json({ data: result });
}

// PATCH /notification/read-all 로그인한 유저의 알림을 전부 읽음 처리
export async function markAllNotificationsRead(req, res) {
  const result = await notificationService.markAllNotificationsRead(req.user.id);
  res.status(200).json({ data: result });
}

// notiId가 UUID 형식인지 확인
const NotificationIdParams = type({
  notiId: refine(string(), "uuid", (value) => UUID_PATTERN.test(value)),
});

// notiId를 검증해서 돌려주고, 형식이 아니면 바로 400을 던짐
function getValidNotiId(req) {
  const [error, params] = validate(req.params, NotificationIdParams);
  if (error) {
    throw new ApiError(400, "VALIDATION_ERROR", "notiId는 UUID 형식이어야 합니다");
  }
  return params.notiId;
}

// PATCH /notification/:notiId/read 알림 하나를 읽음 처리
export async function markNotificationRead(req, res) {
  const notiId = getValidNotiId(req);
  const result = await notificationService.setNotificationRead(req.user.id, notiId, true);
  res.status(200).json({ data: result });
}

// PATCH /notification/:notiId/notread 알림 하나를 안읽음 처리
export async function markNotificationUnread(req, res) {
  const notiId = getValidNotiId(req);
  const result = await notificationService.setNotificationRead(req.user.id, notiId, false);
  res.status(200).json({ data: result });
}

// PATCH /notification/:notiId/delete 알림 하나를 삭제 처리
export async function deleteNotification(req, res) {
  const notiId = getValidNotiId(req);
  const result = await notificationService.deleteNotification(req.user.id, notiId);
  res.status(200).json({ data: result });
}
