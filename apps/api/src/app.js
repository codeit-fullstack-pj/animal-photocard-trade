import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { errorHandler, notFoundHandler } from "./middlewares/error-handler.js";
import { authRouter } from "./routes/auth.routes.js";
import { healthRouter } from "./routes/health.routes.js";

export const app = express();

// 보호 해제 상태에서는 아무 사이트나 쿠키를 실어 API를 부를 수 있으므로 로컬 개발용이며, 배포 환경에서는 반드시 true로 켠다
const allowedOrigin =
  process.env.CORS_ENABLED === "true" ? (process.env.CORS_ORIGIN ?? "http://localhost:3000") : true;
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", healthRouter);
app.use("/api/v1/auth", authRouter);

app.use(notFoundHandler);
app.use(errorHandler);
