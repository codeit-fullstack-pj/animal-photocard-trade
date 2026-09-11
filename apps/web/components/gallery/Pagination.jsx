"use client";

import Image from "next/image";

/**
 * 페이지 번호 네비게이션. totalPages 가 1 이하면 아무것도 렌더하지 않는다.
 * @param {{ page: number, totalPages: number, onChange: (page: number) => void }} props
 */
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // 숫자/화살표 버튼 공통 크기: mobile 40 / tablet·pc 50
  const buttonSize = "size-10 tablet:size-12.5";

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="페이지 이동">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="이전 페이지"
        className={`group flex items-center justify-center rounded-xs ${buttonSize}`}
      >
        {/* 비활성이면 화살표 자체가 회색 (brightness-50: 흰 화살표 → 중간 회색) */}
        <Image
          src="/left.png"
          alt=""
          width={24}
          height={24}
          className="size-5.5 tablet:size-6 group-disabled:brightness-50"
        />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-current={p === page ? "page" : undefined}
          className={`flex items-center justify-center rounded-xs border border-transparent text-sm transition tablet:text-base ${buttonSize} ${
            p === page
              ? "border-white font-sans-700 text-white"
              : "font-sans-400 text-gray-300 hover:text-white"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="다음 페이지"
        className={`group flex items-center justify-center rounded-xs ${buttonSize}`}
      >
        <Image
          src="/right.png"
          alt=""
          width={24}
          height={24}
          className="size-5.5 tablet:size-6 group-disabled:brightness-50"
        />
      </button>
    </nav>
  );
}
