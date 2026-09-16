const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

// 날짜를 한국 시간 기준 YYYY-MM-DD 형태로 변환
export function getKstDateKey(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

// 마지막 랜덤 포인트 획득일이 한국 시간 기준 오늘인지 확인
export function isDrawnTodayInKst(lastDrawAt) {
  if (!lastDrawAt) {
    return false;
  }

  return getKstDateKey(lastDrawAt) === getKstDateKey(new Date());
}

// 다음 한국 시간 자정까지 남은 시간과 분을 계산
export function getRemainingTimeToNextKstMidnight() {
  const now = new Date();
  const kstNow = new Date(now.getTime() + KST_OFFSET_MS);

  const nextKstMidnight =
    Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate() + 1) -
    KST_OFFSET_MS;

  const remainingMs = Math.max(0, nextKstMidnight - now.getTime());
  const totalMinutes = Math.ceil(remainingMs / (60 * 1000));

  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
}
