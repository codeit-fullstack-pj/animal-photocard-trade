"use client";

import { useRouter } from "next/navigation";

const MY_TRADE_CARDS_PATH = "/my-sales";
const MARKETPLACE_PATH = "/market";
const MY_GALLERY_PATH = "/my-gallery";

// 강조 단어·색상 — kind와 무관하게 항상 같다. 실패 버튼은 흰색으로 통일(노란색 변형 없음)
const VARIANT_STYLE = {
  success: {
    accentText: "성공",
    accentClassName: "text-purple",
    buttonClassName: "bg-purple-button text-black",
  },
  fail: {
    accentText: "실패",
    accentClassName: "text-yellow-button",
    buttonClassName: "bg-white text-black",
  },
};

// 제목 접두어·설명 명사·버튼 라벨·이동 경로 — kind마다 다르다
const CONTENT = {
  exchange: {
    titlePrefix: "교환 제시",
    descriptionNoun: "교환 제시",
    success: { buttonLabel: "나의 거래 포토카드에서 확인하기", destination: MY_TRADE_CARDS_PATH },
    fail: { buttonLabel: "마켓플레이스로 돌아가기", destination: MARKETPLACE_PATH },
  },
  purchase: {
    titlePrefix: "포토카드 구매",
    descriptionNoun: "구매",
    success: { buttonLabel: "마이갤러리에서 확인하기", destination: MY_GALLERY_PATH },
    fail: { buttonLabel: "마켓플레이스로 돌아가기", destination: MARKETPLACE_PATH },
  },
  sale: {
    titlePrefix: "판매 등록",
    descriptionNoun: "판매 등록",
    success: { buttonLabel: "나의 거래 포토카드에서 확인하기", destination: MY_TRADE_CARDS_PATH },
    fail: { buttonLabel: "마켓플레이스로 돌아가기", destination: MARKETPLACE_PATH },
  },
};

export default function TradeResultView({ kind, variant, errorCode, name }) {
  const router = useRouter();

  const { accentText, accentClassName, buttonClassName } = VARIANT_STYLE[variant];
  const { titlePrefix, descriptionNoun, [variant]: content } = CONTENT[kind];
  const { buttonLabel, destination } = content;

  // name이 있으면 "'name' {descriptionNoun}에 ..."로, 없으면 그 자리를 그냥 비운다
  const description = `${name ? `'${name}' ` : ""}${descriptionNoun}에 ${
    variant === "success" ? "성공했습니다!" : "실패했습니다."
  }`;

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
