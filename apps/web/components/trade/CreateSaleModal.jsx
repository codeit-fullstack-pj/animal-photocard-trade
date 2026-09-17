"use client";

import { useState } from "react";
import CreateCardPicker from "./CreateCardPicker";
import CreateSaleForm from "@/components/trade/CreateSaleForm";
import ResponsiveModalShell from "@/components/ui/ResponsiveModalShell";
import { useRouter } from "next/navigation";
import { createExchangeProposal } from "@/lib/trade/api";

export default function CreateSaleModal({ saleId, isOpen, onClose }) {
  const [selectedCard, setSelectedCard] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setSelectedCard(null);
  }

  async function handleSubmit(message = undefined) {
    const cardName = `${selectedCard.tag} ${selectedCard.name}`;
    setIsSubmitting(true);
    try {
      await createExchangeProposal(saleId, { offerCardId: selectedCard.id, message });
      router.push(`/exchange/create-success?name=${encodeURIComponent(cardName)}`);
    } catch (error) {
      const code = error?.code ?? "UNKNOWN-ERROR";
      router.push(
        `/exchange/create-fail?code=${encodeURIComponent(code)}&name=${encodeURIComponent(cardName)}`,
      );
    } finally {
      setIsSubmitting(false);
      onClose();
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
        />
      ) : (
        <CreateCardPicker onSelect={setSelectedCard} />
      )}
    </ResponsiveModalShell>
  );
}
