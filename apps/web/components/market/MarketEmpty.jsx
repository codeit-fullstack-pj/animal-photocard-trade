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
    </div>
  );
}
