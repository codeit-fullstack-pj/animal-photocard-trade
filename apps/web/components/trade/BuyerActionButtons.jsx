export default function BuyerActionButtons({ onPurchaseClick, onExchangeClick }) {
  return (
    <div className="flex w-full flex-col gap-3">
      <button
        type="button"
        onClick={onPurchaseClick}
        className="font-sans-600 h-13 w-full rounded-xs bg-purple-button text-sm text-black tablet:h-14 tablet:text-base"
      >
        포토카드 구매하기
      </button>
      <button
        type="button"
        onClick={onExchangeClick}
        className="font-sans-600 h-13 w-full rounded-xs bg-[#FFC146] text-sm text-black tablet:h-14 tablet:text-base"
      >
        포토카드 교환하기
      </button>
    </div>
  );
}
