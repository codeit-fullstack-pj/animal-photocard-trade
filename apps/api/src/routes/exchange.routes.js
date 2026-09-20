import { Router } from "express";

import * as exchangeController from "../controllers/exchange.controller.js";
import { requireAuth } from "../middlewares/require-auth.js";

export const exchangeRouter = Router();

exchangeRouter.post("/:exchangeId/cancel", requireAuth, exchangeController.cancelMyExchange);

exchangeRouter.post("/:exchangeId/accept", requireAuth, exchangeController.acceptExchange);

// exchangeRouter.post("/:exchangeId/reject", requireAuth, exchangeController.rejectExchange);
