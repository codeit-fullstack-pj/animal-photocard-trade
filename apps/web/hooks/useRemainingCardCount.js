import { useEffect, useState } from "react";

import { getRemainingCount } from "@/lib/card/api";

// 오늘 남은 포토카드 생성 가능 횟수 — 마이갤러리 생성 버튼과, 판매/교환 모달에서
// 카드가 하나도 없을 때 보여주는 생성 유도 버튼이 함께 쓴다
export function useRemainingCardCount() {
  // 조회 전(또는 실패)에는 0으로 둬서 생성 버튼을 막아둔다 — 확인 안 된 상태에서 눌리게 하는 것보단 안전한 쪽
  const [remainingCount, setRemainingCount] = useState(0);
  const [limit, setLimit] = useState(5);

  useEffect(() => {
    let ignore = false;

    getRemainingCount()
      .then((result) => {
        if (ignore) return;
        setRemainingCount(result.remainingCount);
        setLimit(result.limit);
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, []);

  return { remainingCount, limit };
}
