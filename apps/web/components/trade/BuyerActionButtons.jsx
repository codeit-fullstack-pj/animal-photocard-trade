export default function BuyerActionButtons({ onPurchaseClick, onExchangeClick, canExchange }) {
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
        disabled={!canExchange}
        className={`font-sans-700 h-18 w-full rounded-xs text-lg tablet:h-18.75 pc:h-20 ${
          canExchange
            ? "bg-yellow-button text-black"
            : "cursor-not-allowed bg-gray-700 text-gray-300"
        }`}
      >
        포토카드 교환하기
      </button>
    </div>
  );
}
