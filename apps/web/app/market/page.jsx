"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const PAGE_SIZE = 8;

// ========================================
// 관상 지수 이름
// ========================================

const SCORE_LABELS = {
  DOG: {
    ENERGIZER: "에너자이저",
    MY_WAY: "마이웨이",
    CAPITALIST: "자본가",
    GRUMPY: "멍탐정",
  },

  CAT: {
    UDADA: "우다다",
    ALOOF: "도도냥",
    CHURU_HUNTER: "츄르 헌터",
    PUNY_HUMAN: "집사 조련사",
  },
};

// ========================================
// 관상 지수 데이터 변환
// ========================================

function getScoreRows(card) {
  const category = card.filterType === 1 ? "CAT" : "DOG";

  const score = card.score;

  if (!score) {
    return [];
  }

  const labels = SCORE_LABELS[category];

  return Object.entries(score).map(([key, value]) => ({
    key,
    label: labels?.[key] ?? key,
    value: Number(value),
  }));
}

// ========================================
// 페이지
// ========================================

export default function MarketPlacePage() {
  // ========================================
  // 상태
  // ========================================

  const [keyword, setKeyword] = useState("");

  // 카테고리
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  // 품질 여부
  const [quality, setQuality] = useState(false);

  // 정렬
  const [sort, setSort] = useState("최근 등록 순");
  const [sortOpen, setSortOpen] = useState(false);

  // 무한 스크롤
  const loadMoreRef = useRef(null);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // ========================================
  // 임시 목데이터
  // ========================================

  const cards = [
    {
      id: "card-001",
      name: "나비",
      filterType: 1,
      tag: "우주를 정복하는 마에스트로",
      topScore: 35,
      score: {
        UDADA: 35,
        ALOOF: 25,
        CHURU_HUNTER: 22,
        PUNY_HUMAN: 18,
      },
      description: "도도하지만 츄르 앞에서는 솔직해지는 고양이입니다.",
      price: 5000,
      status: "ON_SALE",
      createdAt: "2026-08-21T12:00:00+09:00",
      image: "/images/card-01.png",
      isQuality: true,
    },

    {
      id: "card-002",
      name: "콩이",
      filterType: 2,
      tag: "세상을 누비는 에너자이저",
      topScore: 40,
      score: {
        ENERGIZER: 40,
        MY_WAY: 30,
        CAPITALIST: 20,
        GRUMPY: 10,
      },
      description: "잠시도 가만히 있지 않는 에너지 넘치는 강아지입니다.",
      price: 7000,
      status: "ON_SALE",
      createdAt: "2026-08-22T12:00:00+09:00",
      image: "/images/card-02.png",
      isQuality: true,
    },

    {
      id: "card-003",
      name: "루루",
      filterType: 1,
      tag: "도도한 매력의 집사",
      topScore: 38,
      score: {
        UDADA: 38,
        ALOOF: 27,
        CHURU_HUNTER: 20,
        PUNY_HUMAN: 15,
      },
      description: "무심한 듯하지만 은근히 사람을 챙기는 고양이입니다.",
      price: 6500,
      status: "SOLD_OUT",
      createdAt: "2026-08-23T12:00:00+09:00",
      image: "/images/card-03.png",
      isQuality: false,
    },

    {
      id: "card-004",
      name: "초코",
      filterType: 2,
      tag: "나만의 길을 걷는 멍멍이",
      topScore: 36,
      score: {
        ENERGIZER: 36,
        MY_WAY: 29,
        CAPITALIST: 20,
        GRUMPY: 15,
      },
      description: "남의 시선보다 자신의 길을 중요하게 생각합니다.",
      price: 8000,
      status: "ON_SALE",
      createdAt: "2026-08-24T12:00:00+09:00",
      image: "/images/card-04.png",
      isQuality: true,
    },

    {
      id: "card-005",
      name: "보리",
      filterType: 1,
      tag: "츄르를 사수하는 헌터",
      topScore: 42,
      score: {
        UDADA: 42,
        ALOOF: 25,
        CHURU_HUNTER: 18,
        PUNY_HUMAN: 15,
      },
      description: "츄르를 발견하면 누구보다 빠르게 달려갑니다.",
      price: 6500,
      status: "ON_SALE",
      createdAt: "2026-08-25T12:00:00+09:00",
      image: "/images/card-05.png",
      isQuality: true,
    },

    {
      id: "card-006",
      name: "두부",
      filterType: 2,
      tag: "작은 자본가",
      topScore: 39,
      score: {
        ENERGIZER: 39,
        MY_WAY: 26,
        CAPITALIST: 21,
        GRUMPY: 14,
      },
      description: "무엇이든 효율과 가치를 먼저 생각하는 강아지입니다.",
      price: 8000,
      status: "ON_SALE",
      createdAt: "2026-08-26T12:00:00+09:00",
      image: "/images/card-06.png",
      isQuality: false,
    },

    {
      id: "card-007",
      name: "까미",
      filterType: 2,
      tag: "까칠하지만 귀여운 멍멍이",
      topScore: 37,
      score: {
        ENERGIZER: 37,
        MY_WAY: 28,
        CAPITALIST: 20,
        GRUMPY: 15,
      },
      description: "조금 까칠하지만 알고 보면 정이 많은 강아지입니다.",
      price: 9000,
      status: "SOLD_OUT",
      createdAt: "2026-08-27T12:00:00+09:00",
      image: "/images/card-07.png",
      isQuality: true,
    },

    {
      id: "card-008",
      name: "모찌",
      filterType: 1,
      tag: "인간을 다루는 마에스트로",
      topScore: 34,
      score: {
        UDADA: 34,
        ALOOF: 30,
        CHURU_HUNTER: 21,
        PUNY_HUMAN: 15,
      },
      description: "집사를 자신의 뜻대로 움직이게 만드는 고양이입니다.",
      price: 10000,
      status: "ON_SALE",
      createdAt: "2026-08-28T12:00:00+09:00",
      image: "/images/card-08.png",
      isQuality: false,
    },

    {
      id: "card-009",
      name: "댕이",
      filterType: 2,
      tag: "끝없이 달리는 에너자이저",
      topScore: 45,
      score: {
        ENERGIZER: 45,
        MY_WAY: 23,
        CAPITALIST: 18,
        GRUMPY: 14,
      },
      description: "산책이라는 단어만 들어도 뛰기 시작합니다.",
      price: 7500,
      status: "ON_SALE",
      createdAt: "2026-08-29T12:00:00+09:00",
      image: "/images/card-09.png",
      isQuality: true,
    },

    {
      id: "card-010",
      name: "솜이",
      filterType: 1,
      tag: "도도한 츄르 헌터",
      topScore: 35,
      score: {
        UDADA: 35,
        ALOOF: 33,
        CHURU_HUNTER: 18,
        PUNY_HUMAN: 14,
      },
      description: "도도함과 츄르 사랑을 동시에 가진 고양이입니다.",
      price: 4000,
      status: "CANCELED",
      createdAt: "2026-08-30T12:00:00+09:00",
      image: "/images/card-10.png",
      isQuality: false,
    },

    {
      id: "card-011",
      name: "호두",
      filterType: 2,
      tag: "자유로운 에너자이저",
      topScore: 40,
      score: {
        ENERGIZER: 40,
        MY_WAY: 32,
        CAPITALIST: 16,
        GRUMPY: 12,
      },
      description: "자유롭게 뛰어다니는 것을 좋아하는 강아지입니다.",
      price: 6800,
      status: "ON_SALE",
      createdAt: "2026-08-31T12:00:00+09:00",
      image: "/images/card-11.png",
      isQuality: true,
    },

    {
      id: "card-012",
      name: "별이",
      filterType: 1,
      tag: "우아한 고양이",
      topScore: 41,
      score: {
        UDADA: 41,
        ALOOF: 24,
        CHURU_HUNTER: 20,
        PUNY_HUMAN: 15,
      },
      description: "조용하고 우아한 분위기를 가진 고양이입니다.",
      price: 8200,
      status: "ON_SALE",
      createdAt: "2026-09-01T12:00:00+09:00",
      image: "/images/card-12.png",
      isQuality: true,
    },
  ];

  // ========================================
  // 카테고리 이름 변환
  // ========================================

  const getCategoryName = (filterType) => {
    if (filterType === 1) return "고양이";
    if (filterType === 2) return "강아지";

    return "";
  };

  // ========================================
  // 필터링 + 정렬
  // ========================================

  const filteredCards = useMemo(() => {
    const result = cards.filter((card) => {
      // 검색
      const searchText = keyword.trim().toLowerCase();

      const matchesKeyword =
        card.name.toLowerCase().includes(searchText) || card.tag.toLowerCase().includes(searchText);

      // 카테고리
      const matchesCategory =
        categories.length === 0 || categories.includes(getCategoryName(card.filterType));

      // 품질
      const matchesQuality = !quality || card.isQuality;

      return matchesKeyword && matchesCategory && matchesQuality;
    });

    // ========================================
    // 정렬
    // ========================================

    result.sort((a, b) => {
      switch (sort) {
        case "관상 지수 높은 순":
          return b.topScore - a.topScore;

        case "관상 지수 낮은 순":
          return a.topScore - b.topScore;

        case "낮은 포인트 순":
          return a.price - b.price;

        case "높은 포인트 순":
          return b.price - a.price;

        case "최근 등록 순":
          return new Date(b.createdAt) - new Date(a.createdAt);

        case "오래된 등록 순":
          return new Date(a.createdAt) - new Date(b.createdAt);

        default:
          return 0;
      }
    });

    return result;
  }, [keyword, categories, quality, sort]);

  // ========================================
  // 현재 화면에 보여줄 카드
  // ========================================

  const displayedCards = filteredCards.slice(0, visibleCount);

  // ========================================
  // 카테고리 체크박스
  // ========================================

  const handleCategoryChange = (category) => {
    setCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((item) => item !== category);
      }

      return [...prev, category];
    });
  };

  // ========================================
  // 정렬 옵션
  // ========================================

  const sortOptions = [
    "관상 지수 높은 순",
    "관상 지수 낮은 순",
    "낮은 포인트 순",
    "높은 포인트 순",
    "최근 등록 순",
    "오래된 등록 순",
  ];

  const handleSort = (value) => {
    setSort(value);
    setSortOpen(false);
  };

  // ========================================
  // 가격 표시
  // ========================================

  const formatPrice = (price) => {
    return Number(price).toLocaleString("ko-KR");
  };

  // ========================================
  // 필터 초기화
  // ========================================

  const resetFilters = () => {
    setKeyword("");
    setCategories([]);
    setQuality(false);
    setSort("최근 등록 순");

    setCategoryOpen(false);
    setSortOpen(false);
  };

  // ========================================
  // 무한 스크롤
  // ========================================

  const loadNextPage = () => {
    if (isLoading || !hasMore) {
      return;
    }

    // 이미 모든 카드가 보이는 경우
    if (visibleCount >= filteredCards.length) {
      setHasMore(false);
      return;
    }

    setIsLoading(true);

    // 실제 API 연결 전 테스트용
    setTimeout(() => {
      setVisibleCount((prev) => {
        const nextCount = prev + PAGE_SIZE;

        if (nextCount >= filteredCards.length) {
          setHasMore(false);
        }

        return nextCount;
      });

      setIsLoading(false);
    }, 500);
  };

  // ========================================
  // Intersection Observer
  // ========================================

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadNextPage();
        }
      },
      {
        rootMargin: "300px",
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, filteredCards.length, visibleCount]);

  // ========================================
  // 필터 / 정렬 변경 시 처음부터 다시 표시
  // ========================================

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      {/* ==================================
        페이지 전체
    ================================== */}

      <div className="mx-auto w-[1248px]">
        {/* ==================================
          페이지 상단
      ================================== */}

        <section className="pt-[16px]">
          <div className="flex h-[85px] items-start justify-between border-b border-white">
            {/* 제목 */}

            <h1 className="pt-[0px] text-[48px] font-bold leading-[1.2] tracking-[-2px]">
              마켓플레이스
            </h1>

            {/* 판매하기 버튼 */}

            <button
              type="button"
              className="
              mt-[0px]
              flex
              h-[60px]
              w-[442px]
              items-center
              justify-center
              rounded-[2px]
              bg-[#9b51e5]
              text-[18px]
              font-bold
              text-white
              transition
              hover:bg-[#a65bea]
            "
            >
              나의 포토카드 판매하기
            </button>
          </div>
        </section>

        {/* ==================================
          검색 / 필터 / 정렬
      ================================== */}

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
              {/* 카테고리 */}

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

                {/* 카테고리 드롭다운 */}

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
                      <span>강아지</span>

                      <input
                        type="checkbox"
                        checked={categories.includes("강아지")}
                        onChange={() => handleCategoryChange("강아지")}
                        className="
                        h-[16px]
                        w-[16px]
                        cursor-pointer
                        accent-[#9b51e5]
                      "
                      />
                    </label>

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
                      <span>고양이</span>

                      <input
                        type="checkbox"
                        checked={categories.includes("고양이")}
                        onChange={() => handleCategoryChange("고양이")}
                        className="
                        h-[16px]
                        w-[16px]
                        cursor-pointer
                        accent-[#9b51e5]
                      "
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* 품질 여부 */}

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
                    onChange={(e) => setQuality(e.target.checked)}
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

            <div className="relative ml-auto w-[200px]">
              <button
                type="button"
                className="
                flex
                h-[51px]
                w-full
                items-center
                justify-between
                border
                border-[#666666]
                bg-[#0f0f0f]
                px-[18px]
                text-[14px]
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
                  text-[10px]
                  transition-transform
                  duration-200
                  ${sortOpen ? "rotate-180" : ""}
                `}
                >
                  ▼
                </span>
              </button>

              {/* 정렬 드롭다운 */}

              {sortOpen && (
                <div
                  className="
                  absolute
                  right-0
                  top-[56px]
                  z-50
                  w-[200px]
                  border
                  border-[#666666]
                  bg-[#151515]
                "
                >
                  {sortOptions.map((option) => (
                    <button
                      type="button"
                      key={option}
                      className={`
                        flex
                        h-[51px]
                        w-full
                        items-center
                        px-[18px]
                        text-left
                        text-[14px]
                        transition
                        hover:bg-[#292929]
                        ${sort === option ? "bg-[#292929] font-bold text-[#a855f7]" : "text-white"}
                      `}
                      onClick={() => handleSort(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ==================================
          카드 목록
      ================================== */}

        <section className="pb-[80px] pt-[32px]">
          {filteredCards.length > 0 ? (
            <>
              <ul
                className="
                grid
                grid-cols-3
                gap-[20px]
              "
              >
                {displayedCards.map((card) => {
                  const scoreRows = getScoreRows(card);

                  return (
                    <li key={card.id} className="min-w-0">
                      <Link
                        href={`/market/${card.id}`}
                        className="
                          group
                          block
                          overflow-hidden
                          rounded-[12px]
                          border
                          border-[#555555]
                          bg-gradient-to-b
                          from-[#444444]
                          to-[#292929]
                          transition-all
                          duration-200
                          hover:-translate-y-[3px]
                          hover:border-[#777777]
                          hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)]
                        "
                      >
                        {/* ==================================
                            카드 이미지
                        ================================== */}

                        <div
                          className="
                            relative
                            mx-[12px]
                            mt-[12px]
                            aspect-[1.55/1]
                            overflow-hidden
                            rounded-[8px]
                            bg-[#333333]
                          "
                        >
                          <Image
                            src={card.image}
                            alt={card.name}
                            fill
                            sizes="400px"
                            className="
                              object-cover
                              transition-transform
                              duration-300
                              group-hover:scale-[1.02]
                            "
                          />

                          {/* SOLD OUT */}

                          {card.status === "SOLD_OUT" && (
                            <div
                              className="
                                absolute
                                inset-0
                                flex
                                items-center
                                justify-center
                                bg-black/65
                              "
                            >
                              <span
                                className="
                                  text-[24px]
                                  font-bold
                                  tracking-[1px]
                                  text-white
                                "
                              >
                                SOLD OUT
                              </span>
                            </div>
                          )}
                        </div>

                        {/* ==================================
                            카드 정보
                        ================================== */}

                        <div
                          className="
                            px-[12px]
                            pb-[16px]
                            pt-[12px]
                          "
                        >
                          {/* 카드 제목 */}

                          <h3
                            className="
                              min-h-[52px]
                              text-[19px]
                              font-bold
                              leading-[1.4]
                              tracking-[-0.5px]
                              text-white
                            "
                          >
                            {card.tag}
                          </h3>

                          {/* ==================================
                              관상 지수
                          ================================== */}

                          <div
                            className="
                              mt-[12px]
                              flex
                              flex-col
                              gap-[7px]
                            "
                          >
                            {scoreRows.map((score) => (
                              <div
                                key={score.key}
                                className="
                                    grid
                                    grid-cols-[64px_minmax(0,1fr)_40px]
                                    items-center
                                    gap-[8px]
                                    text-[12px]
                                  "
                              >
                                {/* 이름 */}

                                <span className="truncate text-white">{score.label}</span>

                                {/* 막대 */}

                                <div
                                  className="
                                      h-[6px]
                                      overflow-hidden
                                      rounded-full
                                      bg-[#f1f1f1]
                                    "
                                >
                                  <span
                                    className="
                                        block
                                        h-full
                                        rounded-full
                                        bg-[#a855f7]
                                      "
                                    style={{
                                      width: `${score.value}%`,
                                    }}
                                  />
                                </div>

                                {/* 퍼센트 */}

                                <span className="text-right text-white">{score.value}%</span>
                              </div>
                            ))}
                          </div>

                          {/* 구분선 */}

                          <div
                            className="
                              my-[14px]
                              h-px
                              bg-[#555555]
                            "
                          />

                          {/* ==================================
                              구매 포인트
                          ================================== */}

                          <div className="flex items-center justify-between">
                            <span
                              className="
                                text-[13px]
                                text-white
                              "
                            >
                              구매 포인트
                            </span>

                            <strong
                              className="
                                text-[24px]
                                font-normal
                                leading-none
                                text-[#f5bd45]
                              "
                            >
                              {formatPrice(card.price)}

                              <small
                                className="
                                  ml-[4px]
                                  text-[12px]
                                  text-white
                                "
                              >
                                P
                              </small>
                            </strong>
                          </div>

                          {/* ==================================
                              로고
                          ================================== */}

                          <div
                            className="
                              mt-[10px]
                              flex
                              h-[24px]
                              items-center
                              justify-center
                            "
                          >
                            <Image
                              src="/images/logo.png"
                              alt="최애멍냥"
                              width={80}
                              height={24}
                              className="h-[24px] w-[80px] object-contain"
                            />
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* ==================================
                무한 스크롤 감지
            ================================== */}

              <div ref={loadMoreRef} className="h-[1px] w-full" aria-hidden="true" />

              {isLoading && (
                <div
                  className="
                  py-[24px]
                  text-center
                  text-[14px]
                  text-[#999999]
                "
                >
                  포토카드를 불러오는 중...
                </div>
              )}
            </>
          ) : (
            /* ==================================
              검색 결과 없음
          ================================== */

            <div
              className="
              flex
              min-h-[300px]
              flex-col
              items-center
              justify-center
              gap-[20px]
              text-center
            "
            >
              <p className="text-[15px] text-[#999999]">검색 조건에 맞는 포토카드가 없습니다.</p>

              <button
                type="button"
                onClick={resetFilters}
                className="
                border
                border-[#666666]
                px-[20px]
                py-[8px]
                text-[14px]
                text-white
                transition
                hover:bg-[#292929]
              "
              >
                필터 초기화
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
