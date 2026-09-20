"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import MarketHeader from "@/components/market/MarketHeader";
import MarketFilters from "@/components/market/MarketFilters";
import MarketCardList from "@/components/market/MarketCardList";
import MarketEmpty from "@/components/market/MarketEmpty";
import MobileFilter from "@/components/card/MobileFilter";
import CreateSaleModal from "@/components/trade/CreateSaleModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import AppHeader from "@/components/ui/AppHeader";

import { apiFetch } from "@/lib/api-client";
import { saleToPhotoCardProps } from "@/components/card/toPhotoCardProps";
import { useAuth } from "@/lib/auth/AuthProvider";

const PAGE_SIZE = 20;

const ORDER_BY_MAP = {
  "관상 지수 높은 순": "SCORE_DESC",
  "관상 지수 낮은 순": "SCORE_ASC",
  "낮은 포인트 순": "POINT_ASC",
  "높은 포인트 순": "POINT_DESC",
  "최근 등록 순": "RECENT",
  "오래된 등록 순": "OLDEST",
};

export default function MarketPage() {
  const router = useRouter();
  //판매 목록 로딩과 중복되지 않게 AuthLoading으로 받는다
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  // ========================================
  // 실제 적용된 필터
  // ========================================

  // 검색
  const [keyword, setKeyword] = useState("");

  // 입력이 멈춘 뒤 300ms 후에만 실제 요청에 반영되는 검색어 (마이갤러리와 동일한 디바운스 방식)
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  // 실제 적용된 카테고리
  const [categories, setCategories] = useState([]);

  // 실제 적용된 품절 포함 여부
  // false = 품절 제외
  // true = 품절 포함
  const [isSoldOutIncluded, setIsSoldOutIncluded] = useState(false);

  // 정렬
  const [sort, setSort] = useState("최근 등록 순");

  // ========================================
  // 모바일 필터 임시 상태
  // ========================================

  // 모바일 필터 안에서 현재 선택 중인 카테고리
  const [tempCategories, setTempCategories] = useState([]);

  // 모바일 필터 안에서 현재 선택 중인 품절 포함 여부
  const [tempIsSoldOutIncluded, setTempIsSoldOutIncluded] = useState(false);

  // 모바일 필터 열림/닫힘
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // ========================================
  // 판매 데이터
  // ========================================

  const [cards, setCards] = useState([]);

  // 로딩
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 다음 cursor
  const [nextCursor, setNextCursor] = useState(null);

  // 더 불러올 데이터가 있는지
  const [hasMore, setHasMore] = useState(true);

  // 카테고리별 카드 개수
  const [countsBySoldOut, setCountsBySoldOut] = useState({
    false: { DOG: 0, CAT: 0 }, //품절제외
    true: { DOG: 0, CAT: 0 }, //품절포함
  });

  // ========================================
  // 모달
  // ========================================

  // 로그인 필요 모달
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 판매글 생성 모달
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);

  const observerRef = useRef(null);

  // 요청 중복 방지
  const isFetchingRef = useRef(false);

  // 검색어는 입력이 멈춘 뒤 300ms 후에만 요청에 반영
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  /**
   * 판매 데이터 → MarketCard 형태로 변환
   */
  const normalizeSale = useCallback((sale) => {
    const hasPendingExchange = sale.status === "ON_EXCHANGE";

    const photoCardProps = saleToPhotoCardProps(
      {
        ...sale,
        status: hasPendingExchange ? "ON_SALE" : sale.status,
      },
      hasPendingExchange,
    );

    return {
      ...sale,

      id: sale.id,
      name: sale.card.name,
      image: sale.card.image,
      price: sale.price,
      saleStatus: sale.status,

      ...photoCardProps,
    };
  }, []);

  /**
   * ========================================
   * 카테고리별 판매 개수 조회
   * GET /sales
   * ========================================
   */
  const fetchCategoryCounts = useCallback(async () => {
    try {
      const fetchCount = async (category, includeSoldOut) => {
        const params = new URLSearchParams();

        params.set("limit", "1");
        params.set("category", category);
        params.set("includeSoldOut", String(includeSoldOut));

        // 검색어가 있다면 검색 결과 기준으로 카운팅
        if (debouncedKeyword.trim()) {
          params.set("keyword", debouncedKeyword.trim());
        }

        const result = await apiFetch(`/sales?${params.toString()}`);

        return typeof result?.totalCount === "number" ? result.totalCount : 0;
      };

      const [dogExcluded, catExcluded, dogIncluded, catIncluded] = await Promise.all([
        fetchCount("DOG", false),
        fetchCount("CAT", false),
        fetchCount("DOG", true),
        fetchCount("CAT", true),
      ]);

      setCountsBySoldOut({
        false: { DOG: dogExcluded, CAT: catExcluded },
        true: { DOG: dogIncluded, CAT: catIncluded },
      });
    } catch (error) {
      console.error("카테고리별 판매 개수 조회 실패:", error);

      setCountsBySoldOut({
        false: { DOG: 0, CAT: 0 },
        true: { DOG: 0, CAT: 0 },
      });
    }
  }, [debouncedKeyword]);

  /**
   * ========================================
   * 판매 목록 조회
   * GET /sales
   * ========================================
   */
  const fetchSales = useCallback(
    async ({ cursor = null, append = false } = {}) => {
      // 이미 요청 중이면 중복 요청 방지
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setCards([]);
        setNextCursor(null);
        setHasMore(true);
      }

      try {
        const params = new URLSearchParams();

        params.set("limit", String(PAGE_SIZE));

        // ========================================
        // 검색어
        // ========================================

        if (debouncedKeyword.trim()) {
          params.set("keyword", debouncedKeyword.trim());
        }

        // ========================================
        // 카테고리
        // ========================================

        // API는 category 하나만 받을 수 있음
        //
        // []              → 전체
        // ["DOG"]         → 강아지
        // ["CAT"]         → 고양이
        // ["DOG", "CAT"]  → 전체
        //
        if (categories.length === 1) {
          params.set("category", categories[0]);
        }

        // ========================================
        // 품절 포함 여부
        // ========================================

        // false → 품절 제외
        // true  → 품절 포함
        params.set("includeSoldOut", String(isSoldOutIncluded));

        // ========================================
        // 정렬
        // ========================================

        const orderBy = ORDER_BY_MAP[sort];

        if (orderBy) {
          params.set("orderBy", orderBy);
        }

        // ========================================
        // cursor
        // ========================================

        if (cursor) {
          params.set("cursor", cursor);
        }

        const result = await apiFetch(`/sales?${params.toString()}`);

        const lists = result?.lists ?? [];
        const newCursor = result?.nextCursor ?? null;

        const normalizedCards = lists.map(normalizeSale);

        if (append) {
          setCards((prevCards) => [...prevCards, ...normalizedCards]);
        } else {
          setCards(normalizedCards);
        }

        setNextCursor(newCursor);
        setHasMore(Boolean(newCursor));
      } catch (error) {
        console.error("판매 목록 조회 실패:", error);

        if (!append) {
          setCards([]);
        }

        setNextCursor(null);
        setHasMore(false);
      } finally {
        isFetchingRef.current = false;
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [debouncedKeyword, categories, isSoldOutIncluded, sort, normalizeSale],
  );

  /**
   * ========================================
   * 검색 / 실제 필터 / 정렬 변경
   * ========================================
   *
   * 변경되면 첫 페이지부터 다시 조회
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSales({
      cursor: null,
      append: false,
    });

    fetchCategoryCounts();
  }, [fetchSales, fetchCategoryCounts]);

  /**
   * ========================================
   * 모바일 필터 열기
   * ========================================
   */
  const handleOpenMobileFilter = () => {
    setTempCategories([...categories]);

    setTempIsSoldOutIncluded(isSoldOutIncluded);

    setIsMobileFilterOpen(true);
  };

  /**
   * ========================================
   * 모바일 필터 닫기
   * ========================================
   *
   * 적용하지 않고 닫으면
   * 임시 선택은 버린다.
   */
  const handleCloseMobileFilter = () => {
    setTempCategories([...categories]);

    setTempIsSoldOutIncluded(isSoldOutIncluded);

    setIsMobileFilterOpen(false);
  };

  /**
   * ========================================
   * 모바일 필터 적용
   * ========================================
   */
  const handleApplyMobileFilter = () => {
    setCategories([...tempCategories]);

    setIsSoldOutIncluded(tempIsSoldOutIncluded);

    setIsMobileFilterOpen(false);
  };

  /**
   * ========================================
   * 모바일 필터 전체 초기화
   * ========================================
   *
   * 카테고리
   * 품절 여부
   * 검색어
   * 정렬
   * 모두 기본값으로 초기화
   */
  const handleResetFilters = () => {
    // 모바일 임시 상태 초기화
    setTempCategories([]);
    setTempIsSoldOutIncluded(false);

    // 실제 적용 상태 초기화
    setCategories([]);
    setIsSoldOutIncluded(false);

    // 검색어 초기화
    setKeyword("");
    setDebouncedKeyword("");

    // 정렬 초기화
    setSort("최근 등록 순");
  };

  /**
   * ========================================
   * 무한 스크롤
   * ========================================
   */
  useEffect(() => {
    const target = observerRef.current;

    if (!target || !hasMore || isLoading || isLoadingMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (!entry.isIntersecting) {
          return;
        }

        if (!nextCursor) {
          return;
        }

        fetchSales({
          cursor: nextCursor,
          append: true,
        });
      },
      {
        rootMargin: "300px",
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [nextCursor, hasMore, isLoading, isLoadingMore, fetchSales]);

  /**
   * ========================================
   * 카드 클릭
   * ========================================
   *
   * 로그인 상태
   * → 카드 상세 페이지 이동
   *
   * 비로그인 상태
   * → 로그인 필요 모달
   */
  const handleCardClick = async (card) => {
    if (isAuthLoading) {
      return;
    }

    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }

    router.push(`/market/${card.id}`);
  };

  /**
   * ========================================
   * 나의 포토카드 판매하기
   * ========================================
   *
   * 로그인 상태
   * → 판매 모달
   *
   * 비로그인 상태
   * → 로그인 필요 모달
   */
  const handleOpenSaleModal = async () => {
    if (isAuthLoading) {
      return;
    }

    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }

    setIsSaleModalOpen(true);
  };

  /**
   * ========================================
   * 로그인 모달에서 로그인 버튼
   * ========================================
   */
  const handleLoginConfirm = () => {
    setIsLoginModalOpen(false);
    router.push("/login");
  };

  /**
   * ========================================
   * 로그인 모달에서 취소 버튼
   * ========================================
   */
  const handleLoginCancel = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <>
      <AppHeader />

      <main
        className="
          isolate
          mx-auto
          min-h-screen
          w-full
          max-w-[1248px]
          px-[16px]
          pt-[20px]
          pb-[37px]

          tablet:px-[20px]
          tablet:pt-[64px]
          tablet:pb-[224px]

          pc:px-0
          pc:pb-[240px]
        "
      >
        <MarketHeader onOpenSaleModal={handleOpenSaleModal} />

        {/* ========================================
            검색 / 필터 / 정렬
        ======================================== */}
        <section className="tablet:mt-4 pc:mt-6">
          <MarketFilters
            keyword={keyword}
            setKeyword={setKeyword}
            categories={categories}
            setCategories={setCategories}
            soldOut={isSoldOutIncluded}
            setSoldOut={setIsSoldOutIncluded}
            sort={sort}
            setSort={setSort}
            onOpenMobileFilter={handleOpenMobileFilter}
          />
        </section>

        {/* ========================================
            카드 목록
        ======================================== */}
        <section className="mt-4 tablet:mt-6 pc:mt-8">
          {isLoading ? (
            <div className="flex min-h-[300px] items-center justify-center text-white">
              판매 목록을 불러오는 중...
            </div>
          ) : cards.length === 0 ? (
            <MarketEmpty />
          ) : (
            <>
              <MarketCardList cards={cards} onCardClick={handleCardClick} />

              {/* 무한 스크롤 감지 영역 */}
              <div ref={observerRef} className="h-[1px] w-full" aria-hidden="true" />

              {isLoadingMore && (
                <div className="py-8 text-center text-sm text-white">더 불러오는 중...</div>
              )}
            </>
          )}
        </section>
      </main>

      {/* ========================================
          모바일 필터 Bottom Sheet
      ======================================== */}
      <MobileFilter
        isOpen={isMobileFilterOpen}
        onClose={handleCloseMobileFilter}
        categories={tempCategories}
        setCategories={setTempCategories}
        soldOut={tempIsSoldOutIncluded}
        setSoldOut={setTempIsSoldOutIncluded}
        onApply={handleApplyMobileFilter}
        onReset={handleResetFilters}
        countsBySoldOut={countsBySoldOut}
      />

      {/* ========================================
          판매글 생성 모달
      ======================================== */}
      <CreateSaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        onCreated={() => {
          fetchSales({
            cursor: null,
            append: false,
          });

          fetchCategoryCounts();
        }}
      />

      {/* ========================================
          로그인 필요 모달
      ======================================== */}
      <ConfirmModal
        isOpen={isLoginModalOpen}
        title="로그인이 필요합니다"
        description={"로그인 하시겠습니까?\n다양한 서비스를 편리하게 이용하실 수 있습니다."}
        confirmLabel="로그인"
        onConfirm={handleLoginConfirm}
        onClose={handleLoginCancel}
      />
    </>
  );
}
