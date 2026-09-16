"use client";

import PhotoCard from "@/components/card/PhotoCard";
import { cardToPhotoCardProps } from "@/components/card/toPhotoCardProps";
import TradeFilter from "@/components/trade/TradeFilter";
import TradeSearchBar from "@/components/trade/TradeSearchBar";
import { useInfiniteFetch } from "@/hooks/useInfiniteFetch";
import { fetchMockMyCards } from "@/lib/api/mockMyCards.js";
import { useEffect, useMemo, useRef, useState } from "react";

const CATEGORY_OPTIONS = [
  { value: "DOG", label: "강아지" },
  { value: "CAT", label: "고양이" },
];

export default function OfferCardPicker({ onSelect }) {
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

  const { cards, isLoading, error, hasNextPage, loadNextPage, retry } = useInfiniteFetch(
    fetchMockMyCards,
    queryParams,
  );

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
    <div>
      <h2 className="font-primary-bold text-[24px] leading-none text-gray-300">마이갤러리</h2>
      <h3 className="font-primary-bold mt-10 text-[46px] leading-none text-white">
        교환할 포토카드 선택하기
      </h3>
      <div className="mt-5 border-t-2 border-gray-100" />
      <div className="mt-6 flex items-center justify-start gap-7">
        <TradeSearchBar value={keyword} onChange={setKeyword} />
        <TradeFilter
          selected={selectedCategory}
          onChange={setSelectedCategory}
          options={CATEGORY_OPTIONS}
        />
      </div>
      <div className="mt-10 h-117.5">
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
            className="-mr-15 grid h-full grid-cols-2 gap-1.75 overflow-y-auto pr-15 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400 tablet:gap-4 pc:gap-5 min-[642px]:max-[900px]:grid-cols-3"
          >
            {cards.map((card) => (
              <li key={card.id}>
                <button
                  type="button"
                  onClick={() => onSelect(card)}
                  className="block w-full text-left"
                >
                  <PhotoCard {...cardToPhotoCardProps(card)} />
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
