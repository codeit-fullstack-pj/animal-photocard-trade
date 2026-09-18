// 판매글 수정 / 판매 내리기
export default function SellerActionButtons({ onEditClick, onCancelClick }) {
  return (
    <div className="flex w-full flex-col gap-3">
      <button
        type="button"
        onClick={onEditClick}
        className="font-sans-700 h-18 w-full rounded-xs bg-purple-button text-lg text-white tablet:h-18.75 pc:h-20"
      >
        판매글 수정하기
      </button>
      <button
        type="button"
        onClick={onCancelClick}
        className="font-sans-700 h-18 w-full rounded-xs bg-gray-700 text-lg text-white tablet:h-18.75 pc:h-20"
      >
        판매 내리기
      </button>
    </div>
  );
}
