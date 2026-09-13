import { enums, refine, string, type, validate } from "superstruct";

import { ApiError } from "../lib/api-error.js";
import * as cardService from "../services/card.service.js";

// useImageVariants.js VARIANTS 순서(1 원본 · 2 세피아 · 3 모노 · 4 도트)와 일치
const FILTER_TYPES = [1, 2, 3, 4];
const NonEmpty = refine(string(), "nonEmpty", (value) => value.trim() !== "");

const CreateCardBody = type({
  imageId: NonEmpty,
  filterType: enums(FILTER_TYPES),
  name: NonEmpty,
  description: NonEmpty,
});

const VALIDATION_MESSAGES = {
  imageId: "imageId가 필요합니다",
  filterType: `filterType 은 ${FILTER_TYPES.join(" / ")} 중 하나여야 합니다`,
  name: "포토카드 이름을 입력해 주세요",
  description: "포토카드 설명을 입력해 주세요",
};

export async function create(req, res) {
  const [error, body] = validate(req.body, CreateCardBody);
  if (error) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      VALIDATION_MESSAGES[error.key] ?? "요청 파라미터가 올바르지 않습니다",
    );
  }

  const result = await cardService.createCardFromImage({
    ownerId: req.user.id,
    imageId: body.imageId,
    filterType: body.filterType,
    name: body.name.trim(),
    description: body.description.trim(),
  });
  res.status(201).json({ data: result });
}
