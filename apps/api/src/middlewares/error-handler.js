import { ApiError } from "../lib/api-error.js";

export function notFoundHandler(req, res) {
  res
    .status(404)
    .json({ code: "NOT_FOUND", message: `${req.method} ${req.originalUrl} 경로가 없습니다` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, next) {
  if (error instanceof ApiError) {
    res.status(error.status).json({ code: error.code, message: error.message });
    return;
  }

  if (error.type === "entity.parse.failed") {
    res
      .status(400)
      .json({ code: "VALIDATION_ERROR", message: "요청 본문이 올바른 JSON이 아닙니다" });
    return;
  }

  console.error(error);
  res.status(500).json({ code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다" });
}
