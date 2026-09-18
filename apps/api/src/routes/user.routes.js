import { Router } from "express";

import * as userController from "../controllers/user.controller.js";
import { requireCsrfToken } from "../middlewares/csrf.js";
import { requireAuth } from "../middlewares/require-auth.js";

export const userRouter = Router();

userRouter.get("/me", userController.me);

// 현재 사용자의 랜덤 포인트 추첨을 처리
userRouter.post("/me/random-point", requireAuth, requireCsrfToken, userController.drawRandomPoint);
