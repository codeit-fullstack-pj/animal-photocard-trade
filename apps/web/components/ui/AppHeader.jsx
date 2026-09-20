"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import Profile from "@/components/ui/Profile";
import Notification, { NotificationDataProvider } from "@/components/ui/Notification";
import { useAuth } from "@/lib/auth/AuthProvider";

const MENU_LINKS = [
  { href: "/market", label: "마켓플레이스" },
  { href: "/my-gallery", label: "마이갤러리" },
  { href: "/my-sales", label: "나의 판매 포토관리" },
];

export default function AppHeader() {
  const { currentUser, isLoading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // 모바일/태블릿·PC 두 군데에 따로 렌더링되는 Notification 인스턴스가 같은 열림 상태를 쓰도록 여기서 관리
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  // 알림 액션으로 바뀐 안읽음 개수 — null이면 아직 반영 전이라 currentUser.unreadCount를 대신 보여준다
  const [liveUnreadCount, setLiveUnreadCount] = useState(null);
  const unreadCount = liveUnreadCount ?? currentUser?.unreadCount ?? 0;

  // 메뉴 또는 모바일 알림 전체 화면이 열려 있는 동안 뒤 페이지 스크롤 막기
  useEffect(() => {
    if (!isMenuOpen && !isNotifOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen, isNotifOpen]);

  async function handleLogout() {
    setIsMenuOpen(false);

    try {
      await logout();
    } catch (error) {
      console.error("로그아웃 실패", error);
    }
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <>
      <header className="h-[56px] w-full bg-[#0F0F0F] tablet:h-[64px] pc:h-[80px]">
        <NotificationDataProvider open={isNotifOpen} onUnreadCountChange={setLiveUnreadCount}>
          <div className="mx-auto h-full w-full max-w-[1240px] px-[16px] tablet:px-[24px] pc:px-0">
            {/* 모바일: 햄버거-로고-알림. 알림이 열리면 이 줄 위를 뒤로가기+"알림" 타이틀 바로 덮는다 */}
            <div className="relative h-full tablet:hidden">
              <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center">
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

                {!isLoading &&
                  (currentUser ? (
                    <div className="justify-self-end">
                      <Notification
                        unreadCount={unreadCount}
                        mobile
                        open={isNotifOpen}
                        onOpenChange={setIsNotifOpen}
                      />
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="justify-self-end font-sans-400 text-[12px] text-gray-200 hover:text-white"
                    >
                      로그인
                    </Link>
                  ))}
              </div>

              {isNotifOpen && (
                <div
                  data-notification-root
                  className="absolute inset-x-0 top-0 z-10 flex h-15 w-full items-center bg-[#0F0F0F]"
                >
                  <button
                    type="button"
                    onClick={() => setIsNotifOpen(false)}
                    aria-label="뒤로가기"
                    className="flex shrink-0 items-center"
                  >
                    <Image src="/backspace.png" alt="" width={24} height={24} />
                  </button>
                  <h1 className="flex-1 text-center font-primary-bold text-xl text-white">알림</h1>
                  {/* 뒤로가기 버튼 너비만큼 오른쪽에도 빈 공간을 둬서 타이틀이 실제로 가운데 오게 한다 */}
                  <div className="size-6 shrink-0" aria-hidden="true" />
                </div>
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

                    <Notification
                      unreadCount={unreadCount}
                      open={isNotifOpen}
                      onOpenChange={setIsNotifOpen}
                    />

                    <Profile currentUser={currentUser} />

                    <span className="h-[16px] w-px bg-[#5A5A5A]" aria-hidden="true" />

                    <button
                      type="button"
                      onClick={handleLogout}
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
        </NotificationDataProvider>
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
