"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

/**
 * 모바일 전용 페이지 헤더 (100% × 60px). 좌측 뒤로가기, 가운데 페이지 타이틀.
 * @param {{ title: string, backHref?: string, onBack?: () => void }} props backHref를 주면
 *   브라우저 히스토리 대신 그 경로로 이동한다 (예: 생성 완료 페이지에서 뒤로가기를 항상
 *   마이갤러리로 보낼 때). onBack을 주면 페이지 이동 없이 그 함수만 부른다 (모달 닫기 등)
 */
export default function MobileHeader({ title, backHref, onBack }) {
  const router = useRouter();

  function handleBack() {
    if (onBack) return onBack();
    if (backHref) return router.push(backHref);
    router.back();
  }

  return (
    <header className="flex h-15 w-full items-center bg-black px-4">
      <button
        type="button"
        onClick={handleBack}
        aria-label="뒤로가기"
        className="flex shrink-0 items-center"
      >
        <Image src="/backspace.png" alt="" width={24} height={24} />
      </button>
      <h1 className="flex-1 text-center font-primary-bold text-xl text-white">{title}</h1>
      <div className="size-6 shrink-0" aria-hidden="true" />
    </header>
  );
}
