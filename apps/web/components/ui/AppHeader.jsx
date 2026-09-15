"use client";

import Image from "next/image";
import Link from "next/link";

import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function AppHeader() {
  const { currentUser, logout } = useCurrentUser();

  return (
    <header className="h-[56px] w-full bg-[#0F0F0F] tablet:h-[64px] pc:h-[80px]">
      <div className="mx-auto flex h-full w-full max-w-[1240px] items-center justify-between px-[16px] tablet:px-[24px] pc:px-0">
        {/* 서비스 로고 */}
        <Link href="/" aria-label="최애 멍냥 홈">
          <Image src="/logo.png" alt="최애 멍냥" width={182} height={61} priority />
        </Link>

        {/* 로그인 여부에 따라 사용자 정보 또는 로그인 메뉴를 표시 */}
        {currentUser ? (
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
          <nav className="flex items-center gap-[20px] font-sans-400 text-[12px] text-gray-200 tablet:text-[14px]">
            <Link href="/login" className="hover:text-white">
              로그인
            </Link>

            <Link href="/signup" className="hidden hover:text-white tablet:inline">
              회원가입
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
