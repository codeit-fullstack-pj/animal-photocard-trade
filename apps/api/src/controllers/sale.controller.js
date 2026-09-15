import { refine, string, type, validate } from "superstruct";

import { ApiError } from "../lib/api-error.js";
import * as saleService from "../services/sale.service.js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

//POST /sales/:saleId/purchase

//:saleId struct validation
const PurchaseParams = type({
  saleId: refine(string(), "uuid", (value) => UUID_PATTERN.test(value)),
});

export async function purchase(req, res) {
  const [error, params] = validate(req.params, PurchaseParams);
  if (error) {
    throw new ApiError(400, "VALIDATION_ERROR", "saleId는 UUID 형식이어야 합니다");
  }

  //buyerId from require-Auth middleware
  const result = await saleService.purchaseCard({
    saleId: params.saleId,
    buyer: req.user,
  });

  res.json({ data: result });
}
