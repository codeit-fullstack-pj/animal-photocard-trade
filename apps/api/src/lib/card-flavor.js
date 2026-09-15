import { SCORE_AXES } from "./score-config.js";

// score.axes(ImageData에 저장된 ML 결과)에서 1·2등 축을 뽑는다.
// 동점이면 SCORE_AXES에 정의된 원래 순서상 앞선 축을 우선해서 항상 같은 결과가 나오게 한다
function rankAxes(category, axes) {
  const order = SCORE_AXES[category];
  return [...axes].sort((a, b) => {
    if (b.value !== a.value) return b.value - a.value;
    return order.indexOf(a.field) - order.indexOf(b.field);
  });
}

// key: "1등축>2등축" (score-config.js 의 SCORE_AXES 키와 일치해야 함). 카테고리당 4×3=12가지, 모델(DOG/CAT) 2개 합쳐 24가지
function deriveByRank(category, axes, table) {
  const ranked = rankAxes(category, axes);
  const key = `${ranked[0].field}>${ranked[1].field}`;
  return table[category][key];
}

// 관상 지수 1등·2등 축 조합별 카드 태그
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

// 관상 지수 1등·2등 축 조합별 카드 설명 (1등 축의 성격을 기본값으로, 2등 축을 반전·포인트로 엮는다).
// CARD_TAGS와 키 구성이 동일 — 사용자가 직접 입력하던 것을 ML 결과로 자동 생성하도록 대체
const CARD_DESCRIPTIONS = {
  DOG: {
    "ENERGIZER>MY_WAY":
      "넘치는 에너지로 온 동네를 헤집고 다니면서도, 가고 싶은 곳은 꼭 자기 뜻대로 정하는 타입. 산책은 언제나 내가 리드한다.",
    "ENERGIZER>CAPITALIST":
      "지치지 않는 체력으로 하루 종일 뛰어놀지만, 간식 한 조각 앞에서는 바로 세상 제일 사랑스러운 미소를 장착한다.",
    "ENERGIZER>GRUMPY":
      "쉴 새 없이 활기차게 움직이다가도, 마음에 안 드는 순간엔 한 번씩 날카로운 본색을 드러내는 반전의 소유자.",
    "MY_WAY>ENERGIZER":
      "내키는 대로, 가고 싶은 길로만 걷는 자유로운 영혼. 그 와중에 에너지는 또 남아돌아서 못 말리는 텐션을 자랑한다.",
    "MY_WAY>CAPITALIST":
      "누가 뭐래도 내 페이스대로 사는 자유로운 성격이지만, 간식 앞에서는 은근슬쩍 실리를 챙기는 영리함도 있다.",
    "MY_WAY>GRUMPY":
      "누구의 간섭도 받지 않는 자유로운 스타일이라, 선을 넘는 순간엔 예민하게 날을 세우는 것도 잊지 않는다.",
    "CAPITALIST>MY_WAY":
      "간식과 보상 앞에서는 세상 누구보다 다정한 미소를 짓다가도, 결국 마지막 선택은 꼭 자기 마음대로 하고야 마는 실속파.",
    "CAPITALIST>ENERGIZER":
      "간식 하나면 세상 다 가진 듯한 미소를 보여주고, 그 행복감이 폭발적인 에너지로 온 집안을 뛰어다니게 만든다.",
    "CAPITALIST>GRUMPY":
      "간식 앞에서는 더없이 살가운 미소를 짓지만, 원하는 걸 못 받으면 금세 까칠하게 토라지는 은근한 반전 매력.",
    "GRUMPY>MY_WAY":
      "평소엔 시크하고 까칠한 편이지만, 결국 하고 싶은 대로 다 하고야 마는 은근히 사랑스러운 고집쟁이.",
    "GRUMPY>ENERGIZER":
      "기분이 조금만 틀어져도 날카롭게 반응하다가, 언제 그랬냐는 듯 폭발적인 에너지로 사방을 뛰어다니는 럭비공 같은 반전.",
    "GRUMPY>CAPITALIST":
      "평소엔 심기 불편한 표정이 기본값이지만, 간식 앞에서만큼은 계산적으로 사랑스러운 미소를 아끼지 않는다.",
  },
  CAT: {
    "UDADA>ALOOF":
      "한밤중이면 온 집을 무대 삼아 전력 질주하다가도, 낮에는 도도하게 눈길 한 번 안 주는 반전의 지배자.",
    "UDADA>CHURU_HUNTER":
      "쉴 새 없이 집안을 질주하는 말괄량이지만, 츄르 소리 하나엔 세상 어디보다 빠르게 달려온다.",
    "UDADA>PUNY_HUMAN":
      "종횡무진 우다다로 온 집을 헤집어 놓고, 치우는 건 늘 하찮은 닝겐의 몫이라는 듯 당당하다.",
    "ALOOF>UDADA":
      "평소엔 우아하고 도도한 태도를 유지하지만, 스위치가 켜지는 순간 갑자기 전력 질주하는 반전 매력의 소유자.",
    "ALOOF>CHURU_HUNTER":
      "평소엔 눈길조차 안 주는 도도한 태도지만, 츄르 앞에서만큼은 정확하게 타이밍을 노리는 예리한 헌터가 된다.",
    "ALOOF>PUNY_HUMAN":
      "고고하고 도도한 태도로 늘 한 발 거리를 유지하며, 곁을 내주는 닝겐만 겨우 곁에 둘 수 있는 도도함의 정점.",
    "CHURU_HUNTER>UDADA":
      "츄르 냄새는 단 1초도 놓치지 않는 예민한 후각의 소유자. 츄르 앞에서는 우다다급 스피드로 돌진한다.",
    "CHURU_HUNTER>ALOOF":
      "츄르 앞에서는 세상 진지해지지만, 다 먹고 나면 언제 그랬냐는 듯 다시 새침하게 거리를 둔다.",
    "CHURU_HUNTER>PUNY_HUMAN":
      "츄르를 향한 집념 하나로 하찮은 닝겐을 완벽하게 조련해, 원할 때마다 간식을 대령하게 만드는 능력자.",
    "PUNY_HUMAN>UDADA":
      "집사를 하찮게 여기며 완벽하게 부려먹다가도, 텐션이 오르면 예측 불가한 우다다로 집안을 뒤집어 놓는다.",
    "PUNY_HUMAN>ALOOF":
      "곁을 내주는 것조차 은혜라는 듯, 도도하고 여유로운 태도로 닝겐을 손바닥 위에서 다루는 지배자.",
    "PUNY_HUMAN>CHURU_HUNTER":
      "평소엔 닝겐을 하찮게 여기지만, 츄르 한 봉지면 태세를 싹 바꿔 순식간에 다정해지는 솔직한 성격.",
  },
};

export function deriveCardTag(category, axes) {
  return deriveByRank(category, axes, CARD_TAGS);
}

export function deriveCardDescription(category, axes) {
  return deriveByRank(category, axes, CARD_DESCRIPTIONS);
}
