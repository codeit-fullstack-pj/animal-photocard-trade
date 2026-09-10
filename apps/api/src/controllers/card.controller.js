import {
  array,
  coerce,
  defaulted,
  enums,
  integer,
  min,
  string,
  trimmed,
  type,
  validate,
} from "superstruct";

import { ApiError } from "../lib/api-error.js";
import * as cardService from "../services/card.service.js";

const ORDER_BY = ["highestScore", "lowestScore", "latest", "oldest"];
const CATEGORY = ["dog", "cat"];

// 쿼리 문자열 "12" → 정수 12 (1 이상). 정수가 아니면 원본을 그대로 넘겨 검증에서 걸리게 한다
const queryPositiveInt = coerce(min(integer(), 1), string(), (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : value;
});

// GET /cards 쿼리 파라미터 형식
const ListCardsQuery = type({
  page: defaulted(queryPositiveInt, 1),
  pageSize: defaulted(queryPositiveInt, 12),
  orderBy: defaulted(enums(ORDER_BY), "latest"),
  keyword: defaulted(trimmed(string()), ""),
  category: defaulted(array(enums(CATEGORY)), []),
  // TODO: 인증 미들웨어 연동 시 제거하고 req.user.id 사용 (담당: 인증 파트)
  ownerId: string(),
});

const QUERY_MESSAGES = {
  page: "page 는 1 이상의 정수여야 합니다",
  pageSize: "pageSize 는 1 이상의 정수여야 합니다",
  orderBy: `orderBy 는 ${ORDER_BY.join(" / ")} 중 하나여야 합니다`,
  category: `category 는 ${CATEGORY.join(" / ")} 만 가능합니다`,
  keyword: "keyword 는 문자열이어야 합니다",
  ownerId: "ownerId 쿼리 파라미터가 필요합니다 (인증 연동 전 임시)",
};

// Express 5는 async 핸들러가 던진 에러를 error-handler로 넘겨준다
export async function list(req, res) {
  const [error, query] = validate(
    { ...req.query, category: toArray(req.query.category) },
    ListCardsQuery,
    { coerce: true },
  );
  if (error) {
    // 중첩(예: category 배열 원소) 실패는 error.key가 인덱스라서 error.path[0]로 최상위 파라미터명을 본다
    const field = error.path[0] ?? error.key;
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      QUERY_MESSAGES[field] ?? "요청 파라미터가 올바르지 않습니다",
    );
  }

  const result = await cardService.listCards({
    ownerId: query.ownerId,
    page: query.page,
    pageSize: query.pageSize,
    orderBy: query.orderBy,
    keyword: query.keyword,
    categories: query.category,
  });
  res.json({ data: result });
}

// ?category=dog → "dog", ?category=dog&category=cat → ["dog", "cat"], 없으면 []
function toArray(value) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}
