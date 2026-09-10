// CreateSaleModal.jsx
"use client";
import { useState } from "react";
import CardListView from "./CardListView";
import SaleFormView from "./SaleFormView";

const CreateSaleModal = ({ onClose }) => {
  const [selectedCard, setSelectedCard] = useState(null);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center overflow-y-auto p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#161616] w-[940px] h-[772px] p-[60px] flex flex-col rounded-3xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-12 right-12 text-white text-2xl leading-none hover:text-gray-400"
        >
          ✕
        </button>

        {selectedCard === null ? (
          <CardListView onSelectCard={(card) => setSelectedCard(card)} />
        ) : (
          <SaleFormView
            card={selectedCard}
            onClose={onClose}
            onBack={() => setSelectedCard(null)}
          />
        )}
      </div>
    </div>
  );
};

export default CreateSaleModal;
