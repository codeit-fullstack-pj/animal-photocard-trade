import { Router } from "express";

import * as saleController from "../controllers/sale.controller.js";
import { requireAuth } from "../middlewares/require-auth.js";

export const saleRouter = Router();

// 판매 목록 조회
saleRouter.get("/", saleController.getSales);

// 판매글 등록
saleRouter.post("/", requireAuth, saleController.createSale);

// 포인트로 판매 중인 포토카드를 구매
saleRouter.post("/:saleId/purchase", requireAuth, saleController.purchase);

// POST /sales/:saleId/exchanges — 판매글에 내 카드로 교환 제시
saleRouter.post("/:saleId/exchanges", requireAuth, saleController.createExchange);

// GET /sales/:saleId/exchanges — 판매글의 교환 제시 목록 (보는 사람에 따라 결과가 다르다)
saleRouter.get("/:saleId/exchanges", requireAuth, saleController.listExchanges);

// 판매글 상세 조회
saleRouter.get("/:id", saleController.getSaleById);

// 판매글 수정
saleRouter.patch("/:id", requireAuth, saleController.updateSale);

// 판매글 취소
saleRouter.patch("/:id/cancel", requireAuth, saleController.cancelSale);
