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
    "ENERGIZER>MY_WAY": "[직진 폼 미쳤다] 브레이크 없는 질주러",
    "ENERGIZER>CAPITALIST": "[궁극기: 간식 감지] 웃음으로 계약 완료",
    "ENERGIZER>GRUMPY": "[긴급 출동] 호다닥 엄마 찾기",
    "MY_WAY>ENERGIZER": "[패시브: 길바닥 고정] 눕방계의 전설",
    "MY_WAY>CAPITALIST": "[조건부 버프: 간식 등장] 간식 앞 친화력 만렙",
    "MY_WAY>GRUMPY": "[스킬: 솜방망이 알림] 툭툭 자기주장왕",
    "CAPITALIST>MY_WAY": "[미션 완료] 웃고 떠나는 미소천사",
    "CAPITALIST>ENERGIZER": "[상태 이상: 애교 과다] 갑자기 친한 척 장인",
    "CAPITALIST>GRUMPY": "[관찰 모드: 해제 불가] 허공과 대화하는 자",
    "GRUMPY>MY_WAY": "[방어 스킬: 쓰다듬기 회피] 손길을 피하는 도사",
    "GRUMPY>ENERGIZER": "[스킬: 눈치 레벨 MAX] 억울함 전문 배우",
    "GRUMPY>CAPITALIST": "[상태 이상: 미소 봉인 해제] 허당 카리스마",
  },
  CAT: {
    "UDADA>ALOOF": "[패시브: 심야 텐션 폭발] 시치미 우다다 대장",
    "UDADA>CHURU_HUNTER": "[궁극기: 츄르 직진] 간식 앞 폼 미쳤다",
    "UDADA>PUNY_HUMAN": "[패시브: 집사 지형지물화] 사람을 발판으로 쓰는 자",
    "ALOOF>UDADA": "[갑분 텐션 상승] 방금까지 얌전했던 자",
    "ALOOF>CHURU_HUNTER": "[치명타: 촉촉 눈빛] 츄르 앞 쿨함 해제",
    "ALOOF>PUNY_HUMAN": "[상시 효과: 근엄 아우라] 옥좌의 상전",
    "CHURU_HUNTER>UDADA": "[스킬: 간식 순간이동] 0.01초 간식 탐정",
    "CHURU_HUNTER>ALOOF": "[버프 지속시간: 3초] 간식 한정 개냥이",
    "CHURU_HUNTER>PUNY_HUMAN": "[집사 사용법 숙지 완료] 버튼 누르는 간식 헌터",
    "PUNY_HUMAN>UDADA": "[강력한 솜방망이] 슬쩍 툭 기습자",
    "PUNY_HUMAN>ALOOF": "[관전 모드: ON] 멍 때리기 만렙",
    "PUNY_HUMAN>CHURU_HUNTER": "[저전력 모드: ON] 바닥과 한 몸",
  },
};

