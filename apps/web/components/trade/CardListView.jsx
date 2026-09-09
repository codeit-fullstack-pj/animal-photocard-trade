import { useState } from "react";
import { mockCards } from "@/mocks/cards.js";

const CardListView = ({ onSelectCard, onClose }) => {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleCategory = (clickedCategory) => {
    setCategory((prev) => (prev === clickedCategory ? null : clickedCategory));
  };

  const filteredCards = mockCards.filter((card) => {
    const matchesKeyword = card.name.includes(keyword);
    const matchesCategory = !category || category === card.category;
    return matchesKeyword && matchesCategory;
  });

  return (
    <div className="bg-[#161616] w-[940px] h-[772px] p-[60px] flex flex-col rounded-3xl relative">
      <button
        onClick={onClose}
        className="absolute top-12 right-12 text-white text-2xl leading-none hover:text-gray-400"
      >
        ✕
      </button>

      <p className="text-gray-300 text-2xl mb-11 shrink-0">마이갤러리</p>
      <h2 className="text-[46px] font-bold text-[#eeeeee] mb-5 shrink-0">나의 포토카드 판매하기</h2>
      <div className="w-full h-[2px] bg-white mb-5 shrink-0" />

      <div className="flex items-center gap-7 mb-5 shrink-0">
        <div className="w-[320px] h-[50px] bg-black border border-gray-500 focus-within:border-white flex items-center justify-between px-[25px] rounded-md">
          <input
            type="text"
            placeholder="검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="bg-transparent outline-none text-base w-full text-white"
          />
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-1 font-bold text-white"
          >
            카테고리 <span className="text-xs">▾</span>
          </button>
          {isFilterOpen && (
            <div className="absolute top-full mt-2 bg-[#1a1a1f] rounded-lg p-3 space-y-2 z-10 w-[120px] h-[91px]">
              <label className="flex items-center justify-between gap-3">
                강아지
                <input
                  type="checkbox"
                  checked={category === "DOG"}
                  onChange={() => toggleCategory("DOG")}
                  className="accent-white w-4 h-4"
                />
              </label>
              <label className="flex items-center justify-between gap-3">
                고양이
                <input
                  type="checkbox"
                  checked={category === "CAT"}
                  onChange={() => toggleCategory("CAT")}
                  className="accent-white w-4 h-4"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:min-h-[180px]">
        {filteredCards.length === 0 ? (
          <p className="text-gray-400 text-center py-8">보유하신 카드가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                onClick={() => onSelectCard(card)}
                className="bg-[#1a1a1f] rounded-xl overflow-hidden cursor-pointer hover:opacity-80 w-[400px] h-[586.5px]"
              >
                {/* 이미지 자리: 회색 처리, 위 32px / 좌우 24px 여백 */}
                <div className="w-[352px] h-[232px] bg-gray-500 mx-6 mt-8 rounded-lg" />

                {/* 태그 + 이름 한 줄, 이미지와 12px 간격, 왼쪽 24px 여백 */}
                <p className="text-sm text-white ml-6 mt-3">
                  {card.tag} {card.name}
                </p>

                <div className="px-6 mt-4">
                  {card.score.axes.map((axis) => (
                    <div key={axis.field} className="flex items-center gap-2 text-xs mb-2">
                      <span className="w-20 text-gray-400">{axis.field}</span>
                      <div className="flex-1 h-1.5 bg-white rounded-full">
                        <div
                          className="h-1.5 bg-[#a656f5] rounded-full"
                          style={{ width: `${axis.value}%` }}
                        />
                      </div>
                      <span className="text-gray-400">{axis.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardListView;
