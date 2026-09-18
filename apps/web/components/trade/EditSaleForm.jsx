"use client";

import { useState } from "react";

import ScaledPhotoCard from "@/components/card/ScaledPhotoCard";
import { cardToPhotoCardProps } from "@/components/card/toPhotoCardProps";

export default function EditSaleForm({
  card,
  initialData,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}) {
  const [description, setDescription] = useState(initialData.description ?? "");
  const [price, setPrice] = useState(String(initialData.price ?? ""));
  const [canExchange, setCanExchange] = useState(initialData.canExchange ?? false);

  function handleSubmit() {
    onSubmit({ description, canExchange, price: Number(price) });
  }

  return (
    <div className="flex h-full flex-col">
      <h2 className="hidden pc:mb-8 pc:block font-primary-bold text-2xl text-white">
        판매글 수정하기
      </h2>

      <div className="flex flex-1 flex-col gap-5 pc:flex-row pc:gap-10">
        <div className="flex w-[70%] max-w-86 flex-1 shrink-0 items-center justify-center self-center tablet:w-full pc:my-0 pc:w-100 pc:max-w-100 pc:self-auto">
          <ScaledPhotoCard {...cardToPhotoCardProps(card)} />
        </div>

        <div className="flex flex-none flex-col pc:flex-1">
          <p className="font-sans-600 text-base text-white">판매글 설명</p>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="카드 소개글을 입력해 주세요"
            className="font-sans-400 mt-2 min-h-30 flex-1 resize-none rounded-xs border border-gray-200 bg-transparent p-4 text-sm text-white placeholder:text-gray-200 focus:border-purple focus:outline-none pc:h-40 pc:flex-none"
          />

          <p className="font-sans-600 mt-4 text-base text-white">판매 가격</p>
          <input
            type="number"
            min="0"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            onWheel={(event) => event.target.blur()}
            placeholder="숫자만 입력"
            className="font-sans-400 mt-2 rounded-xs border border-gray-200 bg-transparent p-4 text-sm text-white placeholder:text-gray-200 focus:border-purple focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />

          <label className="font-sans-600 mt-4 flex items-center gap-2 text-base text-white">
            <input
              type="checkbox"
              checked={canExchange}
              onChange={(event) => setCanExchange(event.target.checked)}
              className="size-4 accent-purple-button"
            />
            교환 희망 여부
          </label>

          {error && <p className="font-sans-400 mt-3 text-sm text-red">{error}</p>}

          <div className="sticky bottom-0 mt-6 flex gap-3 bg-black pb-4 tablet:pb-5 pc:static pc:bg-transparent">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="font-sans-600 h-12.5 flex-3 rounded-xs border border-gray-200 text-base text-white disabled:opacity-50 pc:w-30 pc:flex-none"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !price}
              className="font-sans-700 h-12.5 flex-7 rounded-xs bg-yellow-button text-base text-black disabled:opacity-50 pc:flex-1"
            >
              수정하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
