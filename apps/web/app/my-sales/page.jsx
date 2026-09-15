"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import AppHeader from "@/components/ui/AppHeader";
import PhotoCard from "../../components/card/PhotoCard";

import { mockCards } from "../../mocks/cards";
import { mockExchanges } from "../../mocks/exchanges";
import { mockSales } from "../../mocks/sales";
import { mockUsers } from "../../mocks/users";

const SORT_OPTIONS = [
  { value: "SCORE_DESC", label: "관상 지수 높은 순" },
  { value: "SCORE_ASC", label: "관상 지수 낮은 순" },
  { value: "POINT_ASC", label: "낮은 포인트 순" },
  { value: "POINT_DESC", label: "높은 포인트 순" },
  { value: "RECENT", label: "최근 등록 순" },
  { value: "OLDEST", label: "오래된 등록 순" },
];

const PAGE_SIZE = 9;

export default function MySalesPage() {
  // ===========================================================================
  // ★★★★★ 상태 관리 ★★★★★
  // ===========================================================================
  // 카테고리 드롭다운의 열림/닫힘 상태를 관리
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // 선택한 강아지/고양이 카테고리를 관리
  const [selectedCategories, setSelectedCategories] = useState([]);

  // 검색창에 입력한 검색어를 관리
  const [searchKeyword, setSearchKeyword] = useState("");

  // 판매유형 드롭다운의 열림/닫힘 상태를 관리
  const [isSaleTypeOpen, setIsSaleTypeOpen] = useState(false);

  // 선택한 판매 중/교환 제시 중 유형을 관리
  const [selectedSaleTypes, setSelectedSaleTypes] = useState([]);

  // 품절된 포토카드만 표시할지 관리
  const [isSoldOutOnly, setIsSoldOutOnly] = useState(false);

  // 정렬 드롭다운의 열림/닫힘 상태를 관리
  const [isSortOpen, setIsSortOpen] = useState(false);

  // 현재 선택한 정렬 기준을 관리
  const [selectedSort, setSelectedSort] = useState("RECENT");

  // 현재 보고 있는 페이지 번호를 관리
  const [currentPage, setCurrentPage] = useState(1);

  // 드롭다운 영역 바깥 클릭 여부를 확인하기 위해 DOM 요소를 참조
  const filterAreaRef = useRef(null);
  // ===========================================================================
  // ★★★★★ 상태 관리 END ★★★★★
  // ===========================================================================

  // 드롭다운 영역 바깥을 클릭하면 열려 있는 드롭다운을 모두 닫음
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (filterAreaRef.current && !filterAreaRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
        setIsSaleTypeOpen(false);
        setIsSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const selectedSortLabel =
    SORT_OPTIONS.find((option) => option.value === selectedSort)?.label ?? "최근 등록 순";

  // ★★★ 실제 로그인 기능 연결 전 목데이터 내 유저 정보 가져오기 ★★★★
  const currentUser = mockUsers[1];

  // 현재 사용자가 보유하고 있는 포토카드
  const ownedCards = mockCards.filter((card) => card.ownerId === currentUser.id);

  // 현재 사용자가 등록한 판매 중 또는 판매 완료 거래만 표시
  const mySales = mockSales.filter(
    (sale) => sale.seller.id === currentUser.id && sale.status !== "CANCELED",
  );

  // 교환 제시 후 아직 승인·거절되지 않은 포토카드 ID
  const pendingExchangeCardIds = new Set(
    mockExchanges
      .filter((exchange) => exchange.status === "PENDING")
      .map((exchange) => exchange.offerCardId),
  );

  // 선택한 카테고리가 없으면 전체 카드를 보여준다
  const filteredSales = mySales.filter((sale) => {
    const cardTitle = `${sale.card.tag} ${sale.card.name}`.toLowerCase();
    const normalizedKeyword = searchKeyword.trim().toLowerCase();

    const isPendingExchange = pendingExchangeCardIds.has(sale.cardId);

    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(sale.card.category);

    const matchesSearch = normalizedKeyword === "" || cardTitle.includes(normalizedKeyword);

    const matchesSaleType =
      selectedSaleTypes.length === 0 ||
      (selectedSaleTypes.includes("SALE") && sale.status === "ON_SALE" && !isPendingExchange) ||
      (selectedSaleTypes.includes("EXCHANGE") && isPendingExchange);

    const matchesSoldOut = !isSoldOutOnly || sale.status === "SOLD_OUT";

    return matchesCategory && matchesSearch && matchesSaleType && matchesSoldOut;
  });

  // 선택한 정렬 기준에 따라 필터링된 포토카드의 순서를 변경
  const sortedSales = [...filteredSales].sort((a, b) => {
    const aTopScore = Math.max(...a.card.score.axes.map((axis) => axis.value));
    const bTopScore = Math.max(...b.card.score.axes.map((axis) => axis.value));

    switch (selectedSort) {
      case "SCORE_DESC":
        return bTopScore - aTopScore;

      case "SCORE_ASC":
        return aTopScore - bTopScore;

      case "POINT_ASC":
        return a.price - b.price;

      case "POINT_DESC":
        return b.price - a.price;

      case "OLDEST":
        return new Date(a.createdAt) - new Date(b.createdAt);

      case "RECENT":
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // 필터링된 전체 포토카드의 페이지 수를 계산
  const totalPages = Math.ceil(sortedSales.length / PAGE_SIZE);

  // 현재 페이지에서 보여줄 포토카드의 시작 위치를 계산
  const startIndex = (currentPage - 1) * PAGE_SIZE;

  // 현재 페이지에 해당하는 포토카드만 잘라냄
  const paginatedSales = sortedSales.slice(startIndex, startIndex + PAGE_SIZE);

  // 강아지 또는 고양이 카테고리의 선택 상태를 변경
  const handleCategoryChange = (category) => {
    setSelectedCategories((prevCategories) =>
      prevCategories.includes(category)
        ? prevCategories.filter((selectedCategory) => selectedCategory !== category)
        : [...prevCategories, category],
    );

    // 필터가 변경되면 첫 번째 페이지로 이동
    setCurrentPage(1);
  };

  // 선택한 판매 유형을 추가하거나 이미 선택 된 유형은 해제함
  const handleSaleTypeChange = (saleType) => {
    setSelectedSaleTypes((prevSaleTypes) =>
      prevSaleTypes.includes(saleType)
        ? prevSaleTypes.filter((selectedSaleType) => selectedSaleType !== saleType)
        : [...prevSaleTypes, saleType],
    );

    // 필터가 변경되면 첫 번째 페이지로 이동
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen bg-black">
      <AppHeader />
      <div className="mx-auto w-full max-w-[1240px] pt-[168px]">
        {/* 페이지 제목 */}
        <h1 className="font-primary-bold text-[56px] leading-[67px] tracking-[-0.03em] text-white">
          나의 거래 포토카드
        </h1>

        {/* 제목 아래 구분선 */}
        <div className="mt-[20px] h-[2px] w-full bg-gray-100" />

        {/* 현재 사용자가 보유한 포토카드 개수 */}
        <p className="font-sans-500 mt-[24px] text-[20px] text-gray-200">
          {currentUser.nickname}님이 보유한 포토카드
          <span className="font-sans-400 ml-[8px] text-[16px] text-gray-300">
            ({ownedCards.length}장)
          </span>
        </p>

        {/* 포토카드 정보 아래 구분선 */}
        <div className="mt-[20px] h-px w-full bg-gray-400" />

        {/* 검색 및 필터 영역 */}
        <div ref={filterAreaRef} className="mt-[20px] flex items-center justify-between">
          <div className="flex items-center gap-[24px]">
            {/* 포토카드 검색 */}
            <div className="flex h-[50px] w-[320px] items-center border border-gray-300 px-[20px]">
              <input
                type="text"
                value={searchKeyword}
                onChange={(event) => {
                  setSearchKeyword(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="검색"
                className="font-sans-200 w-full bg-transparent text-[16px] text-gray-200 outline-none placeholder:text-gray-200"
              />

              <Image src="/search.png" alt="검색" width={24} height={24} />
            </div>

            {/* 카테고리 필터 */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsCategoryOpen((prev) => !prev);
                  setIsSaleTypeOpen(false);
                  setIsSortOpen(false);
                }}
                className="font-sans-700 flex h-[50px] items-center gap-[8px] text-[16px] text-white"
                aria-expanded={isCategoryOpen}
              >
                카테고리
                <Image
                  src={isCategoryOpen ? "/up.png" : "/down.png"}
                  alt=""
                  width={24}
                  height={24}
                />
              </button>

              {/* 카테고리 드롭다운 */}
              {isCategoryOpen && (
                <div className="absolute top-[50px] left-0 z-30 w-[136px] rounded-[2px] border border-gray-200 bg-black py-[6px]">
                  <label className="font-sans-400 flex h-[40px] cursor-pointer items-center justify-between px-[16px] text-[16px] text-white">
                    강아지
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes("DOG")}
                      onChange={() => handleCategoryChange("DOG")}
                      className="h-[16px] w-[16px] accent-white"
                    />
                  </label>

                  <label className="font-sans-400 flex h-[40px] cursor-pointer items-center justify-between px-[16px] text-[16px] text-white">
                    고양이
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes("CAT")}
                      onChange={() => handleCategoryChange("CAT")}
                      className="h-[16px] w-[16px] accent-white"
                    />
                  </label>
                </div>
              )}
            </div>
            {/* 판매 유형 필터 */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsSaleTypeOpen((prev) => !prev);
                  setIsCategoryOpen(false);
                  setIsSortOpen(false);
                }}
                className="font-sans-700 flex h-[50px] items-center gap-[8px] text-[16px] text-white"
                aria-expanded={isSaleTypeOpen}
              >
                판매유형
                <Image
                  src={isSaleTypeOpen ? "/up.png" : "/down.png"}
                  alt=""
                  width={24}
                  height={24}
                />
              </button>

              {isSaleTypeOpen && (
                <div className="absolute top-[50px] left-0 z-30 w-[136px] rounded-[2px] border border-gray-200 bg-black py-[6px]">
                  <label className="font-sans-400 flex h-[40px] cursor-pointer items-center justify-between px-[16px] text-[16px] text-white">
                    판매 중
                    <input
                      type="checkbox"
                      checked={selectedSaleTypes.includes("SALE")}
                      onChange={() => handleSaleTypeChange("SALE")}
                      className="h-[16px] w-[16px] accent-white"
                    />
                  </label>

                  <label className="font-sans-400 flex h-[40px] cursor-pointer items-center justify-between px-[16px] text-[16px] text-white">
                    교환 제시 중
                    <input
                      type="checkbox"
                      checked={selectedSaleTypes.includes("EXCHANGE")}
                      onChange={() => handleSaleTypeChange("EXCHANGE")}
                      className="h-[16px] w-[16px] accent-white"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* 품절된 포토카드 표시 여부 */}
            <label className="font-sans-700 flex h-[50px] items-center gap-[8px] text-[16px] text-white">
              품절여부
              <input
                type="checkbox"
                checked={isSoldOutOnly}
                onChange={(event) => {
                  setIsSoldOutOnly(event.target.checked);
                  setCurrentPage(1);
                }}
                className="h-[16px] w-[16px] accent-white"
              />
            </label>
          </div>

          {/* 포토카드 정렬 */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsSortOpen((prev) => !prev);
                setIsCategoryOpen(false);
                setIsSaleTypeOpen(false);
              }}
              className="font-sans-500 flex h-[50px] min-w-[200px] items-center justify-between border border-gray-200 rounded-[2px] px-[16px] text-[16px] text-white"
              aria-expanded={isSortOpen}
            >
              {selectedSortLabel}
              <Image src={isSortOpen ? "/up.png" : "/down.png"} alt="" width={24} height={24} />
            </button>

            {isSortOpen && (
              <div className="absolute top-[50px] right-0 z-30 w-[200px] mt-[5px] border border-gray-200 rounded-[2px] bg-black">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSelectedSort(option.value);
                      setCurrentPage(1);
                      setIsSortOpen(false);
                    }}
                    className="font-sans-400 flex h-[40px] w-full items-center px-[16px] text-left text-[16px] text-white hover:bg-[#2a2a2a]"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* 현재 사용자의 판매 거래 포토카드 목록 */}
        {paginatedSales.length > 0 ? (
          <section className="mt-[40px] grid grid-cols-3 gap-[20px]">
            {paginatedSales.map((sale) => (
              <PhotoCard
                key={sale.id}
                variant="sale"
                status={
                  pendingExchangeCardIds.has(sale.cardId)
                    ? "교환 제시 중"
                    : sale.status === "ON_SALE"
                      ? "판매 중"
                      : undefined
                }
                title={sale.card.name}
                tag={sale.card.tag}
                imageUrl={sale.card.image}
                filterType={sale.card.filterType}
                point={sale.price}
                isSoldOut={sale.status === "SOLD_OUT"}
                category={sale.card.category}
                score={sale.card.score}
              />
            ))}
          </section>
        ) : (
          <div className="font-sans-400 mt-[200px] text-center text-[25px] text-gray-300">
            해당하는 포토카드가 없습니다.
          </div>
        )}

        {/* 포토카드 목록 페이지네이션 */}
        {totalPages > 0 && (
          <nav
            className="mt-[56px] flex items-center justify-center gap-[24px]"
            aria-label="포토카드 페이지 이동"
          >
            {/* 이전 페이지로 이동 */}
            <button
              type="button"
              onClick={() => setCurrentPage((prevPage) => prevPage - 1)}
              disabled={currentPage === 1}
              className="flex h-[32px] w-[32px] items-center justify-center disabled:opacity-30"
              aria-label="이전 페이지"
            >
              <Image src="/left.png" alt="" width={16} height={16} />
            </button>

            {/* 전체 페이지 수만큼 페이지 번호 버튼을 생성 */}
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;

              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`font-sans-500 flex h-[32px] w-[32px] items-center justify-center text-[14px] text-white ${
                    currentPage === pageNumber ? "border border-white" : ""
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            {/* 다음 페이지로 이동 */}
            <button
              type="button"
              onClick={() => setCurrentPage((prevPage) => prevPage + 1)}
              disabled={currentPage === totalPages}
              className="flex h-[32px] w-[32px] items-center justify-center disabled:opacity-30"
              aria-label="다음 페이지"
            >
              <Image src="/right.png" alt="" width={16} height={16} />
            </button>
          </nav>
        )}
      </div>
    </main>
  );
}
