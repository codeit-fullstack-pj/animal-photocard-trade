"use client";

import Image from "next/image";
import { useEffect } from "react";

const TABLET_BREAKPOINT = 744;

export default function OfferCategorySheet({
  isOpen,
  onClose,
  options,
  selected,
  onChange,
  optionCounts,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const mobileQuery = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`);

    function collapseIfNeeded() {
      if (mobileQuery.matches && selected.length > 1) {
        onChange([]);
      }
    }

    collapseIfNeeded();
    mobileQuery.addEventListener("change", collapseIfNeeded);
    return () => mobileQuery.removeEventListener("change", collapseIfNeeded);
  }, [isOpen, selected, onChange]);

  if (!isOpen) {
    return null;
  }

  const selectedValue = selected[0] ?? null;
  const totalCount = Object.values(optionCounts ?? {}).reduce((sum, count) => sum + (count ?? 0), 0);
  const displayCount = selectedValue ? (optionCounts?.[selectedValue] ?? 0) : totalCount;

  function handleSelect(value) {
    onChange(selectedValue === value ? [] : [value]);
  }

  function handleReset() {
    onChange([]);
  }

  return (
    <div className="tablet:hidden">
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} aria-hidden="true" />

      <div className="fixed inset-x-0 bottom-0 z-50 flex h-auto w-full flex-col overflow-hidden rounded-t-lg bg-[#1B1B1B]">
        <div className="relative flex h-13 w-full shrink-0 items-center justify-center px-4">
          <span className="font-sans-700 text-white">필터</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute right-4 flex items-center"
          >
            <Image src="/close.png" alt="" width={24} height={24} />
          </button>
        </div>

        <div className="flex h-auto w-full flex-col gap-7.5 pb-7.5">
          <div className="flex h-auto w-full flex-col gap-2.5 overflow-y-auto">
            <div className="flex h-13 w-full items-center justify-start px-4">
              <div className="flex h-full w-21 items-center justify-center border-b-[1.5px] border-white">
                <span className="text-sm text-white">카테고리</span>
              </div>
            </div>

            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className="flex h-13 w-full items-center justify-between px-8"
              >
                <span
                  className={`text-sm ${selectedValue === option.value ? "font-sans-700 text-purple-button" : "font-sans-400 text-gray-300"}`}
                >
                  {option.label}
                </span>
                <span
                  className={`text-sm ${selectedValue === option.value ? "font-sans-700 text-purple-button" : "font-sans-400 text-gray-300"}`}
                >
                  {optionCounts?.[option.value] ?? 0}개
                </span>
              </div>
            ))}
          </div>

          <div className="flex h-13.75 w-full items-center gap-2.75 px-4">
            <button
              type="button"
              onClick={handleReset}
              aria-label="초기화"
              className="flex h-13.75 w-13.5 shrink-0 items-center justify-center"
            >
              <Image src="/refresh.png" alt="" width={24} height={24} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="h-13.75 flex-1 rounded-xs bg-purple-button"
            >
              <span className="font-sans-700 text-white">{displayCount}개 포토카드 보기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
