"use client";

import { useState } from "react";

import ScaledPhotoCard from "@/components/card/ScaledPhotoCard";
import { cardToPhotoCardProps } from "@/components/card/toPhotoCardProps";

export default function CreateSaleForm({ selectedCard, onBack, onSubmit, isSubmitting }) {
  const [message, setMessage] = useState("");

  return (
    <div className="flex h-full flex-col">
      <h2 className="hidden pc:mb-8 pc:block font-primary-bold text-2xl text-white">
        나의 포토카드 판매하기
      </h2>

      <div className="flex flex-1 flex-col pc:flex-row pc:gap-10">
        <div className="flex w-full max-w-42 flex-1 shrink-0 items-center justify-center self-center tablet:max-w-86 pc:my-0 pc:w-100 pc:max-w-100 pc:self-auto">
          <ScaledPhotoCard {...cardToPhotoCardProps(selectedCard)} />
        </div>

        <div className="flex flex-none flex-col pc:flex-1">
          <p className="font-sans-600 text-base text-white">판매글 설명</p>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="카드 소개글을 입력해 주세요"
            className="font-sans-400 mt-2 min-h-30 flex-1 resize-none rounded-xs border border-gray-200 bg-transparent p-4 text-sm text-white placeholder:text-gray-200 focus:border-purple focus:outline-none pc:h-60 pc:flex-none"
          />

          <div className="mt-6 flex gap-3 tablet:pb-5">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="font-sans-600 h-12.5 flex-3 rounded-xs border border-gray-200 text-base text-white disabled:opacity-50 pc:w-30 pc:flex-none"
            >
              뒤로
            </button>
            <button
              type="button"
              onClick={() => onSubmit(message)}
              disabled={isSubmitting}
              className="font-sans-700 h-12.5 flex-7 rounded-xs bg-yellow-button text-base text-black disabled:opacity-50 pc:flex-1"
            >
              판매하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
