// 카테고리별 관상 지수 축. apps/web/components/card/scoreConfig.js 와 동일한 키를 쓴다
// (프론트·백엔드가 별도 배포 단위라 공유 패키지 없이 각자 들고 있음 — 값을 바꾸면 양쪽 다 수정해야 한다)
export const SCORE_AXES = {
  DOG: ["ENERGIZER", "MY_WAY", "CAPITALIST", "GRUMPY"],
  CAT: ["UDADA", "ALOOF", "CHURU_HUNTER", "PUNY_HUMAN"],
};
