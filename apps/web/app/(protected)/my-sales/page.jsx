"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import ScaledPhotoCard from "@/components/card/ScaledPhotoCard";
import MySalesMobileFilter from "@/components/card/MySalesMobileFilter";
import AppHeader from "@/components/ui/AppHeader";
import MobileHeader from "@/components/ui/MobileHeader";

import { getSales } from "@/lib/sales/api";
import { useAuth } from "@/lib/auth/AuthProvider";

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

  // 입력이 멈춘 뒤 300ms 후에만 실제 요청에 반영되는 검색어 (마켓플레이스와 동일한 디바운스 방식)
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState("");

  // 판매유형 드롭다운의 열림/닫힘 상태를 관리
  const [isSaleTypeOpen, setIsSaleTypeOpen] = useState(false);

  // 선택한 판매 중/교환 제시 중 유형을 관리
  const [selectedSaleTypes, setSelectedSaleTypes] = useState([]);

  // 품절된 포토카드도 함께 표시할지 관리
  const [isSoldOutIncluded, setIsSoldOutIncluded] = useState(false);

  // 정렬 드롭다운의 열림/닫힘 상태를 관리
  const [isSortOpen, setIsSortOpen] = useState(false);

  // 현재 선택한 정렬 기준을 관리
  const [selectedSort, setSelectedSort] = useState("RECENT");

  // 현재 보고 있는 페이지 번호를 관리
  const [currentPage, setCurrentPage] = useState(1);

  // 판매 목록 API에서 받은 전체 페이지 수를 관리
  const [salesTotalPages, setSalesTotalPages] = useState(0);

  // 실제 API에서 조회한 판매 목록을 관리
  const [sales, setSales] = useState([]);

  // 판매 목록을 불러오는 중인지 관리
  const [isSalesLoading, setIsSalesLoading] = useState(false);

  // 판매 목록 조회 실패 메시지를 관리
  const [salesError, setSalesError] = useState("");

  // 드롭다운 영역 바깥 클릭 여부를 확인하기 위해 DOM 요소를 참조
  const filterAreaRef = useRef(null);

  // 현재 사용자가 거래 중인 전체 포토카드 개수를 관리
  const [tradingCardCount, setTradingCardCount] = useState(0);

  // 모바일 필터 패널의 열림 상태를 관리
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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

  // 전역 인증 상태에서 가져온다
  const { currentUser } = useAuth();

  const router = useRouter();

  // 검색어는 입력이 멈춘 뒤 300ms 후에만 요청에 반영
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchKeyword(searchKeyword), 300);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // 현재 로그인한 사용자가 거래 중인 전체 포토카드 개수를 조회
  useEffect(() => {
    if (!currentUser?.id) return;

    let cancelled = false;

    async function loadTradingCardCount() {
      try {
        const { totalCount } = await getSales({
          sellerId: currentUser.id,
          offererId: currentUser.id,
          limit: 1,
          page: 1,
          includeSoldOut: false,
        });

        if (!cancelled) {
          setTradingCardCount(totalCount);
        }
      } catch (error) {
        console.error("거래 중인 포토카드 개수 조회에 실패했습니다.", error);
      }
    }

    loadTradingCardCount();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id]);

  // 로그인한 사용자가 등록한 판매 목록을 조회
  useEffect(() => {
    if (!currentUser?.id) return;

    let cancelled = false;

    async function loadSales() {
      // 새 판매 목록 요청을 시작할 때 이전 오류를 초기화하고 로딩 상태로 변경
      setSalesError("");
      setIsSalesLoading(true);

      try {
        // 하나의 카테고리만 선택한 경우 API 필터에 사용
        const category = selectedCategories.length === 1 ? selectedCategories[0] : undefined;

        // 하나의 판매 유형만 선택한 경우 API 상태 값으로 변환
        const status =
          selectedSaleTypes.length === 1
            ? selectedSaleTypes[0] === "SALE"
              ? "ON_SALE"
              : "ON_EXCHANGE"
            : undefined;

        // sellerId(내가 등록한 판매글) 또는 offererId(내가 대기 중으로 교환 제시한 판매글)에
        // 해당하면 함께 조회한다 — "판매 중"만 골랐을 때 내가 제시한 카드가 빠지는 것까지
        // status 필터(getSaleStatusWhere)가 판매자/제시자 조건과 함께 AND로 걸러줘서 자동으로 맞다
        const { lists, totalPages } = await getSales({
          sellerId: currentUser.id,
          offererId: currentUser.id,
          limit: PAGE_SIZE,
          page: currentPage,
          category,
          keyword: debouncedSearchKeyword.trim() || undefined,
          status,
          includeSoldOut: isSoldOutIncluded,
          orderBy: selectedSort,
        });

        if (!cancelled) {
          setSales(lists);
          setSalesTotalPages(totalPages);
        }
      } catch (error) {
        console.error("판매 목록 조회에 실패했습니다.", error);

        // 현재 요청이 유효한 경우 사용자에게 보여줄 오류 메시지를 저장
        if (!cancelled) {
          setSalesError("판매 목록을 불러오지 못했습니다.");
        }
      } finally {
        // 요청이 끝나면 현재 요청에 대해서만 로딩 상태를 해제
        if (!cancelled) {
          setIsSalesLoading(false);
        }
      }
    }

    loadSales();

    return () => {
      cancelled = true;
    };
  }, [
    currentUser?.id,
    currentPage,
    debouncedSearchKeyword,
    selectedCategories,
    selectedSaleTypes,
    isSoldOutIncluded,
    selectedSort,
  ]);

  // 전체 페이지 수는 GET /sales 응답의 totalPages를 사용
  const totalPages = salesTotalPages;

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

  // 모바일 필터에서 선택한 값을 실제 판매 목록 필터에 적용
  const handleMobileFilterApply = ({ categories, saleTypes, includeSoldOut }) => {
    setSelectedCategories(categories);
    setSelectedSaleTypes(saleTypes);
    setIsSoldOutIncluded(includeSoldOut);
    setCurrentPage(1);
    setIsMobileFilterOpen(false);
  };

  return (
    <main className="min-h-screen bg-black">
      {/* 모바일에서는 뒤로가기와 페이지 제목이 있는 전용 헤더를 표시 */}
      <div className="tablet:hidden">
        <MobileHeader title="나의 거래 포토카드" />
      </div>

      {/* 태블릿 이상에서는 기존 공용 헤더를 표시 */}
      <div className="hidden tablet:block">
        <AppHeader />
      </div>

      <div className="mx-auto w-full max-w-[1240px] px-[20px] pt-[20px] tablet:px-[40px] tablet:pt-[140px] pc:px-0 pc:pt-[168px]">
        {/* 태블릿 이상에서만 페이지 제목과 거래 중인 카드 정보를 표시 */}
        <div className="hidden tablet:block">
          {/* 페이지 제목 */}
          <h1 className="font-primary-bold text-[40px] leading-[52px] tracking-[-0.03em] text-white pc:text-[56px] pc:leading-[67px]">
            나의 거래 포토카드
          </h1>

          {/* 제목 아래 구분선 */}
          <div className="mt-[20px] h-[2px] w-full bg-gray-100" />

          {/* PC에서만 현재 사용자의 거래중인 포토카드 개수를 표시 */}
          <div className="hidden pc:block">
            <p className="font-sans-500 mt-[24px] text-[20px] text-gray-200">
              {currentUser?.nickname ?? ""}님이 거래중인 포토카드
              <span className="font-sans-400 ml-[8px] text-[16px] text-gray-300">
                ({tradingCardCount}장)
              </span>
            </p>

            {/* 포토카드 정보 아래 구분선 */}
            <div className="mt-[20px] h-px w-full bg-gray-400" />
          </div>
        </div>

        {/* 검색 및 필터 영역 */}
        <div
          ref={filterAreaRef}
          className="mt-[20px] tablet:grid tablet:grid-cols-[320px_1fr_200px] tablet:items-center tablet:gap-x-[24px] tablet:gap-y-[12px] pc:flex pc:gap-[24px]"
        >
          <div className="flex w-full flex-col gap-[12px] tablet:contents pc:flex pc:flex-1 pc:flex-row pc:items-center pc:gap-[24px]">
            {/* 포토카드 검색 */}
            <div className="flex h-[50px] w-full items-center border border-gray-300 px-[16px] tablet:col-start-1 tablet:row-start-1 tablet:w-[320px] pc:px-[20px]">
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

            {/* 모바일에서는 필터 버튼과 정렬을 한 줄에 표시 */}
            <div className="flex w-full items-center justify-between tablet:hidden">
              {/* 모바일 필터 버튼과 목록의 위치 기준을 함께 관리 */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen((prev) => !prev)}
                  className="flex h-[40px] w-[40px] items-center justify-center border border-gray-200"
                  aria-label="필터"
                  aria-expanded={isMobileFilterOpen}
                >
                  <Image src="/filter.png" alt="" width={24} height={24} />
                </button>
              </div>

              {isMobileFilterOpen && (
                <MySalesMobileFilter
                  isOpen={isMobileFilterOpen}
                  onClose={() => setIsMobileFilterOpen(false)}
                  categories={selectedCategories}
                  saleTypes={selectedSaleTypes}
                  includeSoldOut={isSoldOutIncluded}
                  sellerId={currentUser?.id}
                  keyword={debouncedSearchKeyword}
                  onApply={handleMobileFilterApply}
                />
              )}

              <div className="relative w-[200px]">
                <button
                  type="button"
                  onClick={() => {
                    setIsSortOpen((prev) => !prev);
                    setIsCategoryOpen(false);
                    setIsSaleTypeOpen(false);
                  }}
                  className="flex h-12 w-full items-center justify-between rounded-xs border border-gray-200 bg-black px-4 text-left font-sans-400 text-white"
                  aria-expanded={isSortOpen}
                >
                  <span className="min-w-0 truncate">{selectedSortLabel}</span>

                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 28 28"
                    fill="none"
                    className={`shrink-0 transition-transform ${isSortOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M14.2 16.2L10 12H18.4L14.2 16.2Z" fill="white" />
                  </svg>
                </button>

                {isSortOpen && (
                  <div className="absolute top-full right-0 z-30 mt-1 w-full overflow-hidden rounded-xs border border-gray-200 bg-black">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSelectedSort(option.value);
                          setCurrentPage(1);
                          setIsSortOpen(false);
                        }}
                        className={`flex h-12 w-full items-center px-4 text-left font-sans-400 hover:bg-white/10 ${
                          option.value === selectedSort
                            ? "bg-purple-button text-white"
                            : "text-white"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 태블릿 이상에서만 상세 필터를 표시 */}
            <div className="hidden items-center gap-[24px] tablet:col-span-2 tablet:col-start-1 tablet:row-start-2 tablet:flex">
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
                        className="size-4 shrink-0 accent-purple-button"
                      />
                    </label>

                    <label className="font-sans-400 flex h-[40px] cursor-pointer items-center justify-between px-[16px] text-[16px] text-white">
                      고양이
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes("CAT")}
                        onChange={() => handleCategoryChange("CAT")}
                        className="size-4 shrink-0 accent-purple-button"
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
                        className="size-4 shrink-0 accent-purple-button"
                      />
                    </label>

                    <label className="font-sans-400 flex h-[40px] cursor-pointer items-center justify-between px-[16px] text-[16px] text-white">
                      교환 제시 중
                      <input
                        type="checkbox"
                        checked={selectedSaleTypes.includes("EXCHANGE")}
                        onChange={() => handleSaleTypeChange("EXCHANGE")}
                        className="size-4 shrink-0 accent-purple-button"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* 품절된 포토카드 표시 여부 */}
              <label className="font-sans-700 flex h-[50px] items-center gap-[8px] text-[16px] text-white">
                품절 포함
                <input
                  type="checkbox"
                  checked={isSoldOutIncluded}
                  onChange={(event) => {
                    setIsSoldOutIncluded(event.target.checked);
                    setCurrentPage(1);
                  }}
                  className="size-4 shrink-0 accent-purple-button"
                />
              </label>
            </div>
          </div>

          {/* 태블릿 이상에서 포토카드 정렬을 오른쪽에 표시 */}
          <div className="relative hidden tablet:col-start-3 tablet:row-start-1 tablet:flex tablet:justify-end pc:ml-auto">
            <button
              type="button"
              onClick={() => {
                setIsSortOpen((prev) => !prev);
                setIsCategoryOpen(false);
                setIsSaleTypeOpen(false);
              }}
              className="flex h-12 w-full items-center justify-between rounded-xs border border-gray-200 bg-black px-4 text-left font-sans-400 text-white tablet:w-[200px]"
              aria-expanded={isSortOpen}
            >
              <span className="min-w-0 truncate">{selectedSortLabel}</span>

              <svg
                width="24"
                height="24"
                viewBox="0 0 28 28"
                fill="none"
                className={`shrink-0 transition-transform ${isSortOpen ? "rotate-180" : ""}`}
              >
                <path d="M14.2 16.2L10 12H18.4L14.2 16.2Z" fill="white" />
              </svg>
            </button>

            {isSortOpen && (
              <div className="absolute top-full right-0 z-30 mt-1 w-full overflow-hidden rounded-xs border border-gray-200 bg-black tablet:w-[200px]">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSelectedSort(option.value);
                      setCurrentPage(1);
                      setIsSortOpen(false);
                    }}
                    className={`flex h-12 w-full items-center px-4 text-left font-sans-400 hover:bg-white/10 ${
                      option.value === selectedSort ? "bg-purple-button text-white" : "text-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 판매 목록의 로딩, 오류, 정상, 빈 상태를 구분하여 표시 */}
        {isSalesLoading ? (
          <div className="font-sans-400 mt-[200px] text-center text-[25px] text-gray-300">
            포토카드를 불러오는 중입니다.
          </div>
        ) : salesError ? (
          <div className="font-sans-400 mt-[200px] text-center text-[25px] text-gray-300">
            {salesError}
          </div>
        ) : sales.length > 0 ? (
          <section className="mt-[32px] grid w-full grid-cols-2 gap-[12px] tablet:gap-[20px] pc:mt-[40px] pc:grid-cols-3">
            {sales.map((sale) => (
              <ScaledPhotoCard
                key={sale.id}
                variant="sale"
                status={
                  sale.status === "ON_EXCHANGE"
                    ? "교환 제시 중"
                    : sale.status === "ON_SALE"
                      ? "판매 중"
                      : undefined
                }
                point={sale.price}
                isSoldOut={sale.status === "SOLD_OUT"}
                onClick={() => router.push(`/market/${sale.id}`)}
                card={{
                  name: sale.card.name,
                  tag: sale.card.tag,
                  imageUrl: sale.card.image,
                  filterType: sale.card.filterType,
                  category: sale.card.category,
                  score: sale.card.score,
                }}
              />
            ))}
          </section>
        ) : (
          <div className="font-sans-400 mt-[200px] text-center text-[25px] text-gray-300">
            해당하는 포토카드가 없습니다.
          </div>
        )}

        {/* 포토카드 목록 페이지네이션 */}
        {!isSalesLoading && !salesError && totalPages > 0 && (
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
