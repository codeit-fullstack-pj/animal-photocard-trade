"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import MarketHeader from "@/components/market/MarketHeader";
import MarketFilters from "@/components/market/MarketFilters";
import MarketCardList from "@/components/market/MarketCardList";
import MarketEmpty from "@/components/market/MarketEmpty";

import { mockCards } from "@/mocks/cards";

export default function MarketPage() {
  // ==========================================
  // 검색
  // ==========================================

  const [search, setSearch] = useState("");

  // ==========================================
  // 카테고리
  //
  // []              → 전체
  // ["DOG"]         → 강아지만
  // ["CAT"]         → 고양이만
  // ["DOG", "CAT"]  → 강아지 + 고양이
  // ==========================================

  const [categories, setCategories] = useState([]);

  // ==========================================
  // 품질 여부
  // ==========================================

  const [isQuality, setIsQuality] = useState(false);

  // ==========================================
  // 정렬
  // ==========================================

  const [sort, setSort] = useState("최근 등록 순");

  // ==========================================
  // 무한 스크롤
  // ==========================================

  const [visibleCount, setVisibleCount] = useState(6);
  const [isLoading, setIsLoading] = useState(false);

  const observerRef = useRef(null);

  // ==========================================
  // 검색 변경
  // ==========================================

  const handleSearchChange = (value) => {
    setSearch(value);
    setVisibleCount(6);
  };

  // ==========================================
  // 카테고리 선택 변경
  // ==========================================

  const handleCategoryChange = (value) => {
    setCategories((prev) => {
      // 이미 선택된 카테고리라면 제거
      if (prev.includes(value)) {
        return prev.filter((category) => category !== value);
      }

      // 선택되지 않은 카테고리라면 추가
      return [...prev, value];
    });

    setVisibleCount(6);
  };

  // ==========================================
  // 품질 필터 변경
  // ==========================================

  const handleQualityChange = (value) => {
    setIsQuality(value);
    setVisibleCount(6);
  };

  // ==========================================
  // 정렬 변경
  // ==========================================

  const handleSortChange = (value) => {
    setSort(value);
    setVisibleCount(6);
  };

  // ==========================================
  // 카드 필터링 + 정렬
  // ==========================================

  const filteredCards = useMemo(() => {
    let result = [...mockCards];

    // ========================================
    // 검색
    // ========================================

    if (search.trim()) {
      const keyword = search.trim().toLowerCase();

      result = result.filter((card) => {
        return (
          card.name?.toLowerCase().includes(keyword) ||
          card.tag?.toLowerCase().includes(keyword) ||
          card.description?.toLowerCase().includes(keyword)
        );
      });
    }

    // ========================================
    // 카테고리
    //
    // 아무것도 선택하지 않으면 전체 카드
    // ========================================

    if (categories.length > 0) {
      result = result.filter((card) => {
        return categories.includes(card.category);
      });
    }

    // ========================================
    // 품질 여부
    //
    // filterType 3 이상을 품질 카드로 처리
    // ========================================

    if (isQuality) {
      result = result.filter((card) => {
        return Number(card.filterType) >= 3;
      });
    }

    // ========================================
    // 관상 지수 높은 순
    // ========================================

    if (sort === "관상 지수 높은 순") {
      result.sort((a, b) => {
        return Number(b.topScore ?? 0) - Number(a.topScore ?? 0);
      });
    }

    // ========================================
    // 관상 지수 낮은 순
    // ========================================

    if (sort === "관상 지수 낮은 순") {
      result.sort((a, b) => {
        return Number(a.topScore ?? 0) - Number(b.topScore ?? 0);
      });
    }

    // ========================================
    // 최근 등록 순
    // ========================================

    if (sort === "최근 등록 순") {
      result.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    // ========================================
    // 오래된 등록 순
    // ========================================

    if (sort === "오래된 등록 순") {
      result.sort((a, b) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    }

    return result;
  }, [search, categories, isQuality, sort]);

  // ==========================================
  // 현재 화면에 보여줄 카드
  // ==========================================

  const visibleCards = useMemo(() => {
    return filteredCards.slice(0, visibleCount);
  }, [filteredCards, visibleCount]);

  // ==========================================
  // 더 불러올 카드가 있는지
  // ==========================================

  const hasMore = visibleCount < filteredCards.length;

  // ==========================================
  // 무한 스크롤
  // ==========================================

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

  // ==========================================
  // 화면
  // ==========================================

  return (
    <main
      className="
        mx-auto
        w-full
        max-w-[1248px]
        px-5
        py-10
      "
    >
      {/* 마켓플레이스 제목 */}

      <MarketHeader />

      {/* 검색 / 필터 / 정렬 */}

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

      {/* 카드 목록 */}

      {visibleCards.length > 0 ? <MarketCardList cards={visibleCards} /> : <MarketEmpty />}

      {/* 무한 스크롤 감지 영역 */}

      {hasMore && (
        <div
          ref={observerRef}
          className="
            flex
            h-20
            items-center
            justify-center
          "
          aria-hidden="true"
        >
          {isLoading && <span className="text-sm text-gray-400">불러오는 중...</span>}
        </div>
      )}
    </main>
  );
}
