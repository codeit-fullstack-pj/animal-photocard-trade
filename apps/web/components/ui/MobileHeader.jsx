"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

/**
 * 모바일 전용 페이지 헤더 (100% × 60px). 좌측 뒤로가기, 가운데 페이지 타이틀.
 * @param {{ title: string }} props
 */
export default function MobileHeader({ title }) {
  const router = useRouter();

  return (
    <header className="flex h-15 w-full items-center bg-black px-4">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="뒤로가기"
        className="flex shrink-0 items-center"
      >
        <Image src="/backspace.png" alt="" width={24} height={24} />
      </button>
      <h1 className="flex-1 text-center font-primary-bold text-xl text-white">{title}</h1>
      {/* 뒤로가기 버튼 너비만큼 오른쪽에도 빈 공간을 둬서 타이틀이 실제로 가운데 오게 한다 */}
      <div className="size-6 shrink-0" aria-hidden="true" />
    </header>
  );
}
