import { Router } from "express";

import { requireAuth } from "../middlewares/require-auth.js";
import * as saleController from "../controllers/sale.controller.js";

export const saleRouter = Router();

// POST /sales/:saleId/purchase — 포인트로 판매글 구매
saleRouter.post("/:saleId/purchase", requireAuth, saleController.purchase);
