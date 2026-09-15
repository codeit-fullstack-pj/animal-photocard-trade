import { ApiError } from "../lib/api-error.js";
import * as saleService from "../services/sale.service.js";

// GET /sales 쿼리 파라미터를 확인하고 판매 목록을 반환
export async function getSales(req, res) {
  const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);
  const category = req.query.category;
  const keyword = req.query.keyword?.trim() || undefined;
  const soldOut = req.query.soldOut;
  const status = req.query.status;
  const sellerId = req.query.sellerId;
  const orderBy = req.query.orderBy;
  const cursor = req.query.cursor;

  if (!Number.isInteger(limit) || limit < 1) {
    throw new ApiError(400, "VALIDATION_ERROR", "limit은 1 이상의 정수여야 합니다");
  }

  // 카테고리는 고양이 또는 강아지만 허용
  if (category !== undefined && !["CAT", "DOG"].includes(category)) {
    throw new ApiError(400, "VALIDATION_ERROR", "category는 CAT 또는 DOG여야 합니다");
  }

  // 판매 상태는 판매 중 또는 교환 제시 중만 허용
  if (status !== undefined && !["ON_SALE", "ON_EXCHANGE"].includes(status)) {
    throw new ApiError(400, "VALIDATION_ERROR", "status는 ON_SALE 또는 ON_EXCHANGE여야 합니다");
  }

  // 품절 여부는 true 또는 false만 허용
  if (soldOut !== undefined && !["true", "false"].includes(soldOut)) {
    throw new ApiError(400, "VALIDATION_ERROR", "soldOut은 true 또는 false여야 합니다");
  }

  // 정렬은 관상 지수, 포인트, 등록일 기준의 6가지 값만 허용
  if (
    orderBy !== undefined &&
    !["SCORE_DESC", "SCORE_ASC", "POINT_ASC", "POINT_DESC", "RECENT", "OLDEST"].includes(orderBy)
  ) {
    throw new ApiError(400, "VALIDATION_ERROR", "orderBy 값이 올바르지 않습니다");
  }

  // cursor가 전달되면 빈 값은 허용하지 않음
  if (cursor !== undefined && cursor.trim() === "") {
    throw new ApiError(400, "VALIDATION_ERROR", "cursor 값이 올바르지 않습니다");
  }

  // sellerId가 전달되면 빈 값은 허용하지 않음
  if (sellerId !== undefined && sellerId.trim() === "") {
    throw new ApiError(400, "VALIDATION_ERROR", "sellerId 값이 올바르지 않습니다");
  }

  const { lists, nextCursor } = await saleService.getSales({
    category,
    keyword,
    soldOut,
    status,
    sellerId,
    orderBy,
    cursor,
    limit,
  });

  res.status(200).json({
    data: {
      lists,
      nextCursor,
    },
  });
}
