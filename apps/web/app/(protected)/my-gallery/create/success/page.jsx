"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ScaledPhotoCard from "@/components/card/ScaledPhotoCard";
import { cardToPhotoCardProps } from "@/components/card/toPhotoCardProps";
import MobileHeader from "@/components/ui/MobileHeader";
import AppHeader from "@/components/ui/AppHeader";

export default function CreateSuccessPage() {
  return (
    <>
      <div className="tablet:hidden">
        <MobileHeader title="포토카드 생성" backHref="/my-gallery" />
      </div>
      <div className="hidden tablet:block">
        <AppHeader />
      </div>
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
  const searchParams = useSearchParams();
  const cardId = searchParams.get("id");
  const [card, setCard] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadCard() {
      // TODO: API 연동 시 GET /cards/{cardId} 응답으로 교체. 지금은 create 페이지가 실제
      // POST /cards 응답값을 쿼리로 그대로 넘긴다 (success 페이지 자체 조회 API가 아직 없어서)
      const rawScore = searchParams.get("score");
      const data = {
        id: cardId ?? "temp",
        name: searchParams.get("name") || "임시 포토카드",
        category: searchParams.get("category") || "CAT",
        imageUrl: searchParams.get("imageUrl") || "",
        filterType: Number(searchParams.get("filterType")) || 1,
        description: searchParams.get("description") || "임시 설명입니다.",
        tag: searchParams.get("tag") || "",
        score: rawScore ? JSON.parse(rawScore) : { axes: [] },
      };
      if (!ignore) setCard(data);
    }

    loadCard();
    return () => {
      ignore = true;
    };
  }, [cardId, searchParams]);

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
        <div className="w-full max-w-42 tablet:max-w-90 pc:order-1">
          <ScaledPhotoCard {...cardToPhotoCardProps(card)} />
        </div>
      ) : (
        <Loading />
      )}
    </main>
  );
}
