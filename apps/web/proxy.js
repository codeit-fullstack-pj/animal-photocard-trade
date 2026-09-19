import { NextResponse } from "next/server";

const VISITED_COOKIE = "visited";

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const hasVisited = request.cookies.has(VISITED_COOKIE);

  //재방문 사용자 - 마켓플레이스
  if (hasVisited && pathname === "/") return NextResponse.redirect(new URL("/market", request.url));

  //위의 케이스가 아닌 경우 응답 만들기
  const response = NextResponse.next();

  //방문기록 여부 쿠키 저장
  if (!hasVisited) {
    response.cookies.set(VISITED_COOKIE, "true", {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  //리다이렉트 대상이 아니라면 원래 요청 진행
  return response;
}

export const config = {
  matcher: ["/"],
};
