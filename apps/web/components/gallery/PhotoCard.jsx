import Image from "next/image";

import AutoFitText from "./AutoFitText";

/**
 * 완성된 포토카드 1장.
 * @param {{ card: {
 *   name: string,
 *   imageUrl: string,          // 필터 적용된 최종 이미지
 *   description?: string | null,
 *   score?: { axes: { field: string, value: number }[], topField: string, topScore: number },
 * } }} props
 */
export default function PhotoCard({ card }) {
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
        <div
          role="img"
          aria-label={`${card.name} 포토카드 이미지`}
          style={card.imageUrl ? { backgroundImage: `url(${card.imageUrl})` } : undefined}
          className="h-58 w-88 rounded-[10px] bg-[#535353] bg-cover bg-center"
        />

        <div className="flex w-full flex-col gap-3">
          <AutoFitText as="h3" className="w-full text-lg font-bold text-white">
            {card.name}
          </AutoFitText>

          {card.score?.axes?.length > 0 && (
            <div className="mt-1 flex flex-col gap-1.5">
              {card.score.axes.map(({ field, value }) => (
                <div key={field} className="flex items-center gap-2 text-xs">
                  <AutoFitText className="inline-flex h-5 w-20 shrink-0 items-center font-sans-500 text-sm text-white">
                    {field}
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
