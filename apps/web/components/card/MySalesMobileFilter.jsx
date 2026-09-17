"use client";

import { useEffect, useState } from "react";
import { getSales } from "@/lib/sales/api";
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

const SALE_TYPE_OPTIONS = [
  {
    value: "SALE",
    label: "판매 중",
  },
  {
    value: "EXCHANGE",
    label: "교환 제시 중",
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

export default function MySalesMobileFilter({
  isOpen,
  onClose,
  categories,
  saleTypes,
  includeSoldOut,
  sellerId,
  keyword,
  onApply,
}) {
  // 현재 보고 있는 필터 탭을 관리
  const [activeTab, setActiveTab] = useState("category");

  // 적용 버튼을 누르기 전까지 사용할 임시 필터 상태를 관리
  const [draftCategories, setDraftCategories] = useState(categories);
  const [draftSaleTypes, setDraftSaleTypes] = useState(saleTypes);
  const [draftIncludeSoldOut, setDraftIncludeSoldOut] = useState(includeSoldOut);

  // 모바일 필터 각 항목에 표시할 실제 개수를 관리
  const [filterCounts, setFilterCounts] = useState({
    DOG: 0,
    CAT: 0,
    SALE: 0,
    EXCHANGE: 0,
    soldOutExcluded: 0,
    soldOutIncluded: 0,
  });

  // 현재 임시 필터 조건에 해당하는 전체 개수를 관리
  const [resultCount, setResultCount] = useState(0);

  // 모바일 필터가 열려 있는 동안 배경 화면 스크롤을 막음
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // 모바일 필터가 열리면 각 필터 항목의 실제 개수를 조회
  useEffect(() => {
    if (!isOpen || !sellerId) return;

    let cancelled = false;

    async function loadFilterCounts() {
      try {
        const commonParams = {
          sellerId,
          page: 1,
          limit: 1,
          keyword: keyword?.trim() || undefined,
        };

        const [
          dogResult,
          catResult,
          saleResult,
          exchangeResult,
          soldOutExcludedResult,
          soldOutIncludedResult,
        ] = await Promise.all([
          getSales({
            ...commonParams,
            category: "DOG",
            includeSoldOut: true,
          }),
          getSales({
            ...commonParams,
            category: "CAT",
            includeSoldOut: true,
          }),
          getSales({
            ...commonParams,
            status: "ON_SALE",
            includeSoldOut: false,
          }),
          getSales({
            ...commonParams,
            status: "ON_EXCHANGE",
            includeSoldOut: false,
          }),
          getSales({
            ...commonParams,
            includeSoldOut: false,
          }),
          getSales({
            ...commonParams,
            includeSoldOut: true,
          }),
        ]);

        if (cancelled) return;

        setFilterCounts({
          DOG: dogResult.totalCount ?? 0,
          CAT: catResult.totalCount ?? 0,
          SALE: saleResult.totalCount ?? 0,
          EXCHANGE: exchangeResult.totalCount ?? 0,
          soldOutExcluded: soldOutExcludedResult.totalCount ?? 0,
          soldOutIncluded: soldOutIncludedResult.totalCount ?? 0,
        });
      } catch (error) {
        console.error("모바일 필터 개수 조회에 실패했습니다.", error);
      }
    }

    loadFilterCounts();

    return () => {
      cancelled = true;
    };
  }, [isOpen, sellerId, keyword]);

  // 임시 필터가 변경될 때 적용 결과의 전체 개수를 다시 조회
  useEffect(() => {
    if (!isOpen || !sellerId) return;

    let cancelled = false;

    async function loadResultCount() {
      try {
        // 하나의 카테고리만 선택한 경우 API 필터에 전달
        const category = draftCategories.length === 1 ? draftCategories[0] : undefined;

        // 하나의 판매 유형만 선택한 경우 API 상태 값으로 변환
        const status =
          draftSaleTypes.length === 1
            ? draftSaleTypes[0] === "SALE"
              ? "ON_SALE"
              : "ON_EXCHANGE"
            : undefined;

        const result = await getSales({
          sellerId,
          page: 1,
          limit: 1,
          keyword: keyword?.trim() || undefined,
          category,
          status,
          includeSoldOut: draftIncludeSoldOut,
        });

        if (!cancelled) {
          setResultCount(result.totalCount ?? 0);
        }
      } catch (error) {
        console.error("모바일 필터 결과 개수 조회에 실패했습니다.", error);
      }
    }

    loadResultCount();

    return () => {
      cancelled = true;
    };
  }, [isOpen, sellerId, keyword, draftCategories, draftSaleTypes, draftIncludeSoldOut]);

  if (!isOpen) {
    return null;
  }

  // 강아지 또는 고양이 선택 상태를 변경
  const handleCategorySelect = (category) => {
    setDraftCategories((prevCategories) =>
      prevCategories.includes(category)
        ? prevCategories.filter((selectedCategory) => selectedCategory !== category)
        : [...prevCategories, category],
    );
  };

  // 판매 중 또는 교환 제시 중 선택 상태를 변경
  const handleSaleTypeSelect = (saleType) => {
    setDraftSaleTypes((prevSaleTypes) =>
      prevSaleTypes.includes(saleType)
        ? prevSaleTypes.filter((selectedSaleType) => selectedSaleType !== saleType)
        : [...prevSaleTypes, saleType],
    );
  };

  // 모바일 필터의 임시 선택값을 초기화
  const handleReset = () => {
    setDraftCategories([]);
    setDraftSaleTypes([]);
    setDraftIncludeSoldOut(false);
  };

  // 선택한 임시 필터값을 실제 목록에 적용
  const handleApply = () => {
    onApply({
      categories: draftCategories,
      saleTypes: draftSaleTypes,
      includeSoldOut: draftIncludeSoldOut,
    });
  };

  return (
    <div className="fixed inset-0 z-50 tablet:hidden">
      {/* 필터 바깥 영역을 누르면 닫음 */}
      <button
        type="button"
        aria-label="필터 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />

      {/* 모바일 필터 Bottom Sheet */}
      <section className="absolute bottom-0 left-0 w-full bg-gray-500 text-white">
        {/* 필터 제목 */}
        <div className="relative flex h-[52px] items-center justify-center">
          <h2 className="font-sans-700 text-[16px] leading-none">필터</h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="필터 닫기"
            className="absolute right-[20px] top-1/2 flex size-[24px] -translate-y-1/2 items-center justify-center text-[26px] font-light leading-none text-gray-200"
          >
            ×
          </button>
        </div>

        {/* 필터 탭 */}
        <div className="flex h-[52px] border-b border-gray-400 px-[20px]">
          <button
            type="button"
            onClick={() => setActiveTab("category")}
            className="relative flex flex-1 items-center justify-center"
          >
            <span
              className={`font-sans-500 text-[14px] ${
                activeTab === "category" ? "text-white" : "text-gray-300"
              }`}
            >
              카테고리
            </span>

            {activeTab === "category" && (
              <span className="absolute bottom-0 left-[20%] right-[20%] h-[2px] bg-white" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("saleType")}
            className="relative flex flex-1 items-center justify-center"
          >
            <span
              className={`font-sans-500 text-[14px] ${
                activeTab === "saleType" ? "text-white" : "text-gray-300"
              }`}
            >
              판매 유형
            </span>

            {activeTab === "saleType" && (
              <span className="absolute bottom-0 left-[20%] right-[20%] h-[2px] bg-white" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("soldOut")}
            className="relative flex flex-1 items-center justify-center"
          >
            <span
              className={`font-sans-500 text-[14px] ${
                activeTab === "soldOut" ? "text-white" : "text-gray-300"
              }`}
            >
              품절 여부
            </span>

            {activeTab === "soldOut" && (
              <span className="absolute bottom-0 left-[20%] right-[20%] h-[2px] bg-white" />
            )}
          </button>
        </div>

        {/* 선택한 탭의 필터 항목 */}
        <div className="min-h-[150px] px-[32px] py-[14px]">
          {activeTab === "category" && (
            <div className="flex flex-col">
              {CATEGORY_OPTIONS.map((option) => {
                const isSelected = draftCategories.includes(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleCategorySelect(option.value)}
                    className="flex h-[52px] w-full items-center justify-between text-left"
                  >
                    <span
                      className={`font-sans-500 text-[14px] ${
                        isSelected ? "text-purple-button" : "text-gray-300"
                      }`}
                    >
                      {option.label}
                    </span>

                    <span className="font-sans-400 text-[14px] text-gray-300">
                      {filterCounts[option.value]}개
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === "saleType" && (
            <div className="flex flex-col">
              {SALE_TYPE_OPTIONS.map((option) => {
                const isSelected = draftSaleTypes.includes(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSaleTypeSelect(option.value)}
                    className="flex h-[52px] w-full items-center justify-between text-left"
                  >
                    <span
                      className={`font-sans-500 text-[14px] ${
                        isSelected ? "text-purple-button" : "text-gray-300"
                      }`}
                    >
                      {option.label}
                    </span>

                    <span className="font-sans-400 text-[14px] text-gray-300">
                      {filterCounts[option.value]}개
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === "soldOut" && (
            <div className="flex flex-col">
              {SOLD_OUT_OPTIONS.map((option) => {
                const isSelected = draftIncludeSoldOut === option.value;

                const count = option.value
                  ? filterCounts.soldOutIncluded
                  : filterCounts.soldOutExcluded;

                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    onClick={() => setDraftIncludeSoldOut(option.value)}
                    className="flex h-[52px] w-full items-center justify-between text-left"
                  >
                    <span
                      className={`font-sans-500 text-[14px] ${
                        isSelected ? "text-purple-button" : "text-gray-300"
                      }`}
                    >
                      {option.label}
                    </span>

                    <span className="font-sans-400 text-[14px] text-gray-300">{count}개</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 초기화와 필터 적용 */}
        <div className="flex items-center gap-[12px] px-[20px] pb-[40px] pt-[8px]">
          <button
            type="button"
            onClick={handleReset}
            aria-label="필터 초기화"
            className="flex size-[54px] shrink-0 items-center justify-center text-[26px] font-light text-gray-400"
          >
            ↻
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="font-sans-700 flex h-[55px] flex-1 items-center justify-center rounded-[2px] bg-purple-button text-[16px] text-white"
          >
            {resultCount}개 포토카드 보기
          </button>
        </div>
      </section>
    </div>
  );
}
