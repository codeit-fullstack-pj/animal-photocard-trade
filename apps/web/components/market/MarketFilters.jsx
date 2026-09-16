"use client";

import Image from "next/image";
import Dropdown from "@/components/gallery/Dropdown";

const CATEGORY_OPTIONS = [
  { value: "DOG", label: "강아지" },
  { value: "CAT", label: "고양이" },
];

const SORT_OPTIONS = [
  {
    value: "관상 지수 높은 순",
    label: "관상 지수 높은 순",
  },
  {
    value: "관상 지수 낮은 순",
    label: "관상 지수 낮은 순",
  },
  {
    value: "낮은 포인트 순",
    label: "낮은 포인트 순",
  },
  {
    value: "높은 포인트 순",
    label: "높은 포인트 순",
  },
  {
    value: "최근 등록 순",
    label: "최근 등록 순",
  },
  {
    value: "오래된 등록 순",
    label: "오래된 등록 순",
  },
];

export default function MarketFilters({
  keyword,
  setKeyword,
  categories,
  setCategories,
  soldOut,
  setSoldOut,
  sort,
  setSort,
  onOpenMobileFilter,
}) {
  return (
    <div
      className="
        flex
        w-full
        flex-wrap
        items-center
        justify-between
        gap-3
        tablet:flex-nowrap
        tablet:justify-start
      "
    >
      {/* ========================================
          검색
      ======================================== */}
      <div
        className="
          flex
          h-12.5
          w-full
          shrink-0
          items-center
          gap-2
          rounded-xs
          border
          border-gray-200
          bg-black
          px-4
          tablet:w-50
          pc:w-xs
        "
      >
        <input
          type="text"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="검색"
          className="
            min-w-0
            flex-1
            bg-transparent
            text-[12px]
            text-white
            outline-none
            placeholder:text-[#888]
            tablet:text-sm
          "
        />

        <Image src="/search.png" alt="검색" width={20} height={20} className="h-5 w-5 shrink-0" />
      </div>

      {/* ========================================
          모바일 필터 + 정렬
      ======================================== */}
      <div
        className="
          flex
          w-full
          items-center
          justify-between
          tablet:hidden
        "
      >
        {/* 필터 버튼 */}
        <button
          type="button"
          onClick={onOpenMobileFilter}
          aria-label="필터 열기"
          className="
            flex
            h-[40px]
            w-[40px]
            items-center
            justify-center
            rounded-[2px]
            border
            border-[#555]
            bg-black
          "
        >
          <Image src="/filter.png" alt="" width={20} height={20} className="h-5 w-5" />
        </button>

        {/* 모바일 정렬 */}
        <div className="relative w-[160px] shrink-0">
          <Dropdown
            options={SORT_OPTIONS}
            value={sort}
            onChange={setSort}
            placeholder="최근 등록 순"
          />
        </div>
      </div>

      {/* ========================================
          PC 카테고리
      ======================================== */}
      <div className="hidden shrink-0 tablet:block tablet:w-40">
        <Dropdown
          multiple
          options={CATEGORY_OPTIONS}
          value={categories}
          onChange={setCategories}
          placeholder="카테고리"
          triggerImage="/dropdown.png"
          placeholderClassName="text-white"
        />
      </div>

      {/* ========================================
          PC 품절 여부
      ======================================== */}
      <label
        className="
          hidden
          tablet:flex
          tablet:h-12
          tablet:shrink-0
          tablet:cursor-pointer
          tablet:items-center
          tablet:gap-2
          tablet:text-[14px]
          tablet:text-white
        "
      >
        <span className="whitespace-nowrap">품절 여부</span>

        <input
          type="checkbox"
          checked={soldOut}
          onChange={(event) => setSoldOut(event.target.checked)}
          className="
            size-4
            shrink-0
            cursor-pointer
            accent-[#9b51e5]
          "
        />
      </label>

      {/* ========================================
          PC 정렬
      ======================================== */}
      <div className="ml-auto hidden w-52 shrink-0 tablet:block">
        <Dropdown
          options={SORT_OPTIONS}
          value={sort}
          onChange={setSort}
          placeholder="최근 등록 순"
        />
      </div>
    </div>
  );
}
