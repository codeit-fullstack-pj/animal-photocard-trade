import Image from "next/image";

import { SCORE_CONFIG } from "./scoreConfig";

export default function PhotoCard({
  status,
  title,
  tag,
  description,
  point,
  imageUrl,
  isSoldOut,
  category,
  score,
  filterType,
  variant,
}) {
  const FILTER_CONFIG = {
    1: "",
    2: "",
    3: "",
  };

  return (
    <article
      className={`w-full tracking-tight rounded-lg p-1.25 tablet:rounded-[10px] tablet:p-3.25 ${variant === "owned" ? "h-70.5 tablet:h-139.25 pc:h-146.5" : "h-67.5 tablet:h-133.5 pc:h-137.5"}`}
      style={{
        background:
          "linear-gradient(135deg, #353535 0%, #575656 38%, #686666 60%, #555454 82%, #353535 100%)",
      }}
    >
      {/* 콘텐츠 영역 */}
      <div
        className="flex h-full flex-col rounded-[2px] px-1.5 pt-2.75 pb-1.5 tablet:px-2.75 tablet:pt-3.75 tablet:pb-2.75 pc:py-4.75"
        style={{
          background: "linear-gradient(180deg, #636363 0%, #313131 100%)",
        }}
      >
        <div className="relative aspect-168/116 max-h-29 w-full shrink-0 overflow-hidden rounded-[5px] tablet:aspect-344/233 tablet:max-h-58.25 tablet:rounded-[10px] pc:aspect-400/232 pc:max-h-58">
          {/* 이미지 */}
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="353px"
              className="rounded-[5px] border border-[#424242] object-cover tablet:rounded-[10px] tablet:border-[3px]"
              style={{ filter: FILTER_CONFIG[filterType] }}
            />
          ) : (
            <div className="font-sans-400 flex h-full items-center justify-center text-[13px] text-[#A4A4A4]">
              포토카드 이미지
            </div>
          )}

          {/* 거래 중인 포토카드 상태 */}
          {!isSoldOut && status && (
            <span className="font-sans-500 absolute top-1.5 left-1.5 z-10 bg-black/50 px-1 py-0.5 text-[8px] text-[#FFF3A4] tablet:top-3 tablet:left-3 tablet:px-2 tablet:py-1.25 tablet:text-[12px]">
              {status}
            </span>
          )}

          {/* 품절 표시 */}
          {isSoldOut && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
              <Image src="/soldout.png" alt="판매 완료" width={190} height={190} />
            </div>
          )}
        </div>

        {/* 이름 */}
        <h2 className="font-sans-700 mt-1.75 w-4/5 text-[11px] leading-3.5 text-white tablet:mt-2.5 tablet:text-[20px] tablet:leading-6.5 pc:text-[22px]">
          {tag} {title}
        </h2>

        {/* 관상 지수 */}
        <div className="mt-2 tablet:mt-3 space-y-0.75 tablet:space-y-1.5">
          {SCORE_CONFIG[category]?.map(({ key, label }) => {
            const scoreValue = score?.axes?.find((axis) => axis.field === key)?.value ?? 0;

            return <ScoreRow key={key} label={label} value={scoreValue} />;
          })}
        </div>

        {/* 판매카드 포인트 표기 */}
        {variant === "sale" && (
          <div className="mt-1.75 border-t border-[#1D1D1D] pt-1.75 tablet:mt-3 tablet:pt-2">
            <div className="flex items-center justify-between">
              <span className="font-sans-400 text-[7px] text-white tablet:text-[12px]">
                구매 포인트
              </span>
              <div className="flex items-center gap-[6px]">
                <strong className="font-sans-400 text-[10px] leading-3.5 text-[#FFC146] tablet:text-[20px]">
                  {Number(point).toLocaleString("ko-KR")}
                </strong>
                <Image
                  src="/cardpoint.png"
                  alt="포인트"
                  width={16}
                  height={16}
                  className="h-auto w-2 translate-y-[3px] tablet:w-4"
                />
              </div>
            </div>
          </div>
        )}

        {/* 설명카드 소개 표기*/}
        {variant === "owned" && (
          <div className="pt-2 tablet:pt-3 pc:pt-5">
            <p className="font-sans-400 text-[7px] leading-2.25 break-all text-gray-200 tablet:text-[12px] tablet:leading-4.25 pc:text-[14px]">
              {description}
            </p>
          </div>
        )}

        {/* 하단 공통 서비스 로고 */}
        <div className="mt-auto flex justify-center">
          <Image
            src="/logo.png"
            alt="최애 멍냥"
            width={96}
            height={24}
            className="h-2.5 w-10 tablet:h-5 tablet:w-20 pc:h-6 pc:w-24"
          />
        </div>
      </div>
    </article>
  );
}

function ScoreRow({ label, value }) {
  return (
    <div className="grid w-full grid-cols-[50px_1fr_23px] items-center gap-x-1 tablet:grid-cols-[100px_1fr_45px] tablet:gap-x-2.5">
      <span className="font-sans-500 text-[7px] whitespace-nowrap text-white tablet:text-[14px]">
        {label}
      </span>

      {/* 관상 지수 막대 */}
      <div className="h-1 overflow-hidden rounded-full bg-white tablet:h-2">
        <div className="h-full rounded-full bg-[#A656F5]" style={{ width: `${value}%` }} />
      </div>

      <span className="font-sans-600 text-right text-[7px] whitespace-nowrap text-white tablet:text-[14px]">
        {value}%
      </span>
    </div>
  );
}
