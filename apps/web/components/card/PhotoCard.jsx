import Image from "next/image";

export default function PhotoCard({ status, title, point, imageUrl, isSoldOut, category, score }) {
  // 관상지수 매핑
  const SCORE_CONFIG = {
    DOG: [
      { key: "ENERGIZER", label: "에너자이저" },
      { key: "MY_WAY", label: "마이웨이" },
      { key: "CAPITALIST", label: "자본주의 미소" },
      { key: "GRUMPY", label: "심기불편 맹수" },
    ],

    CAT: [
      { key: "UDADA", label: "우다다" },
      { key: "ALOOF", label: "까칠도도" },
      { key: "CHURU_HUNTER", label: "츄르 헌터" },
      { key: "PUNY_HUMAN", label: "하찮은 닝겐" },
    ],
  };
  return (
    <article
      className="h-[550px] w-full rounded-[14px] p-[13px]"
      style={{
        background:
          "linear-gradient(135deg, #353535 0%, #575656 38%, #686666 60%, #555454 82%, #353535 100%)",
      }}
    >
      {/* 카드 안쪽 콘텐츠 영역 */}
      <div
        className="flex h-full flex-col rounded-[2px] px-[11px] pt-[18px] pb-[13px]"
        style={{
          background: "linear-gradient(180deg, #636363 0%, #313131 100%)",
        }}
      >
        {/* 포토카드 이미지 영역 */}
        <div className="relative h-[233px] w-full shrink-0 overflow-hidden rounded-[8px] bg-[#5A5A5A]">
          {/* 실제 포토카드 이미지 */}
          {imageUrl ? (
            <Image src={imageUrl} alt={title} fill sizes="353px" className="object-cover" />
          ) : (
            <div className="font-sans-400 flex h-full items-center justify-center text-[13px] text-[#A4A4A4]">
              포토카드 이미지
            </div>
          )}

          {/* 거래 중인 포토카드 상태 */}
          {!isSoldOut && status && (
            <span className="font-sans-500 absolute top-[12px] left-[12px] z-10 bg-black/50 px-[8px] py-[5px] text-[12px] text-[#FFF3A4]">
              {status}
            </span>
          )}

          {/* 품절된 포토카드 표시 */}
          {isSoldOut && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <Image src="/soldout.png" alt="판매 완료" width={112} height={112} />
            </div>
          )}
        </div>

        {/* 포토카드 이름 */}
        <h2 className="font-sans-700 mt-[12px] h-[48px] overflow-hidden text-[18px] leading-[24px] text-white">
          {title}
        </h2>

        {/* 카테고리에 맞는 관상 지수를 표시 */}
        <div className="mt-[8px] space-y-[7px]">
          {SCORE_CONFIG[category]?.map(({ key, label }) => {
            const scoreValue = score?.axes?.find((axis) => axis.field === key)?.value ?? 0;

            return <ScoreRow key={key} label={label} value={scoreValue} />;
          })}
        </div>

        {/* 구매 포인트와 서비스 로고 */}
        <div className="mt-auto border-t border-[#1D1D1D] pt-[14px]">
          {/* 구매 포인트 */}
          <div className="flex items-center justify-between">
            <span className="font-sans-400 text-[12px] text-white">구매 포인트</span>

            <div className="flex items-center gap-[6px]">
              <strong className="font-sans-400 text-[20px] leading-none text-[#FFC146]">
                {Number(point).toLocaleString("ko-KR")}
              </strong>

              {/* 포인트 단위 아이콘 */}
              <Image
                src="/cardpoint.png"
                alt="포인트"
                width={16}
                height={16}
                className="translate-y-[3px]"
              />
            </div>
          </div>

          {/* 서비스 로고 */}
          <div className="mt-[10px] flex justify-center">
            <Image src="/logo.png" alt="최애 멍냥" width={96} height={24} />
          </div>
        </div>
      </div>
    </article>
  );
}

function ScoreRow({ label, value }) {
  return (
    <div className="grid grid-cols-[90px_1fr_40px] items-center gap-[8px]">
      <span className="font-sans-400 text-[12px] text-white">{label}</span>

      {/* 관상 지수 막대 */}
      <div className="h-[5px] overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-[#A656F5]" style={{ width: `${value}%` }} />
      </div>

      <span className="font-sans-400 text-right text-[12px] text-white">{value}%</span>
    </div>
  );
}
