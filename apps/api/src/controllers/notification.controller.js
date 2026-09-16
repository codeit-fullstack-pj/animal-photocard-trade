import { ApiError } from "../lib/api-error.js";
import * as notificationService from "../services/notification.service.js";

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
