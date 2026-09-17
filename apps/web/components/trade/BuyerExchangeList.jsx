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

  if (!isLoading && !error && exchanges.length === 0) return null;

  return (
    <section className="flex w-full flex-col gap-6">
      <h2 className="font-primary-bold text-2xl text-gray-300 tablet:text-3xl">
        내가 제시한 교환 목록
      </h2>

      {isLoading ? (
        <p className="font-sans-400 text-sm text-gray-300">불러오는 중...</p>
      ) : error ? (
        <p role="alert" className="font-sans-400 text-sm text-red">
          {error}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 tablet:grid-cols-2 pc:grid-cols-3">
          {exchanges.map((exchange) => (
            <li key={exchange.id} className="flex flex-col items-center gap-4">
              <p className="font-sans-400 w-full rounded-xs border border-gray-200 bg-gray-500 px-4 py-3 text-sm text-white">
                {exchange.message || "교환을 신청합니다."}
              </p>
              <ScaledPhotoCard {...cardToPhotoCardProps(exchange.offerCard)} />
              <button
                type="button"
                onClick={() => setCancelTarget(exchange)}
                className="font-sans-600 h-12.5 w-full rounded-xs border border-gray-200 text-sm text-white tablet:h-14"
              >
                취소하기
              </button>
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
