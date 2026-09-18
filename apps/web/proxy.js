import { NextResponse } from "next/server";

const REFRESH_TOKEN_COOKIE = "refreshToken";

const GUEST_ONLY_PATHS = ["/login", "/signup"];

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = request.cookies.has(REFRESH_TOKEN_COOKIE);

  if (isLoggedIn && GUEST_ONLY_PATHS.includes(pathname)) {
    return NextResponse.redirect(resolveBackUrl(request));
  }

  return NextResponse.next();
}

// 같은 사이트에서 온 요청이면 그 이전 페이지로, 아니면(북마크·직접 입력 등) 홈으로
function resolveBackUrl(request) {
  const referer = request.headers.get("referer");
  try {
    const refererUrl = new URL(referer);
    const isSameSite = refererUrl.origin === request.nextUrl.origin;
    if (isSameSite && !GUEST_ONLY_PATHS.includes(refererUrl.pathname)) {
      return refererUrl;
    }
  } catch {
    // referer 없음/잘못된 형식 — 아래 기본값으로
  }
  return new URL("/", request.url);
}

export const config = {
  matcher: ["/login", "/signup"],
};
