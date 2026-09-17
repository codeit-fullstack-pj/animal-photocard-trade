import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { errorHandler, notFoundHandler } from "./middlewares/error-handler.js";
import { authRouter } from "./routes/auth.routes.js";
import { cardRouter } from "./routes/card.routes.js";
import { exchangeRouter } from "./routes/exchange.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { imageRouter } from "./routes/image.routes.js";
import { notificationRouter } from "./routes/notification.routes.js";
import { saleRouter } from "./routes/sale.routes.js";
import { userRouter } from "./routes/user.routes.js";

export const app = express();

// Render 등 리버스 프록시 뒤에서 실행될 때 X-Forwarded-For/Proto를 신뢰하게 한다.
// 이게 없으면 express-rate-limit이 X-Forwarded-For 헤더를 보고도 trust proxy가 꺼져있다며
// ERR_ERL_UNEXPECTED_X_FORWARDED_FOR 에러를 던져 card/image 라우트 요청이 실패한다.
app.set("trust proxy", 1);

// 보호 해제 상태에서는 아무 사이트나 쿠키를 실어 API를 부를 수 있으므로 로컬 개발용이며, 배포 환경에서는 반드시 true로 켠다
const allowedOrigin =
  process.env.CORS_ENABLED === "true" ? (process.env.CORS_ORIGIN ?? "http://localhost:3000") : true;

app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", healthRouter);
app.use("/api/v1", imageRouter);
app.use("/api/v1", cardRouter);

// 판매 관련 API 라우터를 등록
app.use("/api/v1/sales", saleRouter);

app.use("/api/v1/notification", notificationRouter);

// 교환 제시 취소 등 교환 관련 API 라우터를 등록
app.use("/api/v1/exchanges", exchangeRouter);

app.use("/api/v1", userRouter);
app.use("/api/v1/auth", authRouter);

app.use(notFoundHandler);
app.use(errorHandler);
