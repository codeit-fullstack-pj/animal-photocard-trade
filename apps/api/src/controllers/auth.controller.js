import { optional, refine, size, string, type, validate } from "superstruct";

import { ApiError } from "../lib/api-error.js";
import {
  ACCESS_TOKEN_COOKIE,
  CSRF_TOKEN_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearAuthCookies,
  clearOAuthVerifierCookie,
  setAuthCookies,
  setCsrfCookie,
  setOAuthVerifierCookie,
} from "../lib/auth-cookies.js";
import * as authService from "../services/auth.service.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WEB_URL = process.env.WEB_URL ?? "http://localhost:3000";

const NonEmpty = refine(string(), "nonEmpty", (value) => value.trim() !== "");

// POST /auth/signup 본문 형식
const SignupBody = refine(
  type({
    email: refine(string(), "email", (value) => EMAIL_PATTERN.test(value.trim())),
    nickname: NonEmpty,
    password: size(string(), 8, Infinity),
    passwordConfirm: string(),
  }),
  "passwordConfirm",
  (body) => body.password === body.passwordConfirm,
);

// POST /auth/signin
const SigninBody = type({
  email: NonEmpty,
  password: NonEmpty,
});

// POST /auth/social/callback
const SocialCallbackBody = type({
  supabaseAccessToken: NonEmpty,
  supabaseRefreshToken: optional(string()),
});

const VALIDATION_MESSAGES = {
  email: "이메일 형식이 올바르지 않습니다",
  nickname: "닉네임을 입력해 주세요",
  password: "비밀번호는 8자 이상이어야 합니다",
  passwordConfirm: "비밀번호 확인이 일치하지 않습니다",
  supabaseAccessToken: "supabaseAccessToken이 필요합니다",
};

function validateBody(body, Struct) {
  const [error, value] = validate(body, Struct);
  if (error) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      VALIDATION_MESSAGES[error.key ?? "passwordConfirm"] ?? "입력값이 올바르지 않습니다",
    );
  }
  return value;
}

export async function signup(req, res) {
  const body = validateBody(req.body, SignupBody);
  const user = await authService.signup({
    email: body.email.trim().toLowerCase(),
    nickname: body.nickname.trim(),
    password: body.password,
  });
  res.status(201).json({ data: { user } });
}

export async function signin(req, res) {
  const body = validateBody(req.body, SigninBody);
  const { user, session } = await authService.signin({
    email: body.email.trim().toLowerCase(),
    password: body.password,
  });

  setAuthCookies(res, session);
  setCsrfCookie(res);
  res.json({
    data: { user, accessToken: session.accessToken, refreshToken: session.refreshToken },
  });
}

export async function signout(req, res) {
  // Authorization: Bearer <accessToken> 이 없으면 쿠키의 토큰을 쓴다
  const bearer = req.get("Authorization")?.replace(/^Bearer\s+/i, "");
  await authService.signout(bearer || req.cookies[ACCESS_TOKEN_COOKIE]);

  clearAuthCookies(res);
  res.status(204).end();
}

export async function refreshToken(req, res) {
  const session = await authService.refresh(req.cookies[REFRESH_TOKEN_COOKIE]);

  setAuthCookies(res, session);
  res.json({ data: { accessToken: session.accessToken } });
}

// GET /auth/social/:provider
export async function socialStart(req, res) {
  const callbackUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}/social/callback`;
  const { url, codeVerifier } = await authService.startSocialLogin(
    req.params.provider,
    callbackUrl,
  );

  setOAuthVerifierCookie(res, codeVerifier);
  res.redirect(url);
}

// GET /auth/social/callback
export async function socialFinish(req, res) {
  const codeVerifier = req.cookies[OAUTH_VERIFIER_COOKIE];
  clearOAuthVerifierCookie(res);

  try {
    const { session } = await authService.finishSocialLogin({ code: req.query.code, codeVerifier });
    setAuthCookies(res, session);
    setCsrfCookie(res);
    res.redirect(`${WEB_URL}/`);
  } catch (error) {
    const code = error instanceof ApiError ? error.code : "INTERNAL_ERROR";
    res.redirect(`${WEB_URL}/login?error=${code}`);
  }
}

// POST /auth/social/callback
export async function socialCallback(req, res) {
  const body = validateBody(req.body, SocialCallbackBody);
  const { user, session } = await authService.socialCallback(body);

  setAuthCookies(res, session);
  setCsrfCookie(res);
  res.json({
    data: { user, accessToken: session.accessToken, refreshToken: session.refreshToken },
  });
}

// GET /auth/csrf-token — 로그아웃·토큰 재발급 때 X-CSRF-TOKEN 헤더에 넣을 값.
// 웹과 API 도메인이 달라 JS가 쿠키를 직접 읽을 수 없으므로 이 응답으로 알려준다 (쿠키가 없으면 새로 발급)
export function csrfToken(req, res) {
  const token = req.cookies[CSRF_TOKEN_COOKIE] ?? setCsrfCookie(res);
  res.json({ data: { csrfToken: token } });
}
