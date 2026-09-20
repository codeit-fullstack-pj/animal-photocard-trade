"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 닉네임을 누르면 그 바로 아래에 붙는 프로필 드롭다운. Dropdown.jsx와 같은 패턴
 * (트리거+패널을 한 컴포넌트가 같이 소유, 바깥 클릭·Esc로 닫힘)을 쓴다.
 * @param {{ currentUser: { nickname?: string, point?: number } }} props
 */
export default function Profile({ currentUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const isCurrentPage = (href) => pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    // AppHeader의 높이(h-14/16/20 = 56/64/80px)와 똑같이 맞춰서, 패널의 top-full이
    // "닉네임 버튼 바로 아래"가 아니라 "AppHeader 바닥"에 정확히 붙게 한다
    <div ref={rootRef} className="relative flex h-14 items-center tablet:h-16 pc:h-20">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="font-sans-700 text-[16px] text-gray-200"
      >
        {currentUser?.nickname ?? "err"}
      </button>

      {open && (
        <div className="absolute top-full right-0 z-10 w-65 h-auto rounded-xs bg-gray-500 py-4.25 px-4.25 text-left">
          <div className="flex flex-col gap-4.25">
            <div className="flex flex-col gap-4.25">
              <div className="flex flex-col">
                <span className="font-sans-700 text-lg text-white">
                  안녕하세요, {currentUser?.nickname ?? "err"}님!
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-sans-300 text-xs text-gray-300">보유포인트</span>
                <span className="font-sans-400 text-xs text-gray-200">
                  {currentUser?.point?.toLocaleString("ko-KR") ?? "err"} P
                </span>
              </div>
              <div className="-mx-4.25 h-px bg-gray-400" />
            </div>
            <div className="flex flex-col gap-5">
              <Link
                href="/market"
                onClick={() => setOpen(false)}
                aria-current={isCurrentPage("/market") ? "page" : undefined}
                className={`font-sans-700 text-sm ${isCurrentPage("/market") ? "text-purple-button" : "text-gray-200 hover:text-white"}`}
              >
                마켓플레이스
              </Link>
              <Link
                href="/my-gallery"
                onClick={() => setOpen(false)}
                aria-current={isCurrentPage("/my-gallery") ? "page" : undefined}
                className={`font-sans-700 text-sm ${isCurrentPage("/my-gallery") ? "text-purple-button" : "text-gray-200 hover:text-white"}`}
              >
                마이갤러리
              </Link>
              <Link
                href="/my-sales"
                onClick={() => setOpen(false)}
                aria-current={isCurrentPage("/my-sales") ? "page" : undefined}
                className={`font-sans-700 text-sm ${isCurrentPage("/my-sales") ? "text-purple-button" : "text-gray-200 hover:text-white"}`}
              >
                나의 거래 포토카드
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
