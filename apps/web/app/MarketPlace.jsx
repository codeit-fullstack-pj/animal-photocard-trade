"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function MarketPlace() {
  // =========================
  // 상태
  // =========================

  const [keyword, setKeyword] = useState("");

  const [grade, setGrade] = useState("전체");
  const [genre, setGenre] = useState("전체");
  const [soldOut, setSoldOut] = useState("전체");

  const [sort, setSort] = useState("낮은 가격순");

  const [openFilter, setOpenFilter] = useState(null);
  const [openSort, setOpenSort] = useState(false);

  // =========================
  // 임시 포토카드 데이터
  // =========================

  const cards = [
    {
      id: 1,
      name: "프로엄살러 막둥이 박두부",
      grade: "COMMON",
      genre: "음악",
      energy: 100,
      price: 250,
      soldOut: false,
      image: "/images/card-01.png",
    },
    {
      id: 2,
      name: "햇살 가득한 박두부",
      grade: "RARE",
      genre: "배우",
      energy: 80,
      price: 500,
      soldOut: false,
      image: "/images/card-02.png",
    },
    {
      id: 3,
      name: "무대 위의 박두부",
      grade: "SUPER RARE",
      genre: "음악",
      energy: 70,
      price: 1200,
      soldOut: false,
      image: "/images/card-03.png",
    },
    {
      id: 4,
      name: "전설의 박두부",
      grade: "LEGENDARY",
      genre: "스포츠",
      energy: 50,
      price: 2500,
      soldOut: true,
      image: "/images/card-04.png",
    },
    {
      id: 5,
      name: "귀여운 박두부",
      grade: "COMMON",
      genre: "배우",
      energy: 90,
      price: 300,
      soldOut: false,
      image: "/images/card-05.png",
    },
    {
      id: 6,
      name: "청량한 박두부",
      grade: "RARE",
      genre: "음악",
      energy: 60,
      price: 700,
      soldOut: false,
      image: "/images/card-06.png",
    },
    {
      id: 7,
      name: "카리스마 박두부",
      grade: "SUPER RARE",
      genre: "스포츠",
      energy: 40,
      price: 1500,
      soldOut: false,
      image: "/images/card-07.png",
    },
    {
      id: 8,
      name: "마지막 박두부",
      grade: "LEGENDARY",
      genre: "배우",
      energy: 30,
      price: 3000,
      soldOut: true,
      image: "/images/card-08.png",
    },
  ];

  // =========================
  // 필터링 + 정렬
  // =========================

  const filteredCards = useMemo(() => {
    let result = cards.filter((card) => {
      // 검색
      const matchesKeyword = card.name.toLowerCase().includes(keyword.toLowerCase());

      // 등급
      const matchesGrade = grade === "전체" || card.grade === grade;

      // 장르
      const matchesGenre = genre === "전체" || card.genre === genre;

      // 매진 여부
      const matchesSoldOut =
        soldOut === "전체" ||
        (soldOut === "판매 중" && !card.soldOut) ||
        (soldOut === "매진" && card.soldOut);

      return matchesKeyword && matchesGrade && matchesGenre && matchesSoldOut;
    });

    // 가격 정렬
    result.sort((a, b) => {
      if (sort === "낮은 가격순") {
        return a.price - b.price;
      }

      return b.price - a.price;
    });

    return result;
  }, [keyword, grade, genre, soldOut, sort]);

  // =========================
  // 필터 드롭다운
  // =========================

  const toggleFilter = (filterName) => {
    setOpenFilter((prev) => (prev === filterName ? null : filterName));

    setOpenSort(false);
  };

  // =========================
  // 필터 선택
  // =========================

  const selectGrade = (value) => {
    setGrade(value);
    setOpenFilter(null);
  };

  const selectGenre = (value) => {
    setGenre(value);
    setOpenFilter(null);
  };

  const selectSoldOut = (value) => {
    setSoldOut(value);
    setOpenFilter(null);
  };

  // =========================
  // 정렬 선택
  // =========================

  const selectSort = (value) => {
    setSort(value);
    setOpenSort(false);
  };

  // =========================
  // 가격 표시
  // =========================

  const formatPrice = (price) => {
    return price.toLocaleString("ko-KR");
  };

  return (
    <main className="marketplace">
      {/* =========================
            페이지 상단
        ========================= */}

      <section className="page-header">
        <div className="header-inner">
          <h1>마켓플레이스</h1>

          <button type="button" className="sell-button">
            나의 포토카드 판매하기
          </button>
        </div>
      </section>

      {/* =========================
            검색 / 필터 / 정렬
        ========================= */}

      <section className="filter-section">
        <div className="filter-inner">
          {/* 검색 */}
          <div className="search-box">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="포토카드 이름을 검색해보세요"
            />

            <button type="button" aria-label="검색">
              <span className="search-icon">⌕</span>
            </button>
          </div>

          {/* 필터 */}
          <div className="filters">
            {/* 등급 */}
            <div className="filter">
              <button type="button" className="filter-button" onClick={() => toggleFilter("grade")}>
                <span>{grade === "전체" ? "등급" : grade}</span>

                <span className={`arrow ${openFilter === "grade" ? "open" : ""}`}>▼</span>
              </button>

              {openFilter === "grade" && (
                <div className="dropdown">
                  {["전체", "COMMON", "RARE", "SUPER RARE", "LEGENDARY"].map((item) => (
                    <button
                      type="button"
                      key={item}
                      className={grade === item ? "selected" : ""}
                      onClick={() => selectGrade(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 장르 */}
            <div className="filter">
              <button type="button" className="filter-button" onClick={() => toggleFilter("genre")}>
                <span>{genre === "전체" ? "장르" : genre}</span>

                <span className={`arrow ${openFilter === "genre" ? "open" : ""}`}>▼</span>
              </button>

              {openFilter === "genre" && (
                <div className="dropdown">
                  {["전체", "음악", "배우", "스포츠"].map((item) => (
                    <button
                      type="button"
                      key={item}
                      className={genre === item ? "selected" : ""}
                      onClick={() => selectGenre(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 매진 여부 */}
            <div className="filter">
              <button
                type="button"
                className="filter-button"
                onClick={() => toggleFilter("soldOut")}
              >
                <span>{soldOut === "전체" ? "매진 여부" : soldOut}</span>

                <span className={`arrow ${openFilter === "soldOut" ? "open" : ""}`}>▼</span>
              </button>

              {openFilter === "soldOut" && (
                <div className="dropdown">
                  {["전체", "판매 중", "매진"].map((item) => (
                    <button
                      type="button"
                      key={item}
                      className={soldOut === item ? "selected" : ""}
                      onClick={() => selectSoldOut(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 정렬 */}
          <div className="sort">
            <button
              type="button"
              className="sort-button"
              onClick={() => {
                setOpenSort((prev) => !prev);
                setOpenFilter(null);
              }}
            >
              <span>{sort}</span>

              <span className={`arrow ${openSort ? "open" : ""}`}>▼</span>
            </button>

            {openSort && (
              <div className="dropdown sort-dropdown">
                <button
                  type="button"
                  className={sort === "낮은 가격순" ? "selected" : ""}
                  onClick={() => selectSort("낮은 가격순")}
                >
                  낮은 가격순
                </button>

                <button
                  type="button"
                  className={sort === "높은 가격순" ? "selected" : ""}
                  onClick={() => selectSort("높은 가격순")}
                >
                  높은 가격순
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================
            검색 결과
        ========================= */}

      <section className="card-section">
        <div className="card-header">
          <h2>포토카드</h2>

          <p>
            총 <strong>{filteredCards.length}</strong>개
          </p>
        </div>

        {/* 카드 */}
        {filteredCards.length > 0 ? (
          <ul className="card-list">
            {filteredCards.map((card) => (
              <li key={card.id} className="card-item">
                <Link href={`/marketplace/${card.id}`} className="card-link">
                  {/* 이미지 */}
                  <div className="card-image">
                    <Image
                      src={card.image}
                      alt={card.name}
                      fill
                      sizes="
                          (max-width: 767px) 50vw,
                          (max-width: 1023px) 33vw,
                          25vw
                        "
                    />

                    {card.soldOut && <div className="sold-out">SOLD OUT</div>}
                  </div>

                  {/* 카드 정보 */}
                  <div className="card-info">
                    <h3>{card.name}</h3>

                    {/* 등급 */}
                    <div className="card-meta">
                      <span>{card.grade}</span>
                      <span>{card.genre}</span>
                    </div>

                    {/* 에너지 */}
                    <div className="energy">
                      <div className="energy-top">
                        <span>에너자이저</span>

                        <span>{card.energy}%</span>
                      </div>

                      <div className="energy-bar">
                        <span
                          style={{
                            width: `${card.energy}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* 구매 포인트 */}
                    <div className="price">
                      <span>구매 포인트</span>

                      <strong>
                        {formatPrice(card.price)}
                        <small>P</small>
                      </strong>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty">
            <p>검색 조건에 맞는 포토카드가 없습니다.</p>

            <button
              type="button"
              onClick={() => {
                setKeyword("");
                setGrade("전체");
                setGenre("전체");
                setSoldOut("전체");
                setSort("낮은 가격순");
              }}
            >
              필터 초기화
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
