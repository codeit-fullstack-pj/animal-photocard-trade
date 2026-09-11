"use client";

import { useState } from "react";
import Image from "next/image";
import OfferCardPicker from "./OfferCardPicker";
import ExchangeProposalForm from "@/components/trade/ExchangeProposalForm";

export default function ExchangeProposalModal({ saleId, isOpen, onClose }) {
  const [selectedCard, setSelectedCard] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative flex h-193 w-235 flex-col rounded-[20px] bg-gray-500 p-15">
        <button type="button" onClick={() => onClose()} className="absolute top-6 right-6">
          <Image src="/close.png" alt="닫기" width={24} height={24} />
        </button>
        {selectedCard ? (
          <ExchangeProposalForm saleId={saleId} onSelect={selectedCard} />
        ) : (
          <OfferCardPicker onBack={setSelectedCard} onSelect={selectedCard} />
        )}
      </div>
    </div>
  );
}
