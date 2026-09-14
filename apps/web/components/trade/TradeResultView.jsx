"use client";

import { useRouter } from "next/navigation";

//강조 단어·색상·버튼 색·이동 경로 — kind와 무관하게 항상 같다
const VARIANT_STYLE = {
  success: {
    accentText: "성공",
    accentClassName: "text-purple",
    buttonClassName: "bg-purple-button text-black",
    destination: "/my-cards",
  },
  fail: {
    accentText: "실패",
    accentClassName: "text-[#FFC146]",
    buttonClassName: "bg-white text-black",
    destination: "/marketplace",
  },
};

// 제목 접두어·설명 문구·버튼 라벨
const CONTENT = {
  exchange: {
    titlePrefix: "교환 제시",
    success: {
      description: "포토카드 교환 제시에 성공했습니다!",
      buttonLabel: "나의 거래 포토카드에서 확인하기",
    },
    fail: {
      description: "포토카드 교환 제시에 실패했습니다.",
      buttonLabel: "마켓플레이스로 돌아가기",
    },
  },
  purchase: {
    titlePrefix: "포토카드 구매",
    success: {
      description: "포토카드 구매에 성공했습니다!",
      buttonLabel: "나의 거래 포토카드에서 확인하기",
    },
    fail: {
      description: "포토카드 구매에 실패했습니다.",
      buttonLabel: "마켓플레이스로 돌아가기",
    },
  },
};

export default function TradeResultView({ kind, variant, errorCode }) {
  const router = useRouter();

  const { accentText, accentClassName, buttonClassName, destination } = VARIANT_STYLE[variant];
  const { titlePrefix, [variant]: content } = CONTENT[kind];
  const { description, buttonLabel } = content;

  // TODO: errorCode(예: CARD_ALREADY_OFFERED, SALE_ALREADY_CLOSED, INSUFFICIENT_POINT,
  // UNKNOWN-ERROR)별 실패 사유 문구를 여기서 분기해 description 자리에 넣을 예정.
  // 지금은 화면에 쓰지 않는다.
  void errorCode;

  function handleButtonClick() {
    router.push(destination);
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center tablet:gap-8 pc:gap-10">
      <div className="flex flex-col gap-3 tablet:gap-4">
        <h1 className="font-primary-bold text-3xl text-white tablet:text-4xl pc:text-[54px]">
          {titlePrefix} <span className={accentClassName}>{accentText}</span>
        </h1>
        <p className="font-sans-400 text-sm text-white tablet:text-base pc:text-lg">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={handleButtonClick}
        className={`font-sans-600 h-13 w-full max-w-90 rounded-xs text-sm tablet:h-14 tablet:max-w-100 tablet:text-base ${buttonClassName}`}
      >
        {buttonLabel}
      </button>
    </main>
  );
}
