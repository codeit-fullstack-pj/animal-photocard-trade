import { refine, string, type, validate } from "superstruct";

import { ApiError } from "../lib/api-error.js";
import * as exchangeService from "../services/exchange.service.js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// sale.controller.js의 Uuid 상수와 같은 방식
const Uuid = refine(string(), "uuid", (value) => UUID_PATTERN.test(value));

const Params = type({
  exchangeId: Uuid,
});

// POST /exchanges/:exchangeId/cancel — 자신이 제시한 교환을 취소
export async function cancelMyExchange(req, res) {
  const [error, params] = validate(req.params, Params);

  if (error) {
    throw new ApiError(400, "VALIDATION_ERROR", "exchangeId는 UUID 형식이어야 합니다");
  }

  // 제시자는 requireAuth 미들웨어의 req.user에서만 가져온다 (경로 파라미터로 안 받음)
  const result = await exchangeService.cancelExchange({
    exchangeId: params.exchangeId,
    offerer: req.user,
  });

  res.json({ data: result });
}

// POST /exchanges/:exchangeId/accept - 교환 수락
export async function acceptExchange(req, res) {
  const [error, params] = validate(req.params, Params);

  if (error) {
    throw new ApiError(400, "VALIDATION_ERROR", "exchangeId는 UUID 형식이어야 합니다");
  }

  const result = await exchangeService.acceptExchange({
    exchangeId: params.exchangeId,
    seller: req.user,
  });

  res.json({ data: result });
}

// POST /exchanges/:exchangeId/reject - 교환 수락
export async function rejectExchange(req, res) {
  const [error, params] = validate(req.params, Params);

  if (error) {
    throw new ApiError(400, "VALIDATION_ERROR", "exchangeId는 UUID 형식이어야 합니다");
  }

  const result = await exchangeService.rejectExchange({
    exchangeId: params.exchangeId,
    seller: req.user,
  });

  res.json({ data: result });
}
