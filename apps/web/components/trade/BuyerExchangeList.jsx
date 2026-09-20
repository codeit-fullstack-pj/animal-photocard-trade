"use client";

import ScaledPhotoCard from "@/components/card/ScaledPhotoCard";
import { cardToPhotoCardProps } from "@/components/card/toPhotoCardProps";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { cancelExchangeProposal, getSaleExchanges } from "@/lib/trade/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BuyerExchangeList({ saleId }) {
  //modal cancelTarget인 exchange 객체자체를 state로 본다
  const [exchanges, setExchanges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const router = useRouter();

  //렌더링
  useEffect(() => {
    const loadExchanges = async () => {
      try {
        const result = await getSaleExchanges(saleId);
        setExchanges(result);
        setError("");
      } catch {
        setError("교환 제시 목록을 불러오지 못했어요.");
      } finally {
        setIsLoading(false);
      }
    };
    loadExchanges();
  }, [saleId, reloadKey]);

  //취소 모달 내에서 확정 취소버튼 클릭
  async function handleCancelConfirm() {
    setIsCancelling(true);
    try {
      await cancelExchangeProposal(cancelTarget.id);
      setCancelTarget(null);
      setReloadKey((k) => k + 1);
      router.refresh();
    } catch {
      setCancelTarget(null);
      setReloadKey((k) => k + 1);
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <section className="flex w-full flex-col">
      <h2 className="font-sans-700 text-xl text-white tablet:text-[28px] pc:text-[30px]">
        내가 제시한 교환 목록
      </h2>

      <div className="mt-4 mb-6 border-t border-gray-400 tablet:mt-4 tablet:mb-6 pc:mt-5 pc:mb-8" />

      {isLoading ? (
        <p className="font-sans-400 flex min-h-40 items-center justify-center text-sm text-gray-300">
          불러오는 중...
        </p>
      ) : error ? (
        <p
          role="alert"
          className="font-sans-400 flex min-h-40 items-center justify-center text-sm text-gray-300"
        >
          {error}
        </p>
      ) : exchanges.length === 0 ? (
        <div className="font-sans-400 flex min-h-40 flex-col items-center justify-center text-base leading-relaxed text-gray-200 tablet:text-lg">
          <p>아직 제시한 교환이 없습니다.</p>
          <p>내 카드를 제시해보세요!</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 tablet:grid-cols-2 pc:grid-cols-3">
          {exchanges.map((exchange) => (
            <li key={exchange.id} className="flex items-start gap-2 tablet:flex-col tablet:gap-0">
              <p className="font-sans-400 order-2 flex-1 rounded-[20px] rounded-tl-none bg-[#B8B8B8] px-4 py-3 text-sm text-black tablet:order-0 tablet:w-full tablet:flex-none tablet:rounded-tl-[20px] tablet:rounded-bl-none tablet:px-10 tablet:text-base">
                {exchange.message || "교환을 신청합니다."}
              </p>
              <div className="order-1 w-full max-w-42 shrink-0 tablet:order-0 tablet:mt-2 tablet:max-w-none">
                <div className="relative z-10">
                  <ScaledPhotoCard {...cardToPhotoCardProps(exchange.offerCard)} />
                </div>

                <div className="-mt-1.75 bg-[#575757] px-1.75 pt-3.5 pb-1.75 tablet:-mt-3.5 tablet:px-5 tablet:pt-7.5 tablet:pb-4">
                  <button
                    type="button"
                    onClick={() => setCancelTarget(exchange)}
                    className="font-sans-700 h-10 w-full rounded-xs bg-gray-100 text-base text-black tablet:h-15 tablet:text-lg"
                  >
                    취소하기
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <ConfirmModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="교환 제시 취소"
        description={
          cancelTarget &&
          `'${cancelTarget.offerCard.tag} ${cancelTarget.offerCard.name}' 교환 제시를 취소하시겠습니까?`
        }
        confirmLabel="취소하기"
        onConfirm={handleCancelConfirm}
        isSubmitting={isCancelling}
      />
    </section>
  );
}
