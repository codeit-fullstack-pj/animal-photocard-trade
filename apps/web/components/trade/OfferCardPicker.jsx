"use client";

import PhotoCard from "@/components/card/PhotoCard";
import TradeFilter from "@/components/trade/TradeFilter";
import TradeSearchBar from "@/components/trade/TradeSearchBar";
import { mockCards } from "@/mocks/cards";
import { useEffect, useState } from "react";

const CATEGORY_OPTIONS = [
  { value: "DOG", label: "강아지" },
  { value: "CAT", label: "고양이" },
];

const WHITESPACE_PATTERN = /\s+/g;

export default function OfferCardPicker({ onSelect }) {
  //카드 목록을 불러올 API를 주석처리(nextjs fetch로 처리)
  const [keyword, setKeyword] = useState("");
  const [debounceKeyword, setDebouncedKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const filteredCards = mockCards.filter(
    (card) =>
      card.name
        .replace(WHITESPACE_PATTERN, "")
        .includes(debounceKeyword.replace(WHITESPACE_PATTERN, "")) &&
      (selectedCategory.length === 0 || selectedCategory.includes(card.category)),
  );

  //카드가 판매중/교환중/본인소유가 맞는지 체크하기

  return (
    <div>
      <p className="font-primary-bold text-[24px] leading-none text-gray-300">마이갤러리</p>
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
        {filteredCards.length === 0 ? (
          <p className="font-sans-400 flex h-full items-center justify-center text-sm text-gray-300">
            검색결과가 없습니다
          </p>
        ) : (
          <ul className="-mr-15 grid h-full grid-cols-2 gap-1.75 overflow-y-auto pr-15 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400 tablet:gap-4 pc:gap-5 min-[642px]:max-[900px]:grid-cols-3">
            {filteredCards.map((card) => (
              <li key={card.id}>
                <button
                  type="button"
                  onClick={() => onSelect(card)}
                  className="block w-full text-left"
                >
                  <PhotoCard
                    title={card.name}
                    imageUrl={card.imageUrl}
                    category={card.category}
                    score={card.score}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
