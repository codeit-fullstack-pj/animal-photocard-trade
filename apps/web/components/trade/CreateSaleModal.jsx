"use client";
import { useState } from "react";

const CreateSaleModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    cardId: "",
    description: "",
    canExchange: false,
    price: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:4000/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      onClose();
    } else {
      console.log("등록 실패");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg p-6" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            name="cardId"
            placeholder="카드 ID"
            value={formData.cardId}
            onChange={handleChange}
          />
          <input
            name="description"
            placeholder="설명"
            value={formData.description}
            onChange={handleChange}
          />
          <input
            name="price"
            type="number"
            placeholder="가격"
            value={formData.price}
            onChange={handleChange}
          />
          <label>
            <input
              name="canExchange"
              type="checkbox"
              checked={formData.canExchange}
              onChange={handleChange}
            />
            교환 가능
          </label>
          <button type="submit">등록</button>
        </form>
      </div>
    </div>
  );
};

export default CreateSaleModal;
