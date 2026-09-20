import Image from "next/image";

import AutoFitText from "@/components/gallery/AutoFitText";
import DotHalftoneImage from "@/components/gallery/DotHalftoneImage";

import { SCORE_CONFIG, getPrimaryAxisColor } from "./scoreConfig";

// filterType(1~4, useImageVariants.js VARIANTS 순서와 동일: 원본·세피아·모노·도트) 별 렌더링 방식.
// 세피아·모노는 CSS filter로 충분하지만, 도트는 픽셀 밝기에 따라 점 크기가 달라지는 진짜
// 망점(halftone)이라 CSS만으로는 불가능 — canvas로 그리는 DotHalftoneImage를 쓴다
const CSS_FILTERS = { 2: "sepia(0.7)", 3: "grayscale(1)" };
const DOT_FILTER_TYPE = 4;
const IMAGE_BOX_WIDTH = 400;
const IMAGE_BOX_HEIGHT = 232;

// 이 컴포넌트는 항상 400px 고정 폭(w-100)으로 그려진다. 화면 크기별 대응은 여기서 브레이크포인트로
// 하지 않고, 부모(ScaledPhotoCard)가 실제 컨테이너 폭을 재서 transform: scale()로 전체를 통째로
// 축소/확대한다.
/**
 * @param {{ card: {
 *   name: string,
 *   tag?: string,
 *   category: "DOG" | "CAT",
 *   imageUrl: string,
 *   filterType?: number,
 *   description?: string | null,
 *   score?: { axes: { field: string, value: number }[] },
 * }, status?: string, point?: number, isSoldOut?: boolean, variant?: "owned" | "sale", onClick?: () => void }} props
 */
export default function PhotoCard({ card, status, point, isSoldOut, variant, onClick }) {
  const isDot = card.filterType === DOT_FILTER_TYPE;
  const cssFilter = CSS_FILTERS[card.filterType];
  const tagColor = getPrimaryAxisColor(card.category, card.score?.axes);

  return (
    <article
      onClick={onClick}
      className={`w-100 tracking-tight rounded-[10px] p-3.25 ${onClick ? "cursor-pointer" : ""} ${
        variant === "owned" ? "h-146.5" : "h-137.5"
      }`}
      style={{
        background:
          "linear-gradient(135deg, #353535 0%, #575656 38%, #686666 60%, #555454 82%, #353535 100%)",
      }}
    >
      {/* 콘텐츠 영역 */}
      <div
        className="flex h-full flex-col rounded-[2px] px-2.75 py-4.75"
        style={{
          background: "linear-gradient(180deg, #636363 0%, #313131 100%)",
        }}
      >
        <div className="relative aspect-400/232 w-full shrink-0 overflow-hidden rounded-[10px] bg-[#535353]">
          {/* 이미지 */}
          {card.imageUrl && !isDot && (
            <div
              role="img"
              aria-label={`${card.name} 포토카드 이미지`}
              style={{ backgroundImage: `url(${card.imageUrl})`, filter: cssFilter }}
              className="h-full w-full bg-cover bg-center"
            />
          )}
          {card.imageUrl && isDot && (
            <DotHalftoneImage
              src={card.imageUrl}
              alt={`${card.name} 포토카드 이미지`}
              width={IMAGE_BOX_WIDTH}
              height={IMAGE_BOX_HEIGHT}
            />
          )}
          {!card.imageUrl && (
            <div className="flex h-full items-center justify-center px-2">
              <AutoFitText className="font-sans-400 text-[13px] text-[#A4A4A4]">
                포토카드 이미지
              </AutoFitText>
            </div>
          )}

          {/* 판매 중은 흰색, 교환 제시 중은 노란색으로 표시 */}
          {!isSoldOut && status && (
            <AutoFitText
              className={`font-sans-500 absolute top-3 left-3 z-10 max-w-[calc(100%-1.5rem)] bg-black/50 px-2 py-1.25 text-[12px] ${
                status === "판매 중" ? "text-white" : "text-[#FFF3A4]"
              }`}
            >
              {status}
            </AutoFitText>
          )}

          {/* 품절 표시 */}
          {isSoldOut && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
              <Image src="/soldout.png" alt="판매 완료" width={190} height={190} />
            </div>
          )}
        </div>

        {/* 이름 — 태그(1등축 색)와 이름이 한눈에 구분되도록 태그만 색을 입힌다 */}
        <h2 className="font-sans-700 mt-2.5 w-4/5 text-[22px] leading-6.5 text-white">
          <span className={tagColor}>{card.tag}</span> {card.name}
        </h2>

        {/* 관상 지수 */}
        <div className="mt-3 space-y-1.5">
          {SCORE_CONFIG[card.category]?.map(({ key, label }) => {
            const scoreValue = card.score?.axes?.find((axis) => axis.field === key)?.value ?? 0;

            return <ScoreRow key={key} label={label} value={scoreValue} />;
          })}
        </div>

        {/* 판매카드 포인트 표기 — 내가 제시한 교환 카드처럼 가격이 없는 항목은 숨긴다 */}
        {variant === "sale" && point !== undefined && (
          <div className="mt-3 border-t border-[#1D1D1D] pt-2">
            <div className="flex items-center justify-between">
              <AutoFitText className="font-sans-400 text-[12px] text-white">
                구매 포인트
              </AutoFitText>

              <div className="flex min-w-0 items-center gap-[6px]">
                <AutoFitText
                  as="strong"
                  className="font-sans-400 text-[20px] leading-6 text-yellow-button"
                >
                  {Number(point).toLocaleString("ko-KR")}
                </AutoFitText>

                <Image
                  src="/cardpoint.png"
                  alt="포인트"
                  width={16}
                  height={16}
                  className="h-auto w-4 translate-y-[3px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* 설명카드 소개 표기 */}
        {variant === "owned" && (
          <div className="pt-5">
            <p className="font-sans-400 text-[14px] leading-4.25 break-all text-gray-200">
              {card.description}
            </p>
          </div>
        )}

        {/* 하단 공통 서비스 로고 */}
        <div className="mt-auto flex justify-center">
          <Image src="/logo.png" alt="최애 멍냥" width={96} height={24} className="h-6 w-24" />
        </div>
      </div>
    </article>
  );
}

function ScoreRow({ label, value }) {
  return (
    <div className="grid w-full grid-cols-[100px_1fr_45px] items-center gap-x-2.5">
      <AutoFitText className="font-sans-500 text-[14px] text-white">{label}</AutoFitText>

      {/* 관상 지수 막대 */}
      <div className="h-2 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-[#A656F5]" style={{ width: `${value}%` }} />
      </div>

      <AutoFitText className="font-sans-600 text-right text-[14px] text-white">
        {value}%
      </AutoFitText>
    </div>
  );
}
