"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import ScaledPhotoCard from "@/components/card/ScaledPhotoCard";
import BuyerActionButtons from "@/components/trade/BuyerActionButtons";
import BuyerExchangeList from "@/components/trade/BuyerExchangeList";
import ExchangeListView from "@/components/trade/ExchangeListView";
import ExchangeProposalModal from "@/components/trade/ExchangeProposalModal";
import SellerActionButtons from "@/components/trade/SellerActionButtons";
import EditSaleModal from "@/components/trade/EditSaleModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Toast from "@/components/ui/Toast";
import { purchaseCard } from "@/lib/trade/api";
import { cancelSale } from "@/lib/sales/api";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function SaleDetailView({ sale }) {
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  // null | "success" | "error" — 판매 내리기 결과 안내 모달
  const [cancelOutcome, setCancelOutcome] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const router = useRouter();

  const { currentUser, reloadCurrentUser } = useAuth();
  const isSeller = currentUser?.id === sale.seller.id;
  const cardName = `${sale.card.tag} ${sale.card.name}`;

  const isSoldOut = sale.status === "SOLD_OUT";

  const cardProps = {
    variant: "owned",
    isSoldOut,
    card: {
      id: sale.card.id,
      name: sale.card.name,
      tag: sale.card.tag,
      description: sale.card.description,
      imageUrl: sale.card.image,
      category: sale.card.category,
      score: sale.card.score,
      filterType: sale.card.filterType,
    },
  };

  function handlePurchaseClick() {
    if (currentUser?.point < sale.price) {
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
      // 구매로 차감된 포인트를 헤더 등 전역 사용자 상태에 바로 반영한다.
      await reloadCurrentUser();
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

  async function handleCancelConfirm() {
    setIsCanceling(true);
    try {
      await cancelSale(sale.id);
      setIsCancelModalOpen(false);
      setCancelOutcome("success");
    } catch {
      setIsCancelModalOpen(false);
      setCancelOutcome("error");
    } finally {
      setIsCanceling(false);
    }
  }

  function handleCancelOutcomeConfirm() {
    setCancelOutcome(null);
    if (cancelOutcome === "success") {
      router.push("/market");
    } else {
      router.refresh();
    }
  }

  return (
    <main className="mx-auto w-full max-w-310 px-4 pt-6 pb-20 tablet:px-5 tablet:pt-8 pc:px-0 pc:pt-15">
      <Toast isOpen={!!toastMessage} message={toastMessage} onClose={() => setToastMessage("")} />

      <Link
        href="/market"
        className="font-primary-bold hidden text-xl text-gray-300 tablet:block tablet:text-base pc:text-2xl"
      >
        마켓플레이스
      </Link>

      <div className="flex flex-col gap-2 tablet:mt-10 tablet:flex-row tablet:items-end tablet:justify-between tablet:gap-8 pc:mt-15">
        <h1 className="font-sans-700 min-w-0 text-2xl leading-snug text-white tablet:flex-1 tablet:text-[38px] pc:text-[40px] pc:leading-13.5">
          {sale.card.tag} {sale.card.name}
        </h1>
        <p className="font-sans-400 shrink-0 text-xl text-white pc:text-2xl">
          by {sale.seller.nickname}
        </p>
      </div>

      <div className="mt-6 grid gap-6 tablet:mt-10 pc:grid-cols-[minmax(0,1fr)_400px] pc:gap-8.5">
        <div className="flex items-center justify-center rounded-2xl bg-[linear-gradient(70deg,#616161_0%,#878787_100%)] p-6 tablet:rounded-3xl tablet:p-10 pc:aspect-square">
          <div className="w-full max-w-42 tablet:max-w-90">
            <ScaledPhotoCard {...cardProps} />
          </div>
        </div>

        <div className="flex flex-col">
          <p className="font-sans-400 text-base leading-relaxed text-gray-200 tablet:text-lg">
            {sale.description}
          </p>

          <div className="mt-6 border-t border-gray-400" />

          <div className="mt-5 flex items-center justify-between tablet:mt-6 pc:mt-5">
            <span className="font-sans-400 text-base text-white tablet:text-lg">구매 포인트</span>
            <span className="flex items-center gap-1.5">
              <strong className="font-sans-600 text-2xl text-yellow-button">
                {Number(sale.price).toLocaleString("ko-KR")}
              </strong>
              <Image src="/cardpoint.png" alt="포인트" width={16} height={16} className="size-4" />
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="font-sans-400 text-base text-white tablet:text-lg">교환희망여부</span>
            <input
              type="checkbox"
              checked={sale.canExchange}
              readOnly
              className="size-5 accent-gray-300"
            />
          </div>

          <div className="mt-10 pc:mt-auto">
            {isSoldOut ? (
              <div className="font-sans-700 flex h-18 w-full items-center justify-center rounded-xs bg-gray-700 text-lg text-gray-200 tablet:h-18.75 pc:h-20">
                판매 완료됨
              </div>
            ) : isSeller ? (
              <SellerActionButtons
                onEditClick={() => setIsEditModalOpen(true)}
                onCancelClick={() => setIsCancelModalOpen(true)}
              />
            ) : (
              <BuyerActionButtons
                onPurchaseClick={handlePurchaseClick}
                onExchangeClick={() => setIsExchangeModalOpen(true)}
              />
            )}
          </div>
        </div>
      </div>

      {!isSoldOut && (
        <div className="mt-14 pc:mt-16">
          {isSeller ? (
            <section>
              <h2 className="font-sans-700 text-xl text-white tablet:text-[28px] pc:text-[30px]">
                교환 제시 목록
              </h2>
              <div className="mt-5 border-t border-gray-400 tablet:mt-4 pc:mt-5" />
              <div className="mt-8 tablet:mt-6 pc:mt-8">
                <ExchangeListView sale={sale} currentUser={currentUser} isSeller={isSeller} />
              </div>
            </section>
          ) : (
            <BuyerExchangeList saleId={sale.id} />
          )}
        </div>
      )}

      {!isSeller && !isSoldOut && (
        <>
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
        </>
      )}

      <EditSaleModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        sale={sale}
        card={cardProps.card}
        onUpdated={() => router.refresh()}
      />

      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="포토카드 판매 내리기"
        description="정말로 판매를 중단하시겠습니까?"
        confirmLabel="판매 내리기"
        secondaryLabel="취소하기"
        onConfirm={handleCancelConfirm}
        isSubmitting={isCanceling}
      />

      <ConfirmModal
        isOpen={cancelOutcome === "error"}
        onClose={handleCancelOutcomeConfirm}
        title="Error"
        description="판매 게시글을 내리지 못했습니다."
        confirmLabel="확인"
        onConfirm={handleCancelOutcomeConfirm}
      />

      <ConfirmModal
        isOpen={cancelOutcome === "success"}
        onClose={handleCancelOutcomeConfirm}
        title="알림"
        description="게시글이 성공적으로 삭제되었습니다."
        confirmLabel="확인"
        onConfirm={handleCancelOutcomeConfirm}
      />
    </main>
  );
}
