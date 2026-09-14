import PhotoCard from "./PhotoCard";

/**
 * PhotoCard(400×590 고정)를 breakpoint 별로 축소해 그리드 한 칸에 맞춘다.
 * 바깥 div 가 "축소된 크기"로 그리드에 자리잡고, 안쪽 div 는 원본 크기를 transform: scale 로 줄인다
 * (origin-top-left 라 바깥 div 크기와 정확히 맞물린다).
 *   - mobile: ×0.40 → 160×236 (한 줄 2개)
 *   - tablet: ×0.82 → 328×484 (한 줄 2개)
 *   - pc    : ×1.00 → 400×590 (한 줄 3개)
 * @param {{ card: object }} props
 */
export default function GalleryCardItem({ card }) {
  return (
    <div className="h-59 w-40 tablet:h-121 tablet:w-82 pc:h-147.5 pc:w-100">
      <div className="origin-top-left scale-40 tablet:scale-82 pc:scale-100">
        <PhotoCard card={card} />
      </div>
    </div>
  );
}
