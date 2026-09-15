"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import MarketHeader from "@/components/market/MarketHeader";
import MarketFilters from "@/components/market/MarketFilters";
import MarketCardList from "@/components/market/MarketCardList";
import MarketEmpty from "@/components/market/MarketEmpty";
import ConfirmModal from "@/components/ui/ConfirmModal";

import { getCurrentUser } from "@/lib/auth/api";
import { cardToPhotoCardProps } from "@/components/card/toPhotoCardProps";

import { mockCards } from "@/mocks/cards";

export default function MarketPage() {
  const router = useRouter();
  // ========================================
  // 검색 / 필터 / 정렬 상태
  // ========================================

  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [isQuality, setIsQuality] = useState(false);
  const [sort, setSort] = useState("최근 등록 순");

  // ========================================
  // 무한 스크롤
  // ========================================

  const [visibleCount, setVisibleCount] = useState(6);
  const [isLoading, setIsLoading] = useState(false);

  const observerRef = useRef(null);

  // ========================================
  // 로그인 상태
  // ========================================

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // ========================================
  // 로그인 여부 확인
  // ========================================

  useEffect(() => {
    const checkLogin = async () => {
      try {
        await getCurrentUser();
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      }
    };

    checkLogin();
  }, []);

  // ========================================
  // 검색
  // ========================================

  const handleSearchChange = (value) => {
    setSearch(value);
    setVisibleCount(6);
  };

  // ========================================
  // 카테고리
  // ========================================

  const handleCategoryChange = (value) => {
    setCategories((prev) => {
      if (prev.includes(value)) {
        return prev.filter((category) => category !== value);
      }

      return [...prev, value];
    });

    setVisibleCount(6);
  };

  // ========================================
  // 품질 필터
  // ========================================

  const handleQualityChange = (value) => {
    setIsQuality(value);
    setVisibleCount(6);
  };

  // ========================================
  // 정렬
  // ========================================

  const handleSortChange = (value) => {
    setSort(value);
    setVisibleCount(6);
  };

  // ========================================
  // 카드 클릭
  // ========================================

  const handleCardClick = (cardId) => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }

    router.push(`/market/${cardId}`);
  };

  // ========================================
  // 카드 데이터 변환 + 필터 + 정렬
  // ========================================

  const filteredCards = useMemo(() => {
    /*
     * mockCards
     * ↓
     * cardToPhotoCardProps()
     * ↓
     * PhotoCard에서 사용할 수 있는 데이터 형태 추가
     *
     * 기존 card 데이터는 ...card로 유지한다.
     */
    let result = mockCards.map((card) => ({
      ...card,
      ...cardToPhotoCardProps(card),
    }));

    // ========================================
    // 검색
    // ========================================

    if (search.trim()) {
      const keyword = search.trim().toLowerCase();

      result = result.filter((card) => {
        return (
          card.name?.toLowerCase().includes(keyword) ||
          card.title?.toLowerCase().includes(keyword) ||
          card.tag?.toLowerCase().includes(keyword) ||
          card.description?.toLowerCase().includes(keyword)
        );
      });
    }

    // ========================================
    // 카테고리
    // ========================================

    if (categories.length > 0) {
      result = result.filter((card) => {
        return categories.includes(card.category);
      });
    }

    // ========================================
    // 품질 필터
    // ========================================

    if (isQuality) {
      result = result.filter((card) => {
        return Number(card.filterType) >= 3;
      });
    }

    // ========================================
    // 정렬
    // ========================================

    if (sort === "관상 지수 높은 순") {
      result.sort((a, b) => {
        return Number(b.topScore ?? 0) - Number(a.topScore ?? 0);
      });
    }

    if (sort === "관상 지수 낮은 순") {
      result.sort((a, b) => {
        return Number(a.topScore ?? 0) - Number(b.topScore ?? 0);
      });
    }

    if (sort === "최근 등록 순") {
      result.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    if (sort === "오래된 등록 순") {
      result.sort((a, b) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    }

    return result;
  }, [search, categories, isQuality, sort]);

  // ========================================
  // 현재 표시할 카드
  // ========================================

  const visibleCards = useMemo(() => {
    return filteredCards.slice(0, visibleCount);
  }, [filteredCards, visibleCount]);

  // ========================================
  // 더 불러올 카드가 있는지
  // ========================================

  const hasMore = visibleCount < filteredCards.length;

  // ========================================
  // 무한 스크롤
  // ========================================

  useEffect(() => {
    const target = observerRef.current;

    if (!target || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (!entry.isIntersecting || isLoading) {
          return;
        }

        setIsLoading(true);

        setTimeout(() => {
          setVisibleCount((prev) => {
            return Math.min(prev + 6, filteredCards.length);
          });

          setIsLoading(false);
        }, 300);
      },
      {
        rootMargin: "200px",
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, filteredCards.length, isLoading]);

  return (
    <main
      className="
        mx-auto
        min-h-screen
        w-full
        max-w-[1248px]

        px-[16px]
        pt-[16px]
        pb-[40px]

        tablet:px-[20px]
        tablet:pt-[24px]
        tablet:pb-[60px]

        pc:px-0
        pc:pt-[40px]
        pc:pb-[80px]
      "
    >
      {/* ========================================
          마켓 헤더
      ======================================== */}

      <MarketHeader />

      {/* ========================================
          검색 / 필터

          GalleryToolbar와 동일한 반응형 여백
      ======================================== */}

      <div
        className="
          mt-3

          tablet:mt-4

          pc:mt-6
        "
      >
        <MarketFilters
          keyword={search}
          setKeyword={handleSearchChange}
          categories={categories}
          handleCategoryChange={handleCategoryChange}
          quality={isQuality}
          setQuality={handleQualityChange}
          sort={sort}
          setSort={handleSortChange}
        />
      </div>

      {/* ========================================
          카드 목록

          모바일 / 태블릿
          → 2열

          PC
          → 3열
      ======================================== */}

      <section
        className="
          mt-4

          tablet:mt-6

          pc:mt-8
        "
      >
        {visibleCards.length > 0 ? (
          <MarketCardList cards={visibleCards} onCardClick={handleCardClick} />
        ) : (
          <MarketEmpty />
        )}
      </section>

      {/* ========================================
          로그인 필요 모달
      ======================================== */}

      <ConfirmModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
        }}
        title="로그인이 필요합니다"
        description={"카드 상세 페이지를 확인하려면\n로그인이 필요합니다."}
        confirmLabel="로그인하기"
        onConfirm={() => {
          window.location.href = "/login";
        }}
        isSubmitting={false}
      />

      {/* ========================================
          무한 스크롤 감지 영역
      ======================================== */}

      {hasMore && (
        <div
          ref={observerRef}
          className="
            flex
            h-16
            items-center
            justify-center

            tablet:h-20
          "
          aria-hidden="true"
        >
          {isLoading && (
            <span
              className="
                text-[11px]
                text-gray-400

                tablet:text-sm
              "
            >
              불러오는 중...
            </span>
          )}
        </div>
      )}
    </main>
  );
}
