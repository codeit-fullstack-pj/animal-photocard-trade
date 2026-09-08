"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PhotoCard from "@/components/card/PhotoCard";

export default function CreateSuccessPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SuccessContent />
    </Suspense>
  );
}

function Loading() {
  return (
    <main className="flex w-full flex-1 items-center justify-center font-(family-name:--font-body) text-white">
      불러오는 중...
    </main>
  );
}

function SuccessContent() {
  const cardId = useSearchParams().get("id");
  const [card, setCard] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadCard() {
      // TODO: API 연동 시 GET /cards/{cardId} 응답으로 교체
      const data = {
        id: cardId ?? "temp",
        name: "임시 포토카드",
        category: "CAT",
        imageUrl: "",
        filterType: 1,
        description: "임시 설명입니다.",
        score: {
          axes: [
            { field: "재물운", value: 30 },
            { field: "애정운", value: 25 },
            { field: "건강운", value: 25 },
            { field: "사교운", value: 20 },
          ],
          topField: "재물운",
          topScore: 30,
        },
      };
      if (!ignore) setCard(data);
    }

    loadCard();
    return () => {
      ignore = true;
    };
  }, [cardId]);

  return (
    <main className="flex w-full flex-1 flex-col items-center justify-center gap-10 py-20 font-(family-name:--font-body)">
      <h2 className="text-center text-[46px] font-bold font-(family-name:--font-heading) text-white">
        포토카드 완성
      </h2>
      {card ? <PhotoCard card={card} /> : <Loading />}
    </main>
  );
}
