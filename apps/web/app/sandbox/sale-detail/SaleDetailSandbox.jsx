"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import PhotoCard from "@/components/card/PhotoCard";
import { cardToPhotoCardProps } from "@/components/card/toPhotoCardProps";
import BuyerActionButtons from "@/components/trade/BuyerActionButtons";
import BuyerExchangeList from "@/components/trade/BuyerExchangeList";
import ExchangeProposalModal from "@/components/trade/ExchangeProposalModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Toast from "@/components/ui/Toast";
import { purchaseCard } from "@/lib/trade/api";

/**
 * SaleDetailView(공용, 다른 담당자 영역)의 임시 복제본. 구매자 시점만 그린다.
 * 원본은 absolute 좌표로 짜여 있어 교환 제시 모달을 폭별로 확인할 수 없어서 만든 것이다.
 */
export default function SaleDetailSandbox({ sale, currentUser }) {
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const router = useRouter();

  const cardName = `${sale.card.tag} ${sale.card.name}`;

  // Sale.card의 이미지 필드명은 imageUrl이 아니라 image다 (CLAUDE.md 참고)
  const cardProps = { ...cardToPhotoCardProps(sale.card), imageUrl: sale.card.image };

  function handlePurchaseClick() {
    if (currentUser.point < sale.price) {
      setToastMessage("보유 포인트가 부족합니다");
      return;
    }
    setToastMessage("");
    setIsPurchaseModalOpen(true);
  }

  async function handlePurchaseConfirm() {
    setIsPurchasing(true);
    try {
      await purchaseCard(sale.id);
      router.push(`/purchase/success?name=${encodeURIComponent(cardName)}`);
    } catch (error) {
      const code = error?.code ?? "UNKNOWN-ERROR";
      router.push(
        `/purchase/fail?code=${encodeURIComponent(code)}&name=${encodeURIComponent(cardName)}`,
      );
    } finally {
      setIsPurchasing(false);
      setIsPurchaseModalOpen(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-310 px-5 pt-8 pb-20 tablet:px-10 pc:px-0 pc:pt-14">
      <Toast isOpen={!!toastMessage} message={toastMessage} onClose={() => setToastMessage("")} />

      <Link href="/market" className="font-primary-bold text-xl text-gray-300 tablet:text-2xl">
        마켓플레이스
      </Link>

      <div className="mt-6 flex flex-col gap-2 tablet:mt-10 tablet:flex-row tablet:items-end tablet:justify-between tablet:gap-8">
        <h1 className="font-primary-bold text-2xl leading-snug text-white tablet:text-3xl pc:text-[40px]">
          {sale.card.tag}
          <br />
          {sale.card.name}
        </h1>
        <p className="font-sans-600 shrink-0 text-base text-white tablet:text-lg">
          by {sale.seller.nickname}
        </p>
      </div>

      {/* PC에서만 카드 박스(800px) + 정보 칸(400px) 2열, 그 아래 폭에서는 세로로 쌓는다 */}
      <div className="mt-6 grid gap-8 tablet:mt-10 pc:grid-cols-[minmax(0,1fr)_400px] pc:gap-10">
        <div className="flex items-center justify-center rounded-3xl bg-gray-400 p-6 tablet:p-10 pc:aspect-square">
          <div className="w-full max-w-90">
            <PhotoCard {...cardProps} />
          </div>
        </div>

        <div className="flex flex-col">
          <p className="font-sans-400 text-sm leading-relaxed text-gray-200">{sale.description}</p>

          <div className="mt-6 border-t border-white" />

          <div className="mt-5 flex items-center justify-between">
            <span className="font-sans-400 text-sm text-white">구매 포인트</span>
            <span className="flex items-center gap-1.5">
              <strong className="font-sans-600 text-lg text-yellow-button">
                {Number(sale.price).toLocaleString("ko-KR")}
              </strong>
              <Image src="/cardpoint.png" alt="포인트" width={16} height={16} className="size-4" />
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="font-sans-400 text-sm text-white">교환희망여부</span>
            <input
              type="checkbox"
              checked={sale.canExchange}
              readOnly
              className="size-5 accent-gray-300"
            />
          </div>

          {/* 시안대로 버튼은 오른쪽 칸 맨 아래에 붙인다 (PC에서만 아래로 밀린다) */}
          <div className="mt-10 pc:mt-auto">
            <BuyerActionButtons
              onPurchaseClick={handlePurchaseClick}
              onExchangeClick={() => setIsExchangeModalOpen(true)}
            />
          </div>
        </div>
      </div>

      <div className="mt-14 pc:mt-20">
        <BuyerExchangeList saleId={sale.id} />
      </div>

      <ExchangeProposalModal
        saleId={sale.id}
        isOpen={isExchangeModalOpen}
        onClose={() => setIsExchangeModalOpen(false)}
      />

      <ConfirmModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        title="포토카드 구매"
        description={`'${cardName}' 포토카드를 구매하시겠습니까?`}
        confirmLabel="구매하기"
        onConfirm={handlePurchaseConfirm}
        isSubmitting={isPurchasing}
      />
    </main>
  );
}
