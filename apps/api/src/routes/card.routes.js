import { Router } from "express";

import * as cardController from "../controllers/card.controller.js";
import { requireCsrfToken } from "../middlewares/csrf.js";
import { requireAuth } from "../middlewares/require-auth.js";

export const cardRouter = Router();

// GET /api/v1/cards — 마이갤러리(보유 카드) 목록
cardRouter.get("/cards", cardController.list);
// POST /api/v1/cards — 업로드된 이미지(imageId)로 포토카드 생성
cardRouter.post("/cards", requireAuth, requireCsrfToken, cardController.create);
