"use client";

import { useEffect } from "react";
import Image from "next/image";

import MobileHeader from "@/components/ui/MobileHeader";

export default function ResponsiveModalShell({ isOpen, onClose, title, children, isSubmitting }) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  function handleClose() {
    if (isSubmitting) return;
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col tablet:justify-end pc:items-center pc:justify-center">
      {/* dim — 모바일은 화면 전체를 덮으므로 두지 않는다 */}
      <button
        type="button"
        aria-label="닫기"
        onClick={handleClose}
        className="absolute inset-0 hidden cursor-default bg-[#222222e6] tablet:block"
      />

      <div className="relative z-10 flex h-full w-full flex-col overflow-hidden bg-black tablet:h-[92vh] tablet:rounded-t-[20px] pc:h-[90vh] pc:max-h-193 pc:w-[90vw] pc:max-w-235 pc:rounded-[20px]">
        {/* 모바일 헤더 — <는 페이지 이동이 아니라 모달 닫기다 */}
        <div className="shrink-0 tablet:hidden">
          <MobileHeader title={title} onBack={handleClose} />
        </div>

        {/* 태블릿 끌어내리기 핸들 */}
        {/* TODO: 실제 드래그 제스처는 이번 범위 밖. 지금은 모양만 두고 클릭으로만 닫힌다 */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isSubmitting}
          aria-label="닫기"
          className="mx-auto hidden shrink-0 py-3 tablet:block pc:hidden"
        >
          <span className="block h-1 w-10 rounded-full bg-gray-400" />
        </button>

        {/* PC 닫기 버튼 */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isSubmitting}
          aria-label="닫기"
          className="absolute top-6 right-6 z-10 hidden pc:block"
        >
          <Image src="/close.png" alt="" width={24} height={24} />
        </button>

        {/* 내용이 길면 세로로만 스크롤한다 (가로 스크롤은 어느 폭에서도 만들지 않는다) */}
        <div className="min-h-0 flex-1 overflow-x-hidden px-4 py-5 tablet:px-5 tablet:py-6 tablet:pb-0 pc:p-15">
          {children}
        </div>
      </div>
    </div>
  );
}
