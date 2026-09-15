"use client";

import { useEffect } from "react";
import Image from "next/image";

const AUTO_CLOSE_MS = 3000;

/**
 * 페이지 좌우 중앙, 헤더 바로 아래에 뜨는 토스트 알림. 3초 뒤 자동으로 닫힌다.
 * 모바일 320×64(MobileHeader 60px 아래), 태블릿·PC 400×72(AppHeader 64/80px 아래). 좌측 아이콘 + 우측 메시지.
 * @param {{ isOpen: boolean, message: string, onClose: () => void }} props
 */
export default function Toast({ isOpen, message, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(onClose, AUTO_CLOSE_MS);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="status"
      className="fixed top-15 left-1/2 z-50 flex h-16 w-80 -translate-x-1/2 items-center justify-center rounded-[40px] bg-[#535353] px-6 tablet:top-16 tablet:h-18 tablet:w-100 pc:top-20"
    >
      <div className="flex items-center gap-2">
        <Image src="/error.png" alt="" width={24} height={24} className="shrink-0" />
        <span className="font-sans-400 text-base tablet:text-lg text-white">{message}</span>
      </div>
    </div>
  );
}
