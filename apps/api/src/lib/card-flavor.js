import { SCORE_AXES } from "./score-config.js";

// 관상 지수 1등·2등 축 조합(카테고리당 4×3=12가지)별 카드 태그. 설명은 사용자가 직접 입력한다
// 키는 "1등축>2등축" (score-config.js 의 SCORE_AXES 키와 일치해야 함)
const CARD_TAGS = {
  DOG: {
    "ENERGIZER>MY_WAY": "세상을 누비는 에너자이저",
    "ENERGIZER>CAPITALIST": "끝없이 달리는 에너자이저",
    "ENERGIZER>GRUMPY": "은근히 까칠한 에너자이저",
    "MY_WAY>ENERGIZER": "나만의 길을 걷는 멍멍이",
    "MY_WAY>CAPITALIST": "실속 챙기는 마이웨이",
    "MY_WAY>GRUMPY": "예민한 자유영혼",
    "CAPITALIST>MY_WAY": "작은 자본가",
    "CAPITALIST>ENERGIZER": "활기찬 자본가",
    "CAPITALIST>GRUMPY": "까칠한 자본가",
    "GRUMPY>MY_WAY": "까칠하지만 귀여운 멍멍이",
    "GRUMPY>ENERGIZER": "심기불편 럭비공",
    "GRUMPY>CAPITALIST": "계산적인 심술꾸러기",
  },
  CAT: {
    "UDADA>ALOOF": "우주를 정복하는 마에스트로",
    "UDADA>CHURU_HUNTER": "질주하는 말괄량이",
    "UDADA>PUNY_HUMAN": "천방지축 지배자",
    "ALOOF>UDADA": "우아한 고양이",
    "ALOOF>CHURU_HUNTER": "도도한 츄르 헌터",
    "ALOOF>PUNY_HUMAN": "도도한 매력의 집사",
    "CHURU_HUNTER>UDADA": "츄르를 사수하는 헌터",
    "CHURU_HUNTER>ALOOF": "새침한 츄르 헌터",
    "CHURU_HUNTER>PUNY_HUMAN": "간식 셔틀 조련사",
    "PUNY_HUMAN>UDADA": "닝겐 조련하는 말괄량이",
    "PUNY_HUMAN>ALOOF": "인간을 다루는 마에스트로",
    "PUNY_HUMAN>CHURU_HUNTER": "간식으로 매수당하는 닝겐 조련사",
  },
};

// score.axes(ImageData에 저장된 ML 결과)에서 1·2등 축을 뽑아 카드 태그를 정한다.
// 동점이면 SCORE_AXES에 정의된 원래 순서상 앞선 축을 우선해서 항상 같은 결과가 나오게 한다
export function deriveCardTag(category, axes) {
  const order = SCORE_AXES[category];
  const ranked = [...axes].sort((a, b) => {
    if (b.value !== a.value) return b.value - a.value;
    return order.indexOf(a.field) - order.indexOf(b.field);
  });

  const key = `${ranked[0].field}>${ranked[1].field}`;
  return CARD_TAGS[category][key];
}
