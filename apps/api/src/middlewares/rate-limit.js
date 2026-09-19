import rateLimit from "express-rate-limit";

// 15분당 IP 하나가 보낼 수 있는 요청 수. 카드/이미지 업로드 라우트처럼 인증이 걸린
// 라우트를 반복 요청으로 남용하지 못하게 막는 목적이라, 정상 사용 범위보단 넉넉하게 잡는다
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 100;

const COMMON_OPTIONS = {
  windowMs: WINDOW_MS,
  standardHeaders: true, // RateLimit-* 응답 헤더로 남은 요청 수 알려줌
  legacyHeaders: false,
  // error-handler.js의 ApiError 응답 형식({ code, message })과 맞춘다
  handler: (req, res) => {
    res.status(429).json({
      code: "TOO_MANY_REQUESTS",
      message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요",
    });
  },
};

export const apiRateLimit = rateLimit({
  ...COMMON_OPTIONS,
  max: MAX_REQUESTS,
});

export const currentUserRateLimit = rateLimit({
  ...COMMON_OPTIONS,
  max: 300,
});

export const randomPointRateLimit = rateLimit({
  ...COMMON_OPTIONS,
  max: 30,
});

export const saleUpdateRateLimit = rateLimit({
  ...COMMON_OPTIONS,
  max: 60,
});
