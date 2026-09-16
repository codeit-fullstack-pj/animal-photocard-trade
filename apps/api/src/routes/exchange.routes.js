import { Router } from "express";

import * as exchangeController from "../controllers/exchange.controller.js";
import { requireAuth } from "../middlewares/require-auth.js";

export const exchangeRouter = Router();

exchangeRouter.post("/:exchangeId/cancel", requireAuth, exchangeController.cancelExchange);
