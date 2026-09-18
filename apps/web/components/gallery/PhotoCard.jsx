import Image from "next/image";

import { SCORE_CONFIG, getPrimaryAxisColor } from "@/components/card/scoreConfig";

import AutoFitText from "./AutoFitText";
import DotHalftoneImage from "./DotHalftoneImage";

// filterType(1~4, useImageVariants.js VARIANTS 순서와 동일: 원본·세피아·모노·도트) 별 렌더링 방식.
// 세피아·모노는 CSS filter로 충분하지만, 도트는 픽셀 밝기에 따라 점 크기가 달라지는 진짜
// 망점(halftone)이라 CSS만으로는 불가능 — canvas로 그리는 DotHalftoneImage를 쓴다
const CSS_FILTERS = { 2: "sepia(0.7)", 3: "grayscale(1)" };
const DOT_FILTER_TYPE = 4;
const IMAGE_BOX_WIDTH = 352; // w-88
const IMAGE_BOX_HEIGHT = 232; // h-58

/**
 * 완성된 포토카드 1장.
 * @param {{ card: {
 *   name: string,
 *   tag?: string,              // 이름 앞에 붙는 관상 태그 (예: "우주를 정복하는 마에스트로")
 *   category: "DOG" | "CAT",   // score.axes의 field(영문 키)를 한글 라벨로 바꾸는 데 씀
 *   imageUrl: string,          // 원본 이미지. filterType에 맞춰 렌더링 시점에 필터를 입힌다
 *   filterType?: number,       // 1 원본 · 2 세피아 · 3 모노 · 4 도트
 *   description?: string | null,
 *   score?: { axes: { field: string, value: number }[] },
 * } }} props
 */
export default function PhotoCard({ card }) {
  const isDot = card.filterType === DOT_FILTER_TYPE;
  const cssFilter = CSS_FILTERS[card.filterType];
  const tagColor = getPrimaryAxisColor(card.category, card.score?.axes);
  // score.axes 의 field는 ENERGIZER/UDADA 같은 백엔드 키라서, 카드에 보일 땐 한글 라벨로 바꾼다
  const scoreLabels = Object.fromEntries(
    (SCORE_CONFIG[card.category] ?? []).map(({ key, label }) => [key, label]),
  );

  return (
    <div
      className="relative flex h-147.5 w-100 flex-col overflow-hidden rounded-[10px]"
      style={{
        // 12px 그라데이션 테두리 + 내부 배경도 그라데이션 (padding-box / border-box 이중 배경).
        // 테두리: 140deg 로 첫 색 #0D0D0D 이 320° 방향(좌상단). 내부: 100deg.
        border: "12px solid transparent",
        background: [
          "linear-gradient(100deg, #4A4A4A 0%, #2C2C2C 100%) padding-box",
          "linear-gradient(140deg, #0D0D0D 0%, #888484 50%, #323232 100%) border-box",
        ].join(", "),
      }}
    >
      <div className="mt-3 flex h-full w-full flex-col items-center gap-5 px-3">
        <div className="relative h-58 w-88 overflow-hidden rounded-[10px] bg-[#535353]">
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
        </div>

        <div className="flex w-full flex-col gap-3">
          <AutoFitText as="h3" className="w-full text-lg font-bold text-white">
            <span className={tagColor}>{card.tag}</span> {card.name}
          </AutoFitText>

          {card.score?.axes?.length > 0 && (
            <div className="mt-1 flex flex-col gap-1.5">
              {card.score.axes.map(({ field, value }) => (
                <div key={field} className="flex items-center gap-2 text-xs">
                  <AutoFitText className="inline-flex h-5 w-20 shrink-0 items-center font-sans-500 text-sm text-white">
                    {scoreLabels[field] ?? field}
                  </AutoFitText>
                  <div className="h-2 w-50 shrink-0 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-purple-button"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <AutoFitText className="ml-auto inline-flex h-5 w-8 shrink-0 items-center justify-end font-sans-600 text-sm text-white">
                    {value}%
                  </AutoFitText>
                </div>
              ))}
            </div>
          )}

          {card.description && (
            <p className="line-clamp-3 text-sm leading-relaxed text-[#AAA]">{card.description}</p>
          )}
        </div>
      </div>

      <Image
        src="/logo.png"
        alt="로고"
        width={96}
        height={24}
        className="absolute bottom-5 left-1/2 -translate-x-1/2"
      />
    </div>
  );
}
