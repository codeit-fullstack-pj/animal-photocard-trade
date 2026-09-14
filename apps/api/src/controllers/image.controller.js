import { enums, type, validate } from "superstruct";

import { ApiError } from "../lib/api-error.js";
import { CSRF_TOKEN_COOKIE } from "../lib/auth-cookies.js";
import * as imageService from "../services/image.service.js";

const CATEGORY = ["DOG", "CAT"];

const UploadImageBody = type({ category: enums(CATEGORY) });

const VALIDATION_MESSAGES = {
  category: `category 는 ${CATEGORY.join(" / ")} 만 가능합니다`,
};

export async function upload(req, res) {
  // POST /images/upload는 상태를 바꾸는 요청이라 CSRF 토큰을 직접 검증한다 (double-submit cookie 방식:
  // 헤더 값과 쿠키 값이 같아야 통과 — 공격 사이트는 쿠키를 읽을 수 없어 헤더를 못 맞춘다)
  const fromHeader = req.get("X-CSRF-TOKEN");
  const fromCookie = req.cookies[CSRF_TOKEN_COOKIE];
  if (!fromHeader || !fromCookie || fromHeader !== fromCookie) {
    throw new ApiError(403, "CSRF_TOKEN_INVALID", "CSRF 토큰이 올바르지 않습니다");
  }

  if (!req.file) {
    throw new ApiError(400, "VALIDATION_ERROR", "image 파일이 필요합니다");
  }

  const [error, body] = validate(req.body, UploadImageBody);
  if (error) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      VALIDATION_MESSAGES[error.key] ?? "요청 파라미터가 올바르지 않습니다",
    );
  }

  const result = await imageService.uploadImage({
    uploaderId: req.user.id,
    authUid: req.user.providerUid,
    accessToken: req.accessToken,
    category: body.category,
    file: req.file,
  });
  res.status(201).json({ data: result });
}
