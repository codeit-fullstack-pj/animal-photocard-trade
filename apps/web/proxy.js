import { NextResponse } from "next/server";

const REFRESH_TOKEN_COOKIE = "refreshToken";

const GUEST_ONLY_PATHS = ["/login", "/signup"];

// 웹(vercel.app)과 API(onrender.com)가 서로 다른 도메인이라 API가 내리는 쿠키는
// 이 프록시가 절대 볼 수 없다 — 그래서 로그인 필수 페이지 차단은 여기서 하지 않고
// 실제로 API를 호출해 로그인 여부를 확인하는 RequireAuth(클라이언트)에만 맡긴다.
// 로그인 상태에서 로그인/회원가입 페이지로 바로 들어오는 것만 막아준다(같은 이유로
// 로컬 개발 환경에서만 정상 동작하고 배포 환경에서는 그냥 통과된다).
export function proxy(request) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = request.cookies.has(REFRESH_TOKEN_COOKIE);

  if (isLoggedIn && GUEST_ONLY_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/market", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/signup"],
};
