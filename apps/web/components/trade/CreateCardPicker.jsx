"use client";

import ScaledPhotoCard from "@/components/card/ScaledPhotoCard";
import { cardToPhotoCardProps } from "@/components/card/toPhotoCardProps";
import TradeFilter from "@/components/trade/TradeFilter";
import TradeSearchBar from "@/components/trade/TradeSearchBar";
import { useInfiniteFetch } from "@/hooks/useInfiniteFetch";
import { fetchMyCardsPage } from "@/lib/gallery/api";
import { useEffect, useMemo, useRef, useState } from "react";

const CATEGORY_OPTIONS = [
  { value: "DOG", label: "강아지" },
  { value: "CAT", label: "고양이" },
];

export default function CreateCardPicker({ onSelect }) {
  const [keyword, setKeyword] = useState("");
  const [debounceKeyword, setDebouncedKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState([]);

  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const queryParams = useMemo(
    () => ({ keyword: debounceKeyword, categories: selectedCategory }),
    [debounceKeyword, selectedCategory],
  );

  const { cards, isLoading, error, hasNextPage, loadNextPage, retry, meta } = useInfiniteFetch(
    fetchMyCardsPage,
    queryParams,
  );

  const categoryCounts = meta.categoryCounts ?? {};

  useEffect(() => {
    const root = scrollRef.current;
    const target = bottomRef.current;

    if (!root || !target || !hasNextPage || error) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadNextPage();
        }
      },
      { root },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [error, hasNextPage, loadNextPage]);

  return (
    <div className="flex h-[calc(100%+1.25rem)] flex-col overflow-hidden tablet:h-full">
      <h2 className="hidden font-primary-bold tablet:text-[16px] pc:text-[24px] leading-none text-gray-300 tablet:block">
        마이갤러리
      </h2>
      <h3 className="hidden font-primary-bold mt-10 tablet:text-[40px] pc:text-[46px] leading-none text-white tablet:block">
        나의 포토카드 판매하기
      </h3>
      <div className="hidden mt-5 border-t-2 border-gray-100 tablet:block" />
      <div className="mb-5 flex items-center justify-start gap-2 tablet:mt-5 tablet:mb-0 tablet:gap-7">
        <TradeSearchBar value={keyword} onChange={setKeyword} />
        <TradeFilter
          selected={selectedCategory}
          onChange={setSelectedCategory}
          options={CATEGORY_OPTIONS}
          optionCounts={categoryCounts}
        />
      </div>
      <div className="min-h-0 flex-1 mt-0 tablet:mt-10">
        {error && cards.length === 0 ? (
          <div className="col-span-full text-center text-white">
            <p role="alert">{error}</p>
            <button type="button" onClick={retry} className="mt-2 underline">
              다시 시도하기
            </button>
          </div>
        ) : isLoading && cards.length === 0 ? (
          <p className="flex h-full items-center justify-center text-gray-300">불러오는 중...</p>
        ) : cards.length === 0 ? (
          <p className="font-sans-400 flex h-full items-center justify-center text-sm text-gray-300">
            검색결과가 없습니다
          </p>
        ) : (
          <ul
            ref={scrollRef}
            className="-mr-2 grid h-full grid-cols-2 gap-1.75 overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400 tablet:gap-4 tablet:[&::-webkit-scrollbar]:w-1.5 pc:gap-5 pc:[&::-webkit-scrollbar]:w-2"
          >
            {cards.map((card) => (
              <li key={card.id}>
                <button
                  type="button"
                  onClick={() => onSelect(card)}
                  className="block w-full text-left"
                >
                  <ScaledPhotoCard {...cardToPhotoCardProps(card)} />
                </button>
              </li>
            ))}
            {error && (
              <li className="col-span-full text-center text-white">
                <p role="alert">{error}</p>
                <button type="button" onClick={loadNextPage} className="mt-2 underline">
                  다시 시도하기
                </button>
              </li>
            )}
            <li ref={bottomRef} className="col-span-full h-1" aria-hidden="true" />
            {isLoading && (
              <li className="col-span-full py-3 text-center text-gray-300">불러오는 중...</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
