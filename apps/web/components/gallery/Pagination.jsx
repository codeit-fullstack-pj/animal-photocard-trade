"use client";

import Image from "next/image";

const SIBLING_COUNT = 1; // 현재 페이지 양옆에 몇 개씩 보여줄지

// 1과 totalPages는 항상 보여주고, 현재 페이지 양옆 SIBLING_COUNT개만 보여준 뒤 나머지는 "..."로 생략한다.
// 다만 "..."로 줄여도 딱 1페이지밖에 안 가려지면(예: 1 2 3 4 → 1 2 ... 4) 그냥 번호를 그대로 보여준다
function getPageItems(page, totalPages) {
  let start = Math.max(2, page - SIBLING_COUNT);
  let end = Math.min(totalPages - 1, page + SIBLING_COUNT);

  if (start === 3) start = 2;
  if (end === totalPages - 2) end = totalPages - 1;

  const items = [1];
  if (start > 2) items.push("ellipsis-start");
  for (let p = start; p <= end; p += 1) items.push(p);
  if (end < totalPages - 1) items.push("ellipsis-end");
  if (totalPages > 1) items.push(totalPages);

  return items;
}

/**
 * 페이지 번호 네비게이션. totalPages 가 1 이하면 아무것도 렌더하지 않는다.
 * 페이지가 많으면 현재 페이지 주변만 보여주고 나머지는 "..."로 생략한다 (예: 1 ... 84 85 86 ... 100)
 * @param {{ page: number, totalPages: number, onChange: (page: number) => void }} props
 */
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pageItems = getPageItems(page, totalPages);

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

      {pageItems.map((item) =>
        typeof item === "number" ? (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? "page" : undefined}
            className={`flex items-center justify-center rounded-xs border border-transparent text-sm transition tablet:text-base ${buttonSize} ${
              item === page
                ? "border-white font-sans-700 text-white"
                : "font-sans-400 text-gray-300 hover:text-white"
            }`}
          >
            {item}
          </button>
        ) : (
          <span
            key={item}
            aria-hidden="true"
            className={`flex items-center justify-center font-sans-400 text-sm text-gray-300 tablet:text-base ${buttonSize}`}
          >
            ...
          </span>
        ),
      )}

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
