import { useState } from "react";

const SaleFormView = ({ card, onClose }) => {
  const [formData, setFormData] = useState({
    description: "",
    price: "",
    canExchange: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      console.log(checked);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:포트/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, cardId: card.id }),
    });
    if (res.ok) {
      onClose();
    } else {
      console.log("등록 실패");
    }
  };

  return (
    <div className="relative bg-[#0b0b0f] text-white rounded-3xl p-8 w-[760px]">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white text-2xl leading-none hover:text-gray-400"
      >
        ✕
      </button>
      <h2 className="text-[46px] font-bold mb-4">나의 포토카드 판매하기</h2>

      <div className="flex gap-6">
        <div className="w-[300px]">
          <img
            src={`https://picsum.photos/seed/${card.id}/400/300`}
            alt={card.name}
            className="w-full h-[240px] object-cover rounded-lg mb-2"
          />
          <h3 className="font-semibold mb-2">{card.name}</h3>
          {card.score.axes.map((axis) => (
            <p key={axis.field} className="text-xs text-gray-400">
              {axis.field}: {axis.value}%
            </p>
          ))}
          <p className="text-xs text-gray-400 mt-2">{card.tag}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3">
          <label className="text-sm">카드 설명</label>
          <textarea
            name="description"
            placeholder="카드 소개글을 입력해주세요."
            value={formData.description}
            onChange={handleChange}
            className="bg-[#1a1a1f] rounded-md p-2 text-sm h-24"
          />

          <label className="text-sm">판매 가격</label>
          <input
            name="price"
            type="number"
            placeholder="숫자만 입력"
            value={formData.price}
            onChange={handleChange}
            onWheel={(e) => e.target.blur()}
            className="bg-[#1a1a1f] rounded-md p-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              name="canExchange"
              type="checkbox"
              checked={formData.canExchange}
              onChange={handleChange}
            />
            교환희망여부
          </label>

          <div className="flex gap-2 mt-4">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-700 rounded-md py-2">
              취소하기
            </button>
            <button type="submit" className="flex-1 bg-purple-600 rounded-md py-2">
              판매하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleFormView;
