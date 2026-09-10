import { refine, size, string, type, validate } from "superstruct";

import { ApiError } from "../lib/api-error.js";
import * as authService from "../services/auth.service.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /auth/signup 본문 형식
const SignupBody = refine(
  type({
    email: refine(string(), "email", (value) => EMAIL_PATTERN.test(value.trim())),
    nickname: refine(string(), "nickname", (value) => value.trim() !== ""),
    password: size(string(), 8, Infinity),
    passwordConfirm: string(),
  }),
  "passwordConfirm",
  (body) => body.password === body.passwordConfirm,
);

// 검증에 실패한 필드(error.key)별 안내 문구. 최상위 refine(비밀번호 일치)은 key가 없다
const VALIDATION_MESSAGES = {
  email: "이메일 형식이 올바르지 않습니다",
  nickname: "닉네임을 입력해 주세요",
  password: "비밀번호는 8자 이상이어야 합니다",
  passwordConfirm: "비밀번호 확인이 일치하지 않습니다",
};

// Express 5는 async 핸들러가 던진 에러를 error-handler로 넘겨주므로 try/catch가 필요 없다
export async function signup(req, res) {
  const [error, body] = validate(req.body, SignupBody);
  if (error) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      VALIDATION_MESSAGES[error.key ?? "passwordConfirm"],
    );
  }

  const user = await authService.signup({
    email: body.email.trim().toLowerCase(),
    nickname: body.nickname.trim(),
    password: body.password,
  });
  res.status(201).json({ data: { user } });
}