// 관상 지수 1등·2등 축 조합별 카드 설명 (1등 축의 성격을 기본값으로, 2등 축을 반전·포인트로 엮는다).
// CARD_TAGS와 키 구성이 동일 — 사용자가 직접 입력하던 것을 ML 결과로 자동 생성하도록 대체
const CARD_DESCRIPTIONS = {
  DOG: {
    "ENERGIZER>MY_WAY":
      "산책 줄만 잡으면 이미 마음은 동네 한 바퀴를 완주했습니다. 옆에서 아무리 불러도 앞만 보고 냅다 질주하며, 오늘도 산책계의 폼을 혼자 다 끌어올립니다.",
    "ENERGIZER>CAPITALIST":
      "간식을 보는 순간 꼬리와 애교 스킬이 동시에 발동됩니다. 누구든 만나기만 하면 해맑은 미소와 살가운 몸짓으로 간식을 자연스럽게 끌어냅니다. 영업은 짧고, 성과는 확실한 타입입니다.",
    "ENERGIZER>GRUMPY":
      "의기양양하게 앞서 걷다가도 작은 소리 하나면 갑자기 집사 쪽으로 호다닥 달려옵니다. 겉보기에는 용감한 탐험가지만, 위기 상황에서는 누구보다 빠르게 집사에게 귀환하는 타입입니다.",
    "MY_WAY>ENERGIZER":
      "마음에 들지 않는 일이 생기면 길바닥에 바로 드러눕습니다. 하지만 시동만 걸리면 갑자기 우다다를 시작하는 반전형입니다. 방금 전까지 누워 있던 고양이와 동일묘가 맞는지 잠시 의심됩니다.",
    "MY_WAY>CAPITALIST":
      "평소에는 도도하고 쿨한 태도로 적당한 거리를 유지합니다. 하지만 간식이 눈앞에 나타나는 순간 태도가 부드럽게 업데이트되며, 세상 누구보다 자연스럽게 애교 모드로 로그인합니다.",
    "MY_WAY>GRUMPY":
      "원하는 게 있으면 짖는 대신 앞발로 집사의 팔을 툭툭 칩니다. 말보다 행동이 빠른 확실한 요구형이며, 뚱한 표정으로도 자신의 뜻을 끝까지 관철하는 능력이 있습니다.",
    "CAPITALIST>MY_WAY":
      "세상에서 가장 해맑은 표정으로 집사의 마음을 먼저 무장해제시킵니다. 원하는 간식을 챙기는 순간 임무가 끝났다는 듯 쿨하게 돌아서며, 방금 전의 애교는 흔적도 없이 사라집니다.",
    "CAPITALIST>ENERGIZER":
      "평소에는 얌전하게 자기 시간을 보내다가 간식 봉지 소리만 나면 태도가 180도 달라집니다. 방금 전까지 남처럼 굴던 고양이가 순식간에 세상 둘도 없는 애교쟁이로 변신합니다.",
    "CAPITALIST>GRUMPY":
      "늘 해맑게 웃고 있지만 그 눈빛 속에는 아무도 모르는 세계가 펼쳐져 있습니다. 아무 이유 없이 허공을 바라보며 웃는 모습은 묘하게 진지하고, 그래서 더 신경 쓰이는 매력이 있습니다.",
    "GRUMPY>MY_WAY":
      "세상의 모든 이치를 깨달은 듯 진지한 표정을 유지합니다. 집사가 쓰다듬으려고 손을 뻗는 순간 요리조리 피해 다니며, 다가오지 말라는 듯 적당한 거리를 아주 잘 지킵니다.",
    "GRUMPY>ENERGIZER":
      "뭔가 마음에 안 들거나 혼날 것 같은 분위기만 감지하면 촉촉한 눈빛을 장착합니다. 아무 말도 하지 않았는데 벌써 억울한 표정을 짓고 있어, 집사는 결국 먼저 미안해지고 맙니다.",
    "GRUMPY>CAPITALIST":
      "평소에는 미간을 찌푸린 채 최종 보스 같은 분위기를 유지합니다. 그러나 간식 냄새가 감지되는 순간 굳게 닫힌 미소 봉인이 풀립니다. 카리스마를 지키려 했지만 귀여움 수치가 먼저 초과됩니다.",
  },
  CAT: {
    "UDADA>ALOOF":
      "밤이 깊어지면 갑자기 온 집안을 광속으로 질주합니다. 그러다 집사와 눈이 마주치는 순간 거짓말처럼 멈춰 서서 아무 일도 없었다는 표정을 짓습니다. 방금까지 뛰던 고양이는 어디 갔는지 알 수 없습니다.",
    "UDADA>CHURU_HUNTER":
      "까맣게 커진 동공이 오직 츄르라는 목표만을 바라봅니다. 눈앞의 장애물도 가볍게 뛰어넘으며 간식 앞으로 직진하고, 먹을 것 앞에서는 한 치의 망설임도 없는 진심 모드를 보여줍니다.",
    "UDADA>PUNY_HUMAN":
      "집사가 편하게 누워 있어도 전혀 신경 쓰지 않습니다. 몸 위를 자연스럽게 밟고 넘어가며 집사를 가족이 아닌 최적의 이동 경로로 활용합니다. 효율만큼은 누구보다 확실한 실용주의자입니다.",
    "ALOOF>UDADA":
      "조금 전까지 우아하게 앉아 있던 고양이가 갑자기 눈빛을 바꾸고 집 안을 활개 치고 다닙니다. 이유도 목적지도 밝혀지지 않았지만, 본인만큼은 아주 중요한 미션을 수행 중인 듯 진지합니다.",
    "ALOOF>CHURU_HUNTER":
      "평소에는 누구도 쉽게 다가가기 어려운 차가운 비주얼을 자랑합니다. 하지만 츄르 봉지가 등장하는 순간 눈매가 촉촉해지며 모든 경계가 풀립니다. 도도함과 순둥함을 오가는 반전 매력의 소유자입니다.",
    "ALOOF>PUNY_HUMAN":
      "집안에서 가장 높은 곳을 차지하고 세상 진지한 표정으로 아래를 내려다봅니다. 집사를 포함한 모든 존재를 한눈에 관리하는 듯한 눈빛으로, 오늘도 혼자만의 왕국을 평화롭게 운영합니다.",
    "CHURU_HUNTER>UDADA":
      "집 안 어디에 숨어 있었는지 알 수 없지만 비닐 소리만 나면 바로 등장합니다. 바스락 소리를 감지한 지 0.01초 만에 현장에 도착하는, 간식 수사대의 최정예 요원입니다.",
    "CHURU_HUNTER>ALOOF":
      "츄르를 먹는 동안만큼은 세상 둘도 없는 천사 개냥이로 변신합니다. 골골송과 애교를 아낌없이 보여주지만 간식이 끝나는 순간 3초 만에 본래의 도도함으로 복귀합니다. 서비스 시간은 짧고 확실합니다.",
    "CHURU_HUNTER>PUNY_HUMAN":
      "집사를 맛있는 간식을 바치는 유용한 츄르 자판기로 정확히 인지하고 있습니다. 배가 고플 때만 다가와 버튼을 누르듯 몸을 비비고, 간식을 받으면 미련 없이 다음 목적지로 이동합니다.",
    "PUNY_HUMAN>UDADA":
      "평소에는 차분하게 상황을 관찰하다가 방심한 집사의 발목을 향해 솜방망이 펀치를 날립니다. 툭 치고는 아무 일도 없었다는 듯 돌아서는 능청스러움까지 완벽하게 장착했습니다.",
    "PUNY_HUMAN>ALOOF":
      "집사가 앞에서 온갖 재롱을 부려도 눈 하나 깜짝하지 않습니다. 모든 상황을 이미 알고 있다는 듯 허공을 바라보며, 세상일에 굳이 끼어들지 않는 프로 방관러의 면모를 보여줍니다.",
    "PUNY_HUMAN>CHURU_HUNTER":
      "바닥에 녹아내린 솜사탕처럼 온몸의 힘을 빼고 넓게 누워 있습니다. 움직일 생각은 없어 보이지만 간식 소리에는 누구보다 빠르게 반응하며, 배터리가 완전히 방전된 것은 아님을 증명합니다.",
  },
};

export function deriveCardTag(category, axes) {
  return deriveByRank(category, axes, CARD_TAGS);
}

export function deriveCardDescription(category, axes) {
  return deriveByRank(category, axes, CARD_DESCRIPTIONS);
}
