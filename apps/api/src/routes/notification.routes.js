import { Router } from "express";

import * as notificationController from "../controllers/notification.controller.js";
import { requireAuth } from "../middlewares/require-auth.js";

export const notificationRouter = Router();

// 로그인한 유저 본인의 알림 목록 조회
notificationRouter.get("/", requireAuth, notificationController.getNotifications);
