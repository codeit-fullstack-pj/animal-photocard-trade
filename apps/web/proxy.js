import { NextResponse } from "next/server";

const REFRESH_TOKEN_COOKIE = "refreshToken";

// 로그인 여부와 무관하게 접근 가능한 페이지. 그 외는 기본적으로 로그인이 필요하다
const PUBLIC_PATHS = ["/", "/login", "/signup"];
const GUEST_ONLY_PATHS = ["/login", "/signup"];

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = request.cookies.has(REFRESH_TOKEN_COOKIE);

  if (isLoggedIn && GUEST_ONLY_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/market", request.url));
  }

  if (!isLoggedIn && !PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
