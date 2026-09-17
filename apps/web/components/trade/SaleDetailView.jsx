"use client";

import { useState } from "react";
import Link from "next/link";

import ConfirmModal from "@/components/ui/ConfirmModal";

import SellerActionButtons from "./SellerActionButtons.jsx";
import BuyerActionButtons from "./BuyerActionButtons.jsx";
import ExchangeListView from "./ExchangeListView.jsx";
import ExchangeProposalModal from "./ExchangeProposalModal.jsx";
import BuyerExchangeList from "./BuyerExchangeList.jsx";
import { purchaseCard } from "@/lib/trade/api.js";
import { useRouter } from "next/navigation";
import Toast from "@/components/ui/Toast.jsx";

// 판매글 상세 화면 — 판매자 본인이면 SellerActionButtons(수정/캔슬), 아니면 BuyerActionButtons를 보여줌
const SaleDetailView = ({ sale, currentUser }) => {
  // 지금 보고 있는 사람이 이 판매글의 판매자인지 판별
  const isSeller = currentUser.id === sale.seller.id;
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const router = useRouter();

  const cardName = `${sale.card.tag} ${sale.card.name}`;

  //상세 구매버튼 (1차검증)
  function handlePurchaseClick() {
    if (currentUser.point < sale.price) {
      setToastMessage("보유 포인트가 부족합니다");
      return;
    }
    setToastMessage("");
    setIsPurchaseModalOpen(true);
  }

  //구매 모달 구매버튼 (실구매)
  async function handlePurchaseConfirm() {
    setIsPurchasing(true);
    try {
      //구매 api
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
    <main className="relative w-[1920px] min-h-[2185px] bg-[#161616] text-white">
      <Toast isOpen={!!toastMessage} message={toastMessage} onClose={() => setToastMessage("")} />

      <div className="absolute left-[340px] top-[140px]">
        <Link href="/marketplace" className="text-2xl text-gray-300">
          마켓플레이스
        </Link>

        <h1 className="text-[40px] font-bold text-white mt-[60px]">{sale.card.tag}</h1>

        <h1 className="text-[40px] font-bold text-white mt-[20px]">{sale.card.name}</h1>
      </div>
      <p className="absolute right-[340px] top-[340px] text-white">by {sale.seller.nickname}</p>

      {/* 카드 이미지 박스 - mono gradient 테두리 */}
      <div className="absolute left-[341px] top-[400px] w-[800px] h-[800px] rounded-[24px] p-[2px] bg-gradient-to-br from-white via-gray-400 to-gray-700">
        <div className="w-full h-full rounded-[22px] bg-[#1a1a1f]" />
      </div>

      {/* 설명 */}
      <p className="absolute left-[1181px] top-[405px] w-[400px] text-sm text-gray-300 leading-relaxed">
        {sale.description}
      </p>

      {/* 구분선 */}
      <div className="absolute right-[339px] top-[553px] w-[400px] h-[1px] bg-white" />

      {/* 구매 포인트 */}
      <div className="absolute left-[1181px] top-[593px] w-[400px] flex items-center justify-between">
        <span className="text-sm text-white">구매 포인트</span>
        <span className="text-lg font-bold">{sale.price} 🪙</span>
      </div>

      {/* 교환희망여부 */}
      <div className="absolute left-[1181px] top-[643px] w-[400px] flex items-center gap-[273px]">
        <span className="text-sm text-white">교환희망여부</span>
        <input
          type="checkbox"
          checked={sale.canExchange}
          readOnly
          className="accent-gray-300 w-4 h-4"
        />
      </div>

      {/* 버튼 — isSeller에 따라 판매자용/구매자용 버튼을 다르게 렌더링 */}
      <div className="absolute left-[1181px] top-[1020px] w-[400px] flex flex-col gap-2 items-end">
        {isSeller ? (
          <SellerActionButtons sale={sale} />
        ) : (
          <BuyerActionButtons
            onPurchaseClick={handlePurchaseClick}
            onExchangeClick={() => setIsExchangeModalOpen(true)}
          />
        )}
      </div>
      {isSeller ? (
        <>
          <div className="absolute right-[339px] top-[1350px] w-[1235px] flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">교환 제시 목록</h2>
            <p className="text-sm text-gray-400">교환하실 카드를 눌러 교환할 수 있습니다</p>
          </div>
          <div className="absolute right-[339px] top-[1400px] w-[1235px] h-[1px] bg-white" />
          <ExchangeListView sale={sale} currentUser={currentUser} isSeller={isSeller} />
        </>
      ) : (
        <div className="absolute right-[339px] top-[1350px] w-[1235px]">
          <BuyerExchangeList saleId={sale.id} />
        </div>
      )}

      <ExchangeProposalModal
        saleId={sale.id}
        isOpen={isExchangeModalOpen}
        onClose={() => setIsExchangeModalOpen(false)}
      />

      <ConfirmModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        title="포토카드 구매"
        description={`'${sale.card.tag} ${sale.card.name}' 포토카드를 구매하시겠습니까?`}
        confirmLabel="구매하기"
        onConfirm={handlePurchaseConfirm}
        isSubmitting={isPurchasing}
      />
    </main>
  );
};

export default SaleDetailView;
