import { Router } from "express";

import * as notificationController from "../controllers/notification.controller.js";
import { requireAuth } from "../middlewares/require-auth.js";

export const notificationRouter = Router();

// 로그인한 유저 본인의 알림 목록 조회
notificationRouter.get("/", requireAuth, notificationController.getNotifications);

// 로그인한 유저 본인의 알림 전체 삭제
notificationRouter.patch("/delete-all", requireAuth, notificationController.deleteAllNotifications);

// 로그인한 유저 본인의 알림 전체 읽음 처리
notificationRouter.patch("/read-all", requireAuth, notificationController.markAllNotificationsRead);

// 로그인한 유저 본인의 알림 하나 읽음/삭제 처리
notificationRouter.patch("/:notiId/read", requireAuth, notificationController.markNotificationRead);
notificationRouter.patch("/:notiId/delete", requireAuth, notificationController.deleteNotification);
