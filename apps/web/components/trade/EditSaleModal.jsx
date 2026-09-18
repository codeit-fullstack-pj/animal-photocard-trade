"use client";

import { useState } from "react";

import EditSaleForm from "@/components/trade/EditSaleForm";
import ConfirmModal from "@/components/ui/ConfirmModal";
import ResponsiveModalShell from "@/components/ui/ResponsiveModalShell";
import { updateSale } from "@/lib/sales/api";

export default function EditSaleModal({ isOpen, onClose, sale, card, onUpdated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // 모달이 다시 열릴 때 이전 에러를 초기화 (렌더 중 조정 — React 권장 패턴)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setError("");
  }

  async function handleSubmit({ description, canExchange, price }) {
    setIsSubmitting(true);
    setError("");
    try {
      await updateSale(sale.id, { description, canExchange, price });
      setIsSuccessModalOpen(true);
    } catch (err) {
      setError(err?.message ?? "판매글 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSuccessConfirm() {
    setIsSuccessModalOpen(false);
    onClose();
    onUpdated?.();
  }

  return (
    <>
      <ResponsiveModalShell
        isOpen={isOpen && !isSuccessModalOpen}
        onClose={onClose}
        title="판매글 수정하기"
        isSubmitting={isSubmitting}
        flushMobileBottom
      >
        <EditSaleForm
          card={card}
          initialData={{
            description: sale.description,
            price: sale.price,
            canExchange: sale.canExchange,
          }}
          onClose={onClose}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={error}
        />
      </ResponsiveModalShell>

      <ConfirmModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessConfirm}
        title="수정하기 성공"
        description="수정이 완료되었습니다."
        confirmLabel="확인"
        onConfirm={handleSuccessConfirm}
      />
    </>
  );
}
