import { Router } from "express";

import * as cardController from "../controllers/card.controller.js";

export const cardRouter = Router();

// GET /api/v1/cards — 마이갤러리(보유 카드) 목록
cardRouter.get("/cards", cardController.list);
