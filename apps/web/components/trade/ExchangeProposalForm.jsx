"use client";

import { useState } from "react";

import PhotoCard from "@/components/card/PhotoCard";
import { cardToPhotoCardProps } from "@/components/card/toPhotoCardProps";

export default function ExchangeProposalForm({ selectedCard, onBack, onSubmit, isSubmitting }) {
  const [message, setMessage] = useState("");

  return (
    <div className="flex h-full gap-10">
      <div className="w-84.25 shrink-0">
        <PhotoCard {...cardToPhotoCardProps(selectedCard)} />
      </div>

      <div className="flex flex-1 flex-col">
        <p className="font-primary-bold text-[24px] leading-none text-gray-300">교환 제시 내용</p>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="내용을 입력해 주세요"
          className="font-sans-400 mt-6 flex-1 resize-none rounded-xs border border-gray-200 bg-transparent p-4 text-sm text-white placeholder:text-gray-200 focus:border-purple focus:outline-none"
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="font-sans-600 h-12.5 w-30 rounded-xs border border-gray-200 text-sm text-white disabled:opacity-50"
          >
            뒤로
          </button>
          <button
            type="button"
            onClick={() => onSubmit(message)}
            disabled={isSubmitting}
            className="font-primary-bold h-12.5 w-40 rounded-xs bg-[#FFC146] text-sm text-black disabled:opacity-50"
          >
            교환 제시하기
          </button>
        </div>
      </div>
    </div>
  );
}
