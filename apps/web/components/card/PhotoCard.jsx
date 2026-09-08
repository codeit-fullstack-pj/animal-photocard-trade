const CATEGORY_LABEL = { CAT: "고양이", DOG: "강아지" };

/**
 * 완성된 포토카드 1장.
 * @param {{ card: {
 *   name: string,
 *   category: "CAT" | "DOG",
 *   imageUrl: string,          // 필터 적용된 최종 이미지
 *   description?: string | null,
 *   score?: { axes: { field: string, value: number }[], topField: string, topScore: number },
 * } }} props
 */
export default function PhotoCard({ card }) {
  return (
    <div className="flex w-80 flex-col overflow-hidden rounded-xs border border-[#DDD] bg-[#0F0F0F]">
      <div
        role="img"
        aria-label={`${card.name} 포토카드 이미지`}
        style={card.imageUrl ? { backgroundImage: `url(${card.imageUrl})` } : undefined}
        className="aspect-square w-full bg-[#535353] bg-cover bg-center"
      />

      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-lg font-bold text-white">{card.name}</h3>
          <span className="shrink-0 text-xs text-[#888]">
            {CATEGORY_LABEL[card.category] ?? card.category}
          </span>
        </div>

        {card.description && (
          <p className="text-sm leading-relaxed text-[#AAA]">{card.description}</p>
        )}

        {card.score?.axes?.length > 0 && (
          <div className="mt-1 flex flex-col gap-1.5">
            {card.score.axes.map(({ field, value }) => (
              <div key={field} className="flex items-center gap-2 text-xs">
                <span className="w-14 shrink-0 text-white">{field}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#333]">
                  <div
                    className="h-full rounded-full bg-[#A656F5]"
                    style={{ width: `${value}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-[#888]">{value}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
