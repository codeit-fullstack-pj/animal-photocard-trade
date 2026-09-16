"use client";

import { useState } from "react";
import Image from "next/image";
import OfferCardPicker from "./OfferCardPicker";
import ExchangeProposalForm from "@/components/trade/ExchangeProposalForm";
import { useRouter } from "next/navigation";
import { createExchangeProposal } from "@/lib/trade/api";

export default function ExchangeProposalModal({ saleId, isOpen, onClose }) {
  const [selectedCard, setSelectedCard] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative flex h-193 w-235 flex-col rounded-[20px] bg-gray-500 p-15">
        <button
          type="button"
          onClick={() => onClose()}
          disabled={isSubmitting}
          className="absolute top-6 right-6"
        >
          <Image src="/close.png" alt="닫기" width={24} height={24} />
        </button>
        {selectedCard ? (
          <ExchangeProposalForm
            selectedCard={selectedCard}
            onBack={() => setSelectedCard(null)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        ) : (
          <OfferCardPicker onSelect={setSelectedCard} />
        )}
      </div>
    </div>
  );
}
