"use client";
import { useState } from "react";

import SaleFormView from "@/components/trade/SaleFormView.jsx";
import CardListView from "@/components/trade/CardListView.jsx";

const CreateSaleModal = ({ onClose }) => {
  const [selectedCard, setSelectedCard] = useState(null);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center overflow-y-auto p-6"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>
        {selectedCard === null ? (
          <CardListView onSelectCard={(card) => setSelectedCard(card)} onClose={onClose} />
        ) : (
          <SaleFormView card={selectedCard} onClose={onClose} />
        )}
      </div>
    </div>
  );
};

export default CreateSaleModal;
