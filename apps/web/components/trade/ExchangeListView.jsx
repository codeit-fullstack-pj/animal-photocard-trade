"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ScaledPhotoCard from "@/components/card/ScaledPhotoCard";
import { cardToPhotoCardProps } from "@/components/card/toPhotoCardProps";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { acceptExchangeProposal, rejectExchangeProposal } from "@/lib/trade/api";

// 판매글에 걸린 교환 신청 목록을 보여주는 컴포넌트
const ExchangeListView = ({ sale, currentUser, isSeller }) => {
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const router = useRouter();
  // sale.exchanges: 이미 "이 판매글에 딸린 것만" 백엔드에서 걸러서 옴
  // 판매자면 전부 다 보여주고, 구매자(신청자)면 자기가 신청한 것만 보이게 필터링
  const saleExchanges = sale.exchanges.filter((exchange) => {
    if (exchange.status !== "PENDING" && exchange.status !== "ACCEPTED") return false;
    if (isSeller) return true;
    return exchange.offerCard.owner.id === currentUser.id;
  });

  async function handleExchangeAction(action) {
    if (!selectedExchange || isSubmitting) return;

    setIsSubmitting(true);
    setActionError("");
    try {
      await action(selectedExchange.id);
      setSelectedExchange(null);
      router.refresh();
    } catch (error) {
      setActionError(error?.message ?? "교환 제시를 처리하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (saleExchanges.length === 0) {
    return (
      <div className="font-sans-400 flex min-h-40 flex-col items-center justify-center text-base leading-relaxed text-gray-200 tablet:text-lg">
        <p>아직 받은 교환 제시가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ul className="grid grid-cols-1 gap-6 tablet:grid-cols-2 pc:grid-cols-3">
        {saleExchanges.map((exchange) => {
          const offerCard = exchange.offerCard;
          const isAccepted = exchange.status === "ACCEPTED";
          const cardProps = {
            ...cardToPhotoCardProps({
              ...offerCard,
              imageUrl: offerCard.image.imageUrl,
              category: offerCard.image.category,
              score: offerCard.image.score,
            }),
            isExchanged: isAccepted,
          };

          return (
            <li key={exchange.id} className="flex items-start gap-2 tablet:flex-col tablet:gap-0">
              <p className="font-sans-400 order-2 flex-1 rounded-[20px] rounded-tl-none bg-[#B8B8B8] px-4 py-3 text-sm text-black tablet:order-0 tablet:w-full tablet:flex-none tablet:rounded-tl-[20px] tablet:rounded-bl-none tablet:px-10 tablet:text-base">
                {exchange.message || "교환을 신청합니다."}
              </p>
              <div className="order-1 w-full max-w-42 shrink-0 tablet:order-0 tablet:mt-2 tablet:max-w-none">
                <button
                  type="button"
                  onClick={() => {
                    setActionError("");
                    setSelectedExchange(exchange);
                  }}
                  disabled={isAccepted}
                  aria-haspopup={isAccepted ? undefined : "dialog"}
                  aria-label={`${offerCard.tag} ${offerCard.name} ${isAccepted ? "교환 완료" : "교환 제시 확인"}`}
                  className="relative z-10 block w-full text-left focus-visible:outline-2 focus-visible:outline-purple-button disabled:cursor-default"
                >
                  <ScaledPhotoCard {...cardProps} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <ConfirmModal
        isOpen={!!selectedExchange}
        onClose={() => {
          setSelectedExchange(null);
          setActionError("");
        }}
        title="교환 하시겠습니까?"
        description={
          selectedExchange &&
          `${selectedExchange.offerCard.tag}\n${selectedExchange.offerCard.name}`
        }
        confirmLabel="교환하기"
        secondaryLabel="거절하기"
        onConfirm={() => handleExchangeAction(acceptExchangeProposal)}
        onSecondary={() => handleExchangeAction(rejectExchangeProposal)}
        isSubmitting={isSubmitting}
        errorMessage={actionError}
      />
    </div>
  );
};

export default ExchangeListView;
