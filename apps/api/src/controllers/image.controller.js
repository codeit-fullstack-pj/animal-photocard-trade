import { enums, type, validate } from "superstruct";

import { ApiError } from "../lib/api-error.js";
import * as imageService from "../services/image.service.js";

const CATEGORY = ["DOG", "CAT"];

const UploadImageBody = type({ category: enums(CATEGORY) });

const VALIDATION_MESSAGES = {
  category: `category 는 ${CATEGORY.join(" / ")} 만 가능합니다`,
};

export async function upload(req, res) {
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
