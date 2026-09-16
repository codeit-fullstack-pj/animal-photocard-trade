import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler.js";
import { authRouter } from "./routes/auth.routes.js";
import { cardRouter } from "./routes/card.routes.js";
import { exchangeRouter } from "./routes/exchange.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { saleRouter } from "./routes/saleRoute.js";
import { imageRouter } from "./routes/image.routes.js";
import { saleRouter } from "./routes/sale.routes.js";
import { userRouter } from "./routes/user.routes.js";
BigInt.prototype.toJSON = function () {
  return Number(this);
};

export const app = express();

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

// 교환 제시 취소 등 교환 관련 API 라우터를 등록
app.use("/api/v1/exchanges", exchangeRouter);

app.use("/api/v1", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1", saleRouter);

app.use(notFoundHandler);
app.use(errorHandler);
