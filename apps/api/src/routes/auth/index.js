import { Router } from "express";

import { signupRouter } from "./signup.js";

// /api/v1/auth 아래 라우터 모음. signin, signout 등이 생기면 여기에 추가한다
export const authRouter = Router();

authRouter.use(signupRouter);
