"use client";

import { useEffect, useState } from "react";

import { fetchMyCards } from "@/lib/gallery/api";

import GalleryCardItem from "./GalleryCardItem";
import GalleryToolbar from "./GalleryToolbar";
import Pagination from "./Pagination";

const PAGE_SIZE = 12;

/**
 * 마이갤러리 = 보유 카드 목록. 검색·필터·정렬·페이지네이션 상태를 소유하고 API를 호출한다.
 * @param {{ userName: string }} props
 */
export default function MyGalleryCards({ userName }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [sort, setSort] = useState("score_desc");
  const [page, setPage] = useState(1);

  const [data, setData] = useState({ items: [], totalCount: 0, totalPages: 0 });
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMessage, setErrorMessage] = useState("");

  const categoriesKey = categories.join(",");
  const filterKey = `${debouncedSearch}|${categoriesKey}|${sort}`;

  // 필터·정렬이 바뀌면 1페이지로 (렌더 중 조정 — React 권장 패턴)
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  // 검색어는 입력이 멈춘 뒤 300ms 후에만 요청에 반영
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        setStatus("loading");
        const result = await fetchMyCards({
          page,
          pageSize: PAGE_SIZE,
          sort,
          keyword: debouncedSearch,
          categories: categoriesKey ? categoriesKey.split(",") : [],
        });
        if (ignore) return;
        setData(result);
        setStatus("success");
      } catch (error) {
        if (ignore) return;
        setErrorMessage(error.message);
        setStatus("error");
      }
    })();

    return () => {
      ignore = true;
    };
  }, [page, sort, debouncedSearch, categoriesKey]);

  return (
    <>
      <span>
        <span className="font-sans-700 text-2xl text-gray-200">{userName}님이 보유한 포토카드</span>{" "}
        <span className="font-sans-400 text-xl text-gray-300">({data.totalCount}개)</span>
      </span>

      <div className="h-0.5 w-full bg-gray-400" />

      <GalleryToolbar
        search={search}
        onSearchChange={setSearch}
        categories={categories}
        onCategoriesChange={setCategories}
        sort={sort}
        onSortChange={setSort}
      />

      <div className="mt-6 flex w-full flex-col items-center gap-8">
        {status === "loading" && <p className="py-20 text-gray-300">불러오는 중...</p>}

        {status === "error" && (
          <p className="py-20 text-red">{errorMessage || "목록을 불러오지 못했어요."}</p>
        )}

        {status === "success" && data.items.length === 0 && (
          <p className="py-20 text-gray-300">조건에 맞는 카드가 없어요.</p>
        )}

        {status === "success" && data.items.length > 0 && (
          <>
            <div className="grid w-full grid-cols-2 justify-items-center gap-3 tablet:gap-5 pc:grid-cols-3">
              {data.items.map((card) => (
                <GalleryCardItem key={card.id} card={card} />
              ))}
            </div>
            <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
          </>
        )}
      </div>
    </>
  );
}
