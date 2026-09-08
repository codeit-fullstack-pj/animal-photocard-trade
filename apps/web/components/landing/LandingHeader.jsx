import Link from "next/link";

import Logo from "./Logo";

// 모바일: [햄버거][로고][로그인] / 태블릿: [로고][내비 우측] / 데스크톱: 로고 10% 안쪽, 내비 화면 중앙
export default function LandingHeader() {
  return (
    <header className="grid h-14 grid-cols-[1fr_auto_1fr] items-center px-4 sm:h-16 sm:px-6 lg:h-[4.5rem] lg:px-[10%]">
      <button
        type="button"
        aria-label="메뉴 열기"
        className="justify-self-start p-1 text-white sm:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      <Link
        href="/"
        aria-label="최애멍냥 홈"
        className="justify-self-center sm:col-start-1 sm:row-start-1 sm:justify-self-start"
      >
        <Logo className="h-8 lg:h-12 md:h-10" />
      </Link>

      <nav className="col-start-3 row-start-1 flex items-center gap-5 justify-self-end font-sans-400 text-xs text-gray-200 sm:text-sm lg:col-start-2 lg:gap-8 lg:justify-self-center">
        <Link href="/login" className="hover:text-white">
          로그인
        </Link>
        <Link href="/signup" className="hidden hover:text-white sm:inline">
          회원가입
        </Link>
      </nav>
    </header>
  );
}
