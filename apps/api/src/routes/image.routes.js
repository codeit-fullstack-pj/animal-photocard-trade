import { Router } from "express";
import multer from "multer";

import * as imageController from "../controllers/image.controller.js";
import { ApiError } from "../lib/api-error.js";
import { MIME_EXTENSIONS } from "../services/image.service.js";
import { apiRateLimit } from "../middlewares/rate-limit.js";
import { requireCsrfToken } from "../middlewares/csrf.js";
import { requireAuth } from "../middlewares/require-auth.js";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = Object.keys(MIME_EXTENSIONS);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
  fileFilter(req, file, cb) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(
        new ApiError(
          400,
          "VALIDATION_ERROR",
          "jpg / png / webp / gif 이미지만 업로드할 수 있습니다",
        ),
      );
      return;
    }
    cb(null, true);
  },
});

export const imageRouter = Router();

// POST /api/v1/images/upload — multipart/form-data { image: File, category: "DOG" | "CAT" }
imageRouter.post(
  "/upload",
  apiRateLimit,
  requireAuth,
  requireCsrfToken,
  upload.single("image"),
  imageController.upload,
);
