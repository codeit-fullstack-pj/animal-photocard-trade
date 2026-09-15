import express from "express";
import { getSaleById, updateSale, cancelSale } from "../controllers/saleControllers.js";

const router = express.Router();

router.get("/sales/:id", getSaleById);
router.patch("/sales/:id", updateSale);
router.patch("/sales/:id/cancel", cancelSale);

export const saleRouter = router;
