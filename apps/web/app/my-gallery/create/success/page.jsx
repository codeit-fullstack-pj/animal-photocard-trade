"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PhotoCard from "@/components/gallery/PhotoCard";
import LandingHeader from "@/components/landing/LandingHeader";

export default function CreateSuccessPage() {
  return (
    <>
      <LandingHeader />
      <Suspense fallback={<Loading />}>
        <SuccessContent />
      </Suspense>
    </>
  );
}

function Loading() {
  return (
    <main className="flex w-full flex-1 items-center justify-center px-4 font-sans-400 text-white">
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
    <main className="flex w-full flex-1 flex-col items-center justify-center gap-8 px-4 py-12 font-sans-400 pc:flex-row pc:gap-16 pc:py-20">
      <div className="flex flex-col items-center gap-6 pc:order-2">
        <h2 className="text-center text-[32px] font-primary-bold text-white pc:text-[46px]">
          포토카드 생성 <span className="text-purple-button">성공</span>
        </h2>
        {card && (
          <span className="text-center font-sans-400 text-base text-white">
            {card.name} 포토카드 생성이 완료되었습니다!
          </span>
        )}
        <Link
          href="/my-gallery"
          className="flex h-13.75 w-56.5 items-center justify-center rounded-xs bg-purple-button font-sans-400 text-base text-white pc:h-15 pc:w-110"
        >
          마이갤러리에서 확인하기
        </Link>
      </div>
      {card ? (
        <div className="origin-top scale-80 tablet:scale-100 pc:order-1">
          <PhotoCard card={card} />
        </div>
      ) : (
        <Loading />
      )}
    </main>
  );
}
