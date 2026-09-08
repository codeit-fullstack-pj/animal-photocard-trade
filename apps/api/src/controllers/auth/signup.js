import { ApiError } from "../../lib/api-error.js";
import * as signupService from "../../services/auth/signup.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Express 5는 async 핸들러가 던진 에러를 error-handler로 넘겨주므로 try/catch가 필요 없다
export async function signup(req, res) {
  const { email, nickname, password, passwordConfirm } = req.body ?? {};

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    throw new ApiError(400, "VALIDATION_ERROR", "이메일 형식이 올바르지 않습니다");
  }
  if (typeof nickname !== "string" || nickname.trim() === "") {
    throw new ApiError(400, "VALIDATION_ERROR", "닉네임을 입력해 주세요");
  }
  if (typeof password !== "string" || password.length < 8) {
    throw new ApiError(400, "VALIDATION_ERROR", "비밀번호는 8자 이상이어야 합니다");
  }
  if (password !== passwordConfirm) {
    throw new ApiError(400, "VALIDATION_ERROR", "비밀번호 확인이 일치하지 않습니다");
  }

  const user = await signupService.signup({
    email: email.trim().toLowerCase(),
    nickname: nickname.trim(),
    password,
  });
  res.status(201).json({ data: { user } });
}
