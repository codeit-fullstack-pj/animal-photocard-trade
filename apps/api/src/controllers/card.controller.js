import {
  array,
  coerce,
  defaulted,
  enums,
  integer,
  min,
  refine,
  string,
  trimmed,
  type,
  validate,
} from "superstruct";

import { ApiError } from "../lib/api-error.js";
import { CSRF_TOKEN_COOKIE } from "../lib/auth-cookies.js";
import * as cardService from "../services/card.service.js";

// useImageVariants.js VARIANTS 순서(1 원본 · 2 세피아 · 3 모노 · 4 도트)와 일치
const FILTER_TYPES = [1, 2, 3, 4];
const NonEmpty = refine(string(), "nonEmpty", (value) => value.trim() !== "");

const CreateCardBody = type({
  imageId: NonEmpty,
  filterType: enums(FILTER_TYPES),
  name: NonEmpty,
});

const VALIDATION_MESSAGES = {
  imageId: "imageId가 필요합니다",
  filterType: `filterType 은 ${FILTER_TYPES.join(" / ")} 중 하나여야 합니다`,
  name: "포토카드 이름을 입력해 주세요",
};

export async function create(req, res) {
  // POST /cards는 상태를 바꾸는 요청이라 CSRF 토큰을 직접 검증한다 (double-submit cookie 방식:
  // 헤더 값과 쿠키 값이 같아야 통과 — 공격 사이트는 쿠키를 읽을 수 없어 헤더를 못 맞춘다)
  const fromHeader = req.get("X-CSRF-TOKEN");
  const fromCookie = req.cookies[CSRF_TOKEN_COOKIE];
  if (!fromHeader || !fromCookie || fromHeader !== fromCookie) {
    throw new ApiError(403, "CSRF_TOKEN_INVALID", "CSRF 토큰이 올바르지 않습니다");
  }

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
  });
  res.status(201).json({ data: result });
}

// GET /cards/remaining-count — 오늘 남은 카드 생성 가능 횟수
export async function remainingCount(req, res) {
  const result = await cardService.getRemainingCreateCount(req.user.id);
  res.json({ data: result });
}

const ORDER_BY = ["highestScore", "lowestScore", "latest", "oldest"];
const CATEGORY = ["DOG", "CAT"];

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
});

const QUERY_MESSAGES = {
  page: "page 는 1 이상의 정수여야 합니다",
  pageSize: "pageSize 는 1 이상의 정수여야 합니다",
  orderBy: `orderBy 는 ${ORDER_BY.join(" / ")} 중 하나여야 합니다`,
  category: `category 는 ${CATEGORY.join(" / ")} 만 가능합니다`,
  keyword: "keyword 는 문자열이어야 합니다",
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
    ownerId: req.user.id,
    page: query.page,
    pageSize: query.pageSize,
    orderBy: query.orderBy,
    keyword: query.keyword,
    categories: query.category,
  });
  res.json({ data: result });
}

// ?category=DOG → "DOG", ?category=DOG&category=CAT → ["DOG", "CAT"], 없으면 []
function toArray(value) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}
