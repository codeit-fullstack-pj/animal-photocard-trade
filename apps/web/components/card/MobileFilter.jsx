"use client";

import { useState } from "react";

const CATEGORY_OPTIONS = [
  {
    value: "DOG",
    label: "강아지",
  },
  {
    value: "CAT",
    label: "고양이",
  },
];

const SOLD_OUT_OPTIONS = [
  {
    value: false,
    label: "품절 제외",
  },
  {
    value: true,
    label: "품절 포함",
  },
];

export default function MobileFilter({
  isOpen,
  onClose,
  categories,
  setCategories,
  soldOut,
  setSoldOut,
  totalCount = 0,
  onApply,
}) {
  const [activeTab, setActiveTab] = useState("category");

  if (!isOpen) {
    return null;
  }

  /**
   * 카테고리 선택
   *
   * API가 category 하나만 지원하므로
   * 강아지 / 고양이 중 하나만 선택한다.
   */
  const handleCategorySelect = (category) => {
    setCategories([category]);
  };

  /**
   * 품절 여부 선택
   */
  const handleSoldOutSelect = (value) => {
    setSoldOut(value);
  };

  /**
   * 초기화
   *
   * 실제 적용된 필터가 아니라
   * 현재 Bottom Sheet의 임시 상태만 초기화한다.
   */
  const handleReset = () => {
    setCategories([]);
    setSoldOut(false);
  };

  /**
   * 현재 선택된 카테고리
   */
  const selectedCategory = categories[0] ?? null;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 tablet:hidden">
      {/* ========================================
          배경
      ======================================== */}
      <button
        type="button"
        aria-label="필터 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />

      {/* ========================================
          Bottom Sheet
      ======================================== */}
      <section
        className="
          absolute
          bottom-0
          left-0
          w-full
          rounded-t-[12px]
          bg-[#191919]
          text-white
        "
      >
        {/* ========================================
            헤더
        ======================================== */}
        <div
          className="
            relative
            flex
            h-[52px]
            items-center
            justify-center
          "
        >
          <h2 className="text-[16px] font-bold leading-none">필터</h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="필터 닫기"
            className="
              absolute
              right-[15px]
              top-1/2
              flex
              size-[24px]
              -translate-y-1/2
              items-center
              justify-center
              text-[24px]
              font-light
              leading-none
              text-white
            "
          >
            ×
          </button>
        </div>

        {/* ========================================
            탭
        ======================================== */}
        <div className="flex gap-[16px] h-[52px] pl-[16px] border-b border-[#161616]">
          {/* 카테고리 */}
          <button
            type="button"
            onClick={() => setActiveTab("category")}
            className="
              relative
              flex
              w-[84px]
              items-center
              justify-center
              text-[14px]
              font-medium
            "
          >
            <span className={activeTab === "category" ? "text-white" : "text-[#8A8A8A]"}>
              카테고리
            </span>

            {activeTab === "category" && (
              <span
                className="
                  absolute
                  bottom-0
                  left-[11%]
                  right-[11%]
                  h-[2px]
                  bg-white
                "
              />
            )}
          </button>

          {/* 품절 여부 */}
          <button
            type="button"
            onClick={() => setActiveTab("soldOut")}
            className="
              relative
              flex
              w-[87]
              items-center
              justify-center
              text-[14px]
              font-medium
            "
          >
            <span className={activeTab === "soldOut" ? "text-white" : "text-[#8A8A8A]"}>
              품절 여부
            </span>

            {activeTab === "soldOut" && (
              <span
                className="
                  absolute
                  bottom-0
                  left-[11%]
                  right-[11%]
                  h-[2px]
                  bg-white
                "
              />
            )}
          </button>
        </div>

        {/* ========================================
            내용
        ======================================== */}
        <div className="min-h-[160px] px-[32px] py-[16px]">
          {/* ======================================
              카테고리
          ====================================== */}
          {activeTab === "category" && (
            <div className="flex flex-col">
              {CATEGORY_OPTIONS.map((option) => {
                const isSelected = selectedCategory === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleCategorySelect(option.value)}
                    className="
                      flex
                      h-[52px]
                      w-full
                      items-center
                      justify-between
                      text-left
                    "
                  >
                    <span
                      className={
                        isSelected
                          ? "text-[14px] font-medium text-[#A656F5]"
                          : "text-[14px] font-medium text-[#A4A4A4]"
                      }
                    >
                      {option.label}
                    </span>

                    <span className="text-[14px] text-[#A4A4A4]">{totalCount}개</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ======================================
              품절 여부
          ====================================== */}
          {activeTab === "soldOut" && (
            <div className="flex flex-col">
              {SOLD_OUT_OPTIONS.map((option) => {
                const isSelected = soldOut === option.value;

                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    onClick={() => handleSoldOutSelect(option.value)}
                    className="
                      flex
                      h-[52px]
                      w-full
                      items-center
                      justify-between
                      text-left
                    "
                  >
                    <span
                      className={
                        isSelected
                          ? "text-[14px] font-medium text-[#A656F5]"
                          : "text-[14px] font-medium text-[#A4A4A4]"
                      }
                    >
                      {option.label}
                    </span>

                    <span className="text-[14px] text-[#A4A4A4]">{totalCount}개</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================
            하단
        ======================================== */}
        <div
          className="
            flex
            items-center
            gap-[11px]
            px-[16px]
            pb-[40px]
          "
        >
          {/* 초기화 */}
          <button
            type="button"
            onClick={handleReset}
            aria-label="필터 초기화"
            className="
              flex
              size-[54px]
              shrink-0
              items-center
              justify-center
              text-[24px]
              font-light
              text-[#5A5A5A]
            "
          >
            ↻
          </button>

          {/* 적용 */}
          <button
            type="button"
            onClick={onApply}
            className="
              flex
              h-[55px]
              flex-1
              items-center
              justify-center
              rounded-[2px]
              bg-[#A656F5]
              text-[16px]
              font-bold
              text-white
            "
          >
            {totalCount}개 포토카드 보기
          </button>
        </div>
      </section>
    </div>
  );
}
