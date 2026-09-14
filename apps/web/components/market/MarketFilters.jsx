"use client";

import { useState } from "react";

export default function MarketFilters({
  keyword,
  setKeyword,

  categories,
  handleCategoryChange,

  quality,
  setQuality,

  sort,
  setSort,
}) {
  // ==========================================
  // 드롭다운 열림 / 닫힘
  // ==========================================

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // ==========================================
  // 정렬 옵션
  // ==========================================

  const sortOptions = ["관상 지수 높은 순", "관상 지수 낮은 순", "최근 등록 순", "오래된 등록 순"];

  return (
    <section className="pt-[24px]">
      <div className="flex items-start">
        {/* ==================================
            검색
        ================================== */}

        <div
          className="
            relative
            h-[51px]
            w-[322px]
            shrink-0
            border
            border-[#666666]
            bg-[#0f0f0f]
          "
        >
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="검색"
            className="
              h-full
              w-full
              bg-transparent
              px-[20px]
              pr-[55px]
              text-[14px]
              text-white
              outline-none
              placeholder:text-[#888888]
            "
          />

          <button
            type="button"
            aria-label="검색"
            className="
              absolute
              right-0
              top-0
              flex
              h-full
              w-[52px]
              items-center
              justify-center
              text-white
            "
          >
            <span className="text-[28px] leading-none">⌕</span>
          </button>
        </div>

        {/* ==================================
            필터
        ================================== */}

        <div className="ml-[32px] flex items-start gap-[32px]">
          {/* ==================================
              카테고리
          ================================== */}

          <div className="relative">
            <button
              type="button"
              className="
                flex
                h-[51px]
                items-center
                gap-[12px]
                text-[15px]
                font-bold
                text-white
              "
              onClick={() => {
                setCategoryOpen((prev) => !prev);
                setSortOpen(false);
              }}
            >
              <span>카테고리</span>

              <span
                className={`
                  text-[10px]
                  transition-transform
                  duration-200
                  ${categoryOpen ? "rotate-180" : ""}
                `}
              >
                ▼
              </span>
            </button>

            {/* ==================================
                카테고리 선택박스
            ================================== */}

            {categoryOpen && (
              <div
                className="
                  absolute
                  left-0
                  top-[56px]
                  z-50
                  w-[120px]
                  border
                  border-[#666666]
                  bg-[#151515]
                "
              >
                {/* 강아지 */}

                <CategoryCheckbox
                  label="강아지"
                  checked={categories.includes("DOG")}
                  onChange={() => handleCategoryChange("DOG")}
                />

                {/* 고양이 */}

                <CategoryCheckbox
                  label="고양이"
                  checked={categories.includes("CAT")}
                  onChange={() => handleCategoryChange("CAT")}
                />
              </div>
            )}
          </div>

          {/* ==================================
              품질 여부
          ================================== */}

          <div className="flex h-[51px] items-center">
            <label
              className="
                flex
                cursor-pointer
                items-center
                gap-[8px]
                text-[15px]
                font-bold
                text-white
              "
            >
              <span>품질 여부</span>

              <input
                type="checkbox"
                checked={quality}
                onChange={(e) => {
                  setQuality(e.target.checked);
                }}
                className="
                  h-[16px]
                  w-[16px]
                  cursor-pointer
                  accent-[#9b51e5]
                "
              />
            </label>
          </div>
        </div>

        {/* ==================================
            정렬
        ================================== */}

        <div className="relative ml-auto w-[300px]">
          {/* 선택된 정렬 */}

          <button
            type="button"
            className="
              flex
              h-[74px]
              w-full
              items-center
              justify-between
              rounded-[3px]
              border
              border-[#666666]
              bg-[#0f0f0f]
              px-[28px]
              text-[20px]
              text-white
            "
            onClick={() => {
              setSortOpen((prev) => !prev);
              setCategoryOpen(false);
            }}
          >
            <span>{sort}</span>

            <span
              className={`
                text-[12px]
                transition-transform
                duration-200
                ${sortOpen ? "rotate-180" : ""}
              `}
            >
              ▼
            </span>
          </button>

          {/* ==================================
              정렬 선택박스
          ================================== */}

          {sortOpen && (
            <div
              className="
                absolute
                left-0
                top-[80px]
                z-50
                w-full
                overflow-hidden
                border
                border-[#666666]
                bg-[#0f0f0f]
              "
            >
              {sortOptions.map((option) => (
                <button
                  type="button"
                  key={option}
                  className="
                    flex
                    h-[51px]
                    w-full
                    items-center
                    px-[28px]
                    text-left
                    text-[20px]
                    text-white
                    transition
                    hover:bg-[#292929]
                  "
                  onClick={() => {
                    setSort(option);
                    setSortOpen(false);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ==========================================
// 카테고리 체크박스
// ==========================================

function CategoryCheckbox({ label, checked, onChange }) {
  return (
    <label
      className="
        flex
        h-[50px]
        cursor-pointer
        items-center
        justify-between
        px-[18px]
        text-[14px]
        text-white
        hover:bg-[#292929]
      "
    >
      <span>{label}</span>

      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="
          h-[16px]
          w-[16px]
          cursor-pointer
          accent-[#9b51e5]
        "
      />
    </label>
  );
}
