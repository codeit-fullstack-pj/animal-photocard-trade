"use client";

import Image from "next/image";

export default function ConfirmModal({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel,
  onConfirm,
  isSubmitting,
  secondaryLabel,
  onSecondary,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="relative flex w-full max-w-90 flex-col items-center gap-4 rounded-[20px] bg-gray-500 p-8 text-center tablet:max-w-105 tablet:gap-5 tablet:p-10 pc:max-w-115">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 disabled:opacity-50"
        >
          <Image src="/close.png" alt="닫기" width={20} height={20} />
        </button>

        <h2 className="font-sans-700 text-lg text-white tablet:text-xl">{title}</h2>
        <p className="font-sans-400 whitespace-pre-line text-sm text-gray-200 tablet:text-base">
          {description}
        </p>

        {secondaryLabel ? (
          <div className="mt-2 flex w-full gap-3">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="font-sans-600 h-12.5 flex-1 rounded-xs bg-purple-button text-sm text-black disabled:opacity-50 tablet:h-14 tablet:text-base"
            >
              {confirmLabel}
            </button>
            <button
              type="button"
              onClick={onSecondary ?? onClose}
              disabled={isSubmitting}
              className="font-sans-600 h-12.5 flex-1 rounded-xs border border-white bg-transparent text-sm text-white disabled:opacity-50 tablet:h-14 tablet:text-base"
            >
              {secondaryLabel}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="font-sans-600 mt-2 h-12.5 w-full rounded-xs bg-purple-button text-sm text-black disabled:opacity-50 tablet:h-14 tablet:text-base"
          >
            {confirmLabel}
          </button>
        )}
      </div>
    </div>
  );
}
