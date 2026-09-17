"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import MarketHeader from "@/components/market/MarketHeader";
import MarketFilters from "@/components/market/MarketFilters";
import MarketCardList from "@/components/market/MarketCardList";
import MarketEmpty from "@/components/market/MarketEmpty";
import MobileFilter from "@/components/card/MobileFilter";
import ConfirmModal from "@/components/ui/ConfirmModal";
import AppHeader from "@/components/ui/AppHeader";

import { apiFetch } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/auth/api";
import { saleToPhotoCardProps } from "@/components/card/toPhotoCardProps";

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

  // ========================================
  // 실제 적용된 필터
  // ========================================

  // 검색
  const [keyword, setKeyword] = useState("");

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

  // 전체 카드 개수
  const [totalCount, setTotalCount] = useState(0);

  // 카테고리별 카드 개수
  const [categoryCounts, setCategoryCounts] = useState({
    DOG: 0,
    CAT: 0,
  });

  // 로그인 모달
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // IntersectionObserver
  const observerRef = useRef(null);

  // 요청 중복 방지
  const isFetchingRef = useRef(false);

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
   * GET /sales
   */
  const fetchCategoryCounts = useCallback(async () => {
    try {
      const fetchCount = async (category) => {
        const params = new URLSearchParams();

        // 실제 카드 목록이 아니라 개수만 필요하므로 1개만 요청
        params.set("limit", "1");
        params.set("category", category);

        // 검색어가 있다면 검색 결과 기준으로 카운팅
        if (keyword.trim()) {
          params.set("keyword", keyword.trim());
        }

        // 품절 포함 여부도 동일하게 적용
        params.set("includeSoldOut", String(isSoldOutIncluded));

        const result = await apiFetch(`/sales?${params.toString()}`);
        console.log("================================");
        console.log("category:", category);
        console.log("요청 URL:", `/sales?${params.toString()}`);
        console.log("API 응답:", result);
        console.log("totalCount:", result?.totalCount);
        console.log("================================");
        return typeof result?.totalCount === "number" ? result.totalCount : 0;
      };

      const [dogCount, catCount] = await Promise.all([fetchCount("DOG"), fetchCount("CAT")]);

      setCategoryCounts({
        DOG: dogCount,
        CAT: catCount,
      });
    } catch (error) {
      console.error("카테고리별 판매 개수 조회 실패:", error);

      setCategoryCounts({
        DOG: 0,
        CAT: 0,
      });
    }
  }, [keyword, isSoldOutIncluded]);

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
        if (keyword.trim()) {
          params.set("keyword", keyword.trim());
        }

        // ========================================
        // 카테고리
        // ========================================
        // API는 category 하나만 받을 수 있음
        if (categories.length === 1) {
          params.set("category", categories[0]);
        }

        // ========================================
        // 품절 포함 여부
        // ========================================
        // my-sales의 "품절 포함"과 동일한 의미
        //
        // false → 품절 제외
        // true  → 품절 포함
        //
        // 백엔드에서는 includeSoldOut을 사용함
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

        // 백엔드에서 totalCount를 내려주는 경우 사용
        if (typeof result?.totalCount === "number") {
          setTotalCount(result.totalCount);
        }

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
    [keyword, categories, isSoldOutIncluded, sort, normalizeSale],
  );

  /**
   * 검색 / 실제 필터 / 정렬이 변경되면
   * 첫 페이지부터 다시 조회
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
   * 모바일 필터 열기
   *
   * 현재 실제 적용된 필터를
   * 임시 상태로 복사한다.
   */
  const handleOpenMobileFilter = () => {
    setTempCategories([...categories]);

    setTempIsSoldOutIncluded(isSoldOutIncluded);

    setIsMobileFilterOpen(true);
  };

  /**
   * 모바일 필터 닫기
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
   * 모바일 필터 적용
   *
   * 여기에서 실제 필터 상태를 변경한다.
   *
   * 실제 상태가 변경되면 fetchSales의
   * dependency가 변경되고 GET /sales가 실행된다.
   */
  const handleApplyMobileFilter = () => {
    setCategories([...tempCategories]);

    setIsSoldOutIncluded(tempIsSoldOutIncluded);

    setIsMobileFilterOpen(false);
  };

  /**
   * 무한 스크롤
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
   * 카드 클릭
   */
  const handleCardClick = async (card) => {
    try {
      const currentUser = await getCurrentUser();

      // 여기서 판매 정보와 로그인한 사용자 정보를 기준으로
      // 어떤 모달을 보여줄지 결정
      console.log("선택한 판매글:", card);
      console.log("현재 사용자:", currentUser);
      router.push(`/market/${card.id}`);
    } catch (error) {
      if (error?.status === 401) {
        setIsLoginModalOpen(true);
        return;
      }

      console.error("로그인 상태 확인 실패:", error);

      setIsLoginModalOpen(true);
    }
  };

  return (
    <>
      <AppHeader />

      <main
        className="
          mx-auto
          min-h-screen
          w-full
          max-w-[1248px]
          px-[16px]
          pt-[16px]
          pb-[120px]

          tablet:px-[20px]
          tablet:pt-[24px]
          tablet:pb-[60px]

          pc:px-0
          pc:pt-[40px]
          pc:pb-[80px]
        "
      >
        <MarketHeader />

        {/* ========================================
            검색 / 필터 / 정렬
        ======================================== */}
        <section className="mt-3 tablet:mt-4 pc:mt-6">
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
        totalCount={totalCount}
        onApply={handleApplyMobileFilter}
        categoryCounts={categoryCounts}
      />

      {/* ========================================
          로그인 모달
      ======================================== */}
      {isLoginModalOpen && (
        <ConfirmModal
          title="로그인이 필요해요"
          description="포토카드를 확인하려면 로그인해 주세요."
          confirmText="로그인"
          cancelText="취소"
          onConfirm={() => {
            setIsLoginModalOpen(false);
            router.push("/login");
          }}
          onCancel={() => {
            setIsLoginModalOpen(false);
          }}
        />
      )}
    </>
  );
}
