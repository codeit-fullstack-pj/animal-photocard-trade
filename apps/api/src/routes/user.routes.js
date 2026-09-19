import { Router } from "express";

import * as userController from "../controllers/user.controller.js";
import { requireCsrfToken } from "../middlewares/csrf.js";
import { currentUserRateLimit, randomPointRateLimit } from "../middlewares/rate-limit.js";
import { requireAuth } from "../middlewares/require-auth.js";

export const userRouter = Router();

userRouter.get("/me", currentUserRateLimit, userController.me);

// 현재 사용자의 랜덤 포인트 추첨을 처리
userRouter.post(
  "/me/random-point",
  randomPointRateLimit,
  requireAuth,
  requireCsrfToken,
  userController.drawRandomPoint,
);
