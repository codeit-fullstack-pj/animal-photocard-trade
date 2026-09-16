"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
  // ========================================
  // 카테고리 드롭다운 상태
  // ========================================
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const categoryRef = useRef(null);

  // ========================================
  // 카테고리 드롭다운 외부 클릭 시 닫기
  // ========================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ========================================
  // 카테고리 선택
  // API는 category 하나만 지원하므로
  // 강아지 / 고양이 중 하나만 선택
  // ========================================
  const handleCategoryChange = (category) => {
    if (categories.includes(category)) {
      setCategories([]);
    } else {
      setCategories([category]);
    }
  };

  return (
    <div
      className="
        relative
        z-30
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
        <div className="relative z-20 w-[160px] shrink-0">
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
      <div
        ref={categoryRef}
        className="
          relative
          z-50
          hidden
          shrink-0
          tablet:block
          ml-[29px]
        "
      >
        {/* 카테고리 버튼 */}
        <button
          type="button"
          onClick={() => setIsCategoryOpen((prev) => !prev)}
          className="
            font-sans-700
            flex
            h-[50px]
            items-center
            gap-[8px]
            text-[16px]
            text-white
          "
          aria-expanded={isCategoryOpen}
        >
          카테고리
          <Image src={isCategoryOpen ? "/up.png" : "/down.png"} alt="" width={24} height={24} />
        </button>

        {/* ========================================
            카테고리 드롭다운
        ======================================== */}
        {isCategoryOpen && (
          <div
            className="
              absolute
              top-[50px]
              left-0
              z-50
              w-[136px]
              rounded-[2px]
              border
              border-gray-200
              bg-black
              py-[6px]
            "
          >
            {/* 강아지 */}
            <label
              className="
                font-sans-400
                flex
                h-[40px]
                cursor-pointer
                items-center
                justify-between
                px-[16px]
                text-[16px]
                text-white
              "
            >
              <span>강아지</span>

              <input
                type="checkbox"
                checked={categories.includes("DOG")}
                onChange={() => handleCategoryChange("DOG")}
                className="
                  h-[16px]
                  w-[16px]
                  cursor-pointer
                  accent-white
                "
              />
            </label>

            {/* 고양이 */}
            <label
              className="
                font-sans-400
                flex
                h-[40px]
                cursor-pointer
                items-center
                justify-between
                px-[16px]
                text-[16px]
                text-white
              "
            >
              <span>고양이</span>

              <input
                type="checkbox"
                checked={categories.includes("CAT")}
                onChange={() => handleCategoryChange("CAT")}
                className="
                  h-[16px]
                  w-[16px]
                  cursor-pointer
                  accent-white
                "
              />
            </label>
          </div>
        )}
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
        <span className="whitespace-nowrap">품절 포함</span>

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
