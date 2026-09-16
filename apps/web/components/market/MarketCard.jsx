import Image from "next/image";
import Link from "next/link";

import { SCORE_CONFIG } from "@/components/card/scoreConfig";

const formatPrice = (price) => {
  if (price == null) {
    return "0";
  }

  return Number(price).toLocaleString("ko-KR");
};

export default function MarketCard({ card, onCardClick }) {
  const scoreConfig = SCORE_CONFIG[card.category] ?? [];

  const scoreRows = scoreConfig.map((config) => {
    const score = card.score?.axes?.find((item) => item.field === config.key);

    return {
      key: config.key,
      label: config.label,
      value: score?.value ?? 0,
    };
  });

  return (
    <li
      className="
        w-full
        min-w-0
        rounded-lg
        p-1.25
        tracking-tight

        tablet:rounded-[10px]
        tablet:p-3.25

        pc:rounded-[10px]
        pc:p-3.25
      "
      style={{
        background:
          "linear-gradient(135deg, #353535 0%, #575656 38%, #686666 60%, #555454 82%, #353535 100%)",
      }}
    >
      <button
        type="button"
        onClick={() => onCardClick?.(card)}
        className="
            group
            block
            w-full
            overflow-hidden
            rounded-[12px]
            border
            border-[#555555]
            bg-gradient-to-b
            from-[#444444]
            to-[#292929]
            text-left
            transition-all
            duration-200
            hover:-translate-y-[3px]
            hover:border-[#777777]
            hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)]
          "
      >
        {/* ========================================
            이미지
        ======================================== */}
        <div
          className="
            relative
            mt-2.75
            aspect-[344/233]
            w-full
            overflow-hidden
            rounded-[5px]
            bg-[#333333]

            tablet:mx-2.75
            tablet:mt-3.75
            tablet:aspect-344/233
            tablet:max-h-58.25
            tablet:rounded-[10px]

            pc:mx-2.75
            pc:mt-3.75
            pc:aspect-400/232
            pc:max-h-58
          "
        >
          <Image
            src={card.imageUrl}
            alt={card.title ?? card.name ?? ""}
            fill
            sizes="
              (max-width: 743px) calc((100vw - 40px) / 2),
              (max-width: 1279px) calc((100vw - 52px) / 2),
              400px
            "
            className="
              rounded-[5px]
              border
              border-[#424242]
              object-cover
              transition-transform
              duration-300
              group-hover:scale-[1.02]

              tablet:rounded-[10px]
              tablet:border-[3px]
            "
          />
        </div>

        {/* ========================================
            카드 내용
        ======================================== */}
        <div
          className="
            px-1.5
            pb-1.5
            pt-1.75

            tablet:px-2.75
            tablet:pb-2.75
            tablet:pt-2.5

            pc:px-2.75
            pc:pb-2.75
            pc:pt-2.5
          "
        >
          {/* 이름 */}
          <h2
            className="
              font-sans-700
              w-4/5
              text-[11px]
              leading-3.5
              text-white

              tablet:text-[20px]
              tablet:leading-6.5

              pc:text-[22px]
            "
          >
            {card.tag} {card.title ?? card.name}
          </h2>

          {/* ========================================
              관상 지수
          ======================================== */}
          <div
            className="
              mt-2
              space-y-0.75

              tablet:mt-3
              tablet:space-y-1.5
            "
          >
            {scoreRows.map((score) => (
              <ScoreRow key={score.key} label={score.label} value={score.value} />
            ))}
          </div>

          {/* ========================================
              구매 포인트
          ======================================== */}
          <div
            className="
              mt-1.75
              border-t
              border-[#1D1D1D]
              pt-1.75

              tablet:mt-3
              tablet:pt-2
            "
          >
            <div className="flex items-center justify-between">
              <span
                className="
                  font-sans-400
                  text-[7px]
                  text-white

                  tablet:text-[12px]
                "
              >
                구매 포인트
              </span>

              <div
                className="
                  flex
                  items-center
                  gap-[3px]

                  tablet:gap-[6px]
                "
              >
                <strong
                  className="
                    font-sans-400
                    text-[10px]
                    leading-3.5
                    text-[#FFC146]

                    tablet:text-[20px]
                  "
                >
                  {formatPrice(card.price)}
                </strong>

                <Image
                  src="/cardpoint.png"
                  alt="포인트"
                  width={16}
                  height={16}
                  className="
                    h-auto
                    w-2
                    translate-y-[3px]

                    tablet:w-4
                  "
                />
              </div>
            </div>
          </div>

          {/* ========================================
              하단 로고
          ======================================== */}
          <div className="mt-1.5 flex justify-center tablet:mt-3">
            <Image
              src="/logo.png"
              alt="최애 멍냥"
              width={96}
              height={24}
              className="
                h-2.5
                w-10

                tablet:h-5
                tablet:w-20

                pc:h-6
                pc:w-24
              "
            />
          </div>
        </div>
      </button>
    </li>
  );
}

function ScoreRow({ label, value }) {
  return (
    <div
      className="
        grid
        w-full
        grid-cols-[50px_1fr_23px]
        items-center
        gap-x-1

        tablet:grid-cols-[100px_1fr_45px]
        tablet:gap-x-2.5
      "
    >
      <span
        className="
          font-sans-500
          text-[7px]
          whitespace-nowrap
          text-white

          tablet:text-[14px]
        "
      >
        {label}
      </span>

      <div className="h-1 overflow-hidden rounded-full bg-white tablet:h-2">
        <div
          className="h-full rounded-full bg-[#A656F5]"
          style={{
            width: `${value}%`,
          }}
        />
      </div>

      <span
        className="
          font-sans-600
          text-right
          text-[7px]
          whitespace-nowrap
          text-white

          tablet:text-[14px]
        "
      >
        {value}%
      </span>
    </div>
  );
}
