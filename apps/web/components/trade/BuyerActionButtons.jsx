export default function BuyerActionButtons({ onPurchaseClick, onExchangeClick }) {
  return (
    <div className="flex w-full flex-col gap-3">
      <button
        type="button"
        onClick={onPurchaseClick}
        className="font-sans-700 h-18 w-full rounded-xs bg-purple-button text-lg text-white tablet:h-18.75 pc:h-20"
      >
        포토카드 구매하기
      </button>
      <button
        type="button"
        onClick={onExchangeClick}
        className="font-sans-700 h-18 w-full rounded-xs bg-yellow-button text-lg text-black tablet:h-18.75 pc:h-20"
      >
        포토카드 교환하기
      </button>
    </div>
  );
}
