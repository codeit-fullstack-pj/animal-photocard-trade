// 카테고리별 관상 지수 축 매핑. PhotoCard 외에 카드 뽑기 결과 등 다른 화면에서도 같이 쓴다.
// color는 카드 태그(card-flavor.js의 CARD_TAGS는 이 축들의 "1등축>2등축" 조합으로 만들어짐) 표시용 —
// 태그와 이름이 잘 구분되도록 1등축 색을 입힌다 (모든 축 동일한 포인트 컬러로 통일)
const TAG_COLOR = "text-[#FFF27C]";

export const SCORE_CONFIG = {
  DOG: [
    { key: "ENERGIZER", label: "에너자이저", color: TAG_COLOR },
    { key: "MY_WAY", label: "마이웨이", color: TAG_COLOR },
    { key: "CAPITALIST", label: "자본주의 미소", color: TAG_COLOR },
    { key: "GRUMPY", label: "심기불편 맹수", color: TAG_COLOR },
  ],

  CAT: [
    { key: "UDADA", label: "우다다", color: TAG_COLOR },
    { key: "ALOOF", label: "까칠도도", color: TAG_COLOR },
    { key: "CHURU_HUNTER", label: "츄르 헌터", color: TAG_COLOR },
    { key: "PUNY_HUMAN", label: "하찮은 닝겐", color: TAG_COLOR },
  ],
};

// 카드의 관상 지수 축 중 1등축(가장 값이 높은 축, 동점이면 SCORE_CONFIG 순서상 앞선 축)의 색상을 반환.
// api/src/lib/card-flavor.js의 rankAxes와 동일한 규칙 — 같은 축 조합이면 항상 같은 태그·같은 색이 나온다
export function getPrimaryAxisColor(category, axes) {
  const config = SCORE_CONFIG[category];
  if (!config || !axes?.length) return undefined;

  const order = config.map((axis) => axis.key);
  const [top] = [...axes].sort((a, b) => {
    if (b.value !== a.value) return b.value - a.value;
    return order.indexOf(a.field) - order.indexOf(b.field);
  });

  return config.find((axis) => axis.key === top.field)?.color;
}
