export default function MarketEmpty({ onReset }) {
  return (
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
        onClick={onReset}
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
  );
}
