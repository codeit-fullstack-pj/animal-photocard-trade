"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { apiFetch, csrfHeaders } from "@/lib/api-client";

// 판매글 등록/수정 폼 — initialData가 있으면 "수정 모드", 없으면 "등록 모드"로 동작
const SaleFormView = ({ card, onClose, onBack, initialData }) => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    description: initialData?.description || "",
    price: initialData?.price || "",
    canExchange: initialData?.canExchange || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const isEdit = !!initialData;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isEdit ? `/sales/${initialData.id}` : "/sales";
    const method = isEdit ? "PATCH" : "POST";

    try {
      await apiFetch(url, {
        method,
        body: { ...formData, cardId: card.id },
        headers: await csrfHeaders(),
      });
      router.refresh();
      onClose();
    } catch (error) {
      console.log("실패", error);
    }
  };

  return (
    <>
      <button
        onClick={onBack}
        className="absolute top-12 left-12 text-white text-2xl leading-none hover:text-gray-400"
      >
        ←
      </button>
      <h2 className="text-[23px] font-bold mb-4 top-[30px]">나의 포토카드 판매하기</h2>
      <div className="flex gap-6">
        <div className="flex-1">
          <div className="relative w-full h-60 mb-2">
            <Image
              src={card.imageUrl}
              alt={card.name}
              fill
              sizes="(min-width: 768px) 400px, 100vw"
              className="object-cover rounded-lg"
            />
          </div>
          <h3 className="font-semibold mb-2">
            {card.tag} {card.name}
          </h3>
          {card.score.axes.map((axis) => (
            <div key={axis.field} className="flex items-center gap-2 text-xs mb-2">
              <span className="w-20 text-gray-400">{axis.field}</span>
              <div className="flex-1 h-1.5 bg-white rounded-full">
                <div
                  className="h-1.5 bg-purple-button rounded-full"
                  style={{ width: `${axis.value}%` }}
                />
              </div>
              <span className="text-gray-400">{axis.value}%</span>
            </div>
          ))}
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
              {isEdit ? "수정하기" : "판매하기"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SaleFormView;
