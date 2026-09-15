import { Router } from "express";

import * as saleController from "../controllers/sale.controller.js";

export const saleRouter = Router();

// 판매 목록 조회
saleRouter.get("/", saleController.getSales);
