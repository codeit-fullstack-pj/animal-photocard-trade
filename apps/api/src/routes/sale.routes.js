import { Router } from "express";

import * as saleController from "../controllers/sale.controller.js";
import { requireAuth } from "../middlewares/require-auth.js";

export const saleRouter = Router();

// 판매 목록 조회
saleRouter.get("/", saleController.getSales);

// 포인트로 판매 중인 포토카드를 구매
saleRouter.post("/:saleId/purchase", requireAuth, saleController.purchase);
