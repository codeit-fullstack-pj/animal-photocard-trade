"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useCurrentUser } from "@/hooks/useCurrentUser";

const MENU_LINKS = [
  { href: "/market", label: "마켓플레이스" },
  { href: "/my-gallery", label: "마이갤러리" },
  { href: "/my-sales", label: "나의 판매 포토관리" },
];

export default function AppHeader() {
  const { currentUser, isLoading, logout } = useCurrentUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 메뉴가 열려 있는 동안 뒤 페이지 스크롤 막기
  useEffect(() => {
    if (!isMenuOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  function handleLogout() {
    setIsMenuOpen(false);
    logout();
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <>
      <header className="h-[56px] w-full bg-[#0F0F0F] tablet:h-[64px] pc:h-[80px]">
        <div className="mx-auto h-full w-full max-w-[1240px] px-[16px] tablet:px-[24px] pc:px-0">
          {/* 모바일: 햄버거(좌) - 로고(가운데) - 로그인 또는 빈칸(우) */}
          <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center tablet:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="메뉴 열기"
              className="flex h-[24px] w-[24px] items-center justify-self-start"
            >
              <Image src="/menu.png" alt="" width={24} height={24} />
            </button>

            <Link href="/" aria-label="최애 멍냥 홈" className="justify-self-center">
              <Image src="/logo.png" alt="최애 멍냥" width={182} height={61} priority />
            </Link>

            {!isLoading && !currentUser && (
              <Link
                href="/login"
                className="justify-self-end font-sans-400 text-[12px] text-gray-200 hover:text-white"
              >
                로그인
              </Link>
            )}
          </div>

          {/* 태블릿 이상: 로고(좌) - 사용자 정보/로그인(우) */}
          <div className="hidden h-full items-center justify-between tablet:flex">
            <Link href="/" aria-label="최애 멍냥 홈">
              <Image src="/logo.png" alt="최애 멍냥" width={182} height={61} priority />
            </Link>

            {!isLoading &&
              (currentUser ? (
                <div className="flex items-center gap-[32px]">
                  <span className="font-sans-500 text-[14px] text-[#DDDDDD]">
                    {currentUser.point?.toLocaleString("ko-KR") ?? "err"} P
                  </span>

                  <button
                    type="button"
                    className="flex h-[20px] w-[20px] items-center justify-center"
                    aria-label="알림"
                  >
                    <Image
                      src={currentUser.unreadCount > 0 ? "/alarm_active.png" : "/alarm_default.png"}
                      alt=""
                      width={20}
                      height={20}
                    />
                  </button>

                  <span className="font-sans-700 text-[16px] text-[#DDDDDD]">
                    {currentUser.nickname ?? "err"}
                  </span>

                  <span className="h-[16px] w-px bg-[#5A5A5A]" aria-hidden="true" />

                  <button
                    type="button"
                    onClick={logout}
                    className="font-sans-500 text-[14px] text-[#DDDDDD]"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <nav className="flex items-center gap-[20px] font-sans-400 text-[14px] text-gray-200">
                  <Link href="/login" className="hover:text-white">
                    로그인
                  </Link>

                  <Link href="/signup" className="hover:text-white">
                    회원가입
                  </Link>
                </nav>
              ))}
          </div>
        </div>
      </header>

      {/* 모바일 메뉴 드로어 (로그인 여부와 무관하게 열 수 있다) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex tablet:hidden">
          <div className="flex h-full w-[260px] shrink-0 flex-col bg-[#0F0F0F] px-[20px] py-[24px]">
            {currentUser ? (
              <>
                <p className="font-sans-700 text-[18px] text-white">
                  안녕하세요, {currentUser.nickname ?? "err"}님!
                </p>

                <div className="mt-[16px] flex items-center justify-between text-[12px]">
                  <span className="font-sans-300 text-gray-200">보유 포인트</span>
                  <span className="font-sans-400 text-white">
                    {currentUser.point?.toLocaleString("ko-KR") ?? "err"} P
                  </span>
                </div>
              </>
            ) : (
              <p className="font-sans-700 text-[18px] text-white">최애멍냥</p>
            )}

            <hr className="mt-[16px] opacity-50 h-px -mx-[20px] bg-gray-400" aria-hidden="true" />

            {currentUser && (
              <nav className="mt-[16px] flex flex-col gap-[16px]">
                {MENU_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeMenu}
                    className="font-sans-500 text-[14px] text-white"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            )}

            <div className="flex-1" />

            {currentUser ? (
              <button
                type="button"
                onClick={handleLogout}
                className="self-start font-sans-400 text-[14px] text-gray-200"
              >
                로그아웃
              </button>
            ) : (
              <div className="flex items-center gap-[16px]">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="font-sans-400 text-[14px] text-gray-200"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  onClick={closeMenu}
                  className="font-sans-400 text-[14px] text-gray-200"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>

          {/* 바깥 영역 탭하면 닫기 */}
          <button
            type="button"
            aria-label="메뉴 닫기"
            onClick={closeMenu}
            className="flex-1 bg-black/60"
          />
        </div>
      )}
    </>
  );
}
