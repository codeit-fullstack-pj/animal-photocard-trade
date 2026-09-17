"use client";

import { useState } from "react";
import CreateCardPicker from "./CreateCardPicker";
import CreateSaleForm from "@/components/trade/CreateSaleForm";
import ResponsiveModalShell from "@/components/ui/ResponsiveModalShell";
import { useRouter } from "next/navigation";
import { createSale } from "@/lib/sales/api";

export default function CreateSaleModal({ isOpen, onClose }) {
  const [selectedCard, setSelectedCard] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // 모달이 다시 열릴 때 이전에 고르던 카드/에러를 초기화 (렌더 중 조정 — React 권장 패턴)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setSelectedCard(null);
      setError("");
    }
  }

  async function handleSubmit({ description, canExchange, price }) {
    setIsSubmitting(true);
    setError("");
    try {
      await createSale({
        cardId: selectedCard.id,
        description,
        canExchange,
        price,
      });
      onClose();
      router.refresh();
    } catch (err) {
      setError(err?.message ?? "판매글 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ResponsiveModalShell
      isOpen={isOpen}
      onClose={onClose}
      onBack={selectedCard ? () => setSelectedCard(null) : undefined}
      title="나의 포토카드 판매하기"
      isSubmitting={isSubmitting}
    >
      {selectedCard ? (
        <CreateSaleForm
          selectedCard={selectedCard}
          onBack={() => setSelectedCard(null)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={error}
        />
      ) : (
        <CreateCardPicker onSelect={setSelectedCard} />
      )}
    </ResponsiveModalShell>
  );
}
