import { Router } from "express";

import * as exchangeController from "../controllers/exchange.controller.js";
import { requireAuth } from "../middlewares/require-auth.js";
import { exchangeActionRateLimit } from "../middlewares/rate-limit.js";

export const exchangeRouter = Router();

exchangeRouter.post(
  "/:exchangeId/cancel",
  exchangeActionRateLimit,
  requireAuth,
  exchangeController.cancelMyExchange,
);

exchangeRouter.post(
  "/:exchangeId/accept",
  exchangeActionRateLimit,
  requireAuth,
  exchangeController.acceptExchange,
);

exchangeRouter.post(
  "/:exchangeId/reject",
  exchangeActionRateLimit,
  requireAuth,
  exchangeController.rejectExchange,
);
