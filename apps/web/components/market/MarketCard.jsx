import Image from "next/image";
import Link from "next/link";

import { SCORE_CONFIG } from "@/components/card/scoreConfig";

const formatPrice = (price) => {
  if (price == null) {
    return "0";
  }

  return Number(price).toLocaleString("ko-KR");
};

export default function MarketCard({ card }) {
  // 카드의 category에 맞는 점수 설정 가져오기
  //
  // DOG → 강아지 점수 설정
  // CAT → 고양이 점수 설정
  const scoreConfig = SCORE_CONFIG[card.category] ?? [];

  // 실제 카드의 score.axes와 SCORE_CONFIG를 연결
  const scoreRows = scoreConfig.map((config) => {
    const score = card.score?.axes?.find((item) => item.field === config.key);

    return {
      key: config.key,
      label: config.label,
      value: score?.value ?? 0,
    };
  });

  return (
    <li className="min-w-0">
      <Link
        href={`/market/${card.id}`}
        className="
          group
          block
          overflow-hidden
          rounded-[12px]
          border
          border-[#555555]
          bg-gradient-to-b
          from-[#444444]
          to-[#292929]
          transition-all
          duration-200
          hover:-translate-y-[3px]
          hover:border-[#777777]
          hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)]
        "
      >
        {/* ==================================
            카드 이미지
        ================================== */}

        <div
          className="
            relative
            mx-[12px]
            mt-[12px]
            aspect-[1.55/1]
            overflow-hidden
            rounded-[8px]
            bg-[#333333]
          "
        >
          <Image
            src={card.imageUrl}
            alt={card.name}
            fill
            sizes="400px"
            className="
              object-cover
              transition-transform
              duration-300
              group-hover:scale-[1.02]
            "
          />
        </div>

        {/* ==================================
            카드 정보
        ================================== */}

        <div
          className="
            px-[12px]
            pb-[16px]
            pt-[12px]
          "
        >
          {/* 카드 제목 */}

          <h3
            className="
              min-h-[52px]
              text-[19px]
              font-bold
              leading-[1.4]
              tracking-[-0.5px]
              text-white
            "
          >
            {card.tag}
          </h3>

          {/* ==================================
              관상 지수
          ================================== */}

          <div
            className="
              mt-[12px]
              flex
              flex-col
              gap-[7px]
            "
          >
            {scoreRows.map((score) => (
              <div
                key={score.key}
                className="
                  grid
                  grid-cols-[64px_minmax(0,1fr)_40px]
                  items-center
                  gap-[8px]
                  text-[12px]
                "
              >
                {/* 점수 이름 */}

                <span className="truncate text-white">{score.label}</span>

                {/* 점수 바 */}

                <div
                  className="
                    h-[6px]
                    overflow-hidden
                    rounded-full
                    bg-[#f1f1f1]
                  "
                >
                  <span
                    className="
                      block
                      h-full
                      rounded-full
                      bg-[#a855f7]
                    "
                    style={{
                      width: `${score.value}%`,
                    }}
                  />
                </div>

                {/* 점수 */}

                <span className="text-right text-white">{score.value}%</span>
              </div>
            ))}
          </div>

          {/* ==================================
              구분선
          ================================== */}

          <div
            className="
              my-[14px]
              h-px
              bg-[#555555]
            "
          />

          {/* ==================================
              구매 포인트
          ================================== */}

          <div className="flex items-center justify-between">
            <span className="text-[13px] text-white">구매 포인트</span>

            <strong
              className="
                text-[24px]
                font-normal
                leading-none
                text-[#f5bd45]
              "
            >
              {formatPrice(card.price)}

              <small
                className="
                  ml-[4px]
                  text-[12px]
                  text-white
                "
              >
                P
              </small>
            </strong>
          </div>

          {/* ==================================
              로고
          ================================== */}

          <div
            className="
              mt-[10px]
              flex
              h-[24px]
              items-center
              justify-center
            "
          >
            <Image
              src="/images/logo.png"
              alt="최애멍냥"
              width={80}
              height={24}
              className="h-[24px] w-[80px] object-contain"
            />
          </div>
        </div>
      </Link>
    </li>
  );
}
