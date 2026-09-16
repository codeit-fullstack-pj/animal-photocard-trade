"use client";

import Image from "next/image";
import { useState } from "react";

import OfferCategorySheet from "./OfferCategorySheet";

export default function TradeFilter({ options, selected, onChange, optionCounts }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (value) => {
    const toggle = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(toggle);
  };

  return (
    <div className="relative order-1 shrink-0 tablet:order-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex size-12 items-center justify-center gap-2 rounded-xs border border-white bg-black tablet:h-12.5 tablet:w-30 tablet:justify-start tablet:gap-3 tablet:border-0 tablet:px-4"
      >
        <Image src="/filter.png" alt="필터" width={20} height={20} className="tablet:hidden" />
        <span className="font-sans-600 hidden text-base text-white tablet:block">카테고리</span>
        <Image src="/down.png" alt="" width={20} height={20} className="hidden tablet:block" />
      </button>

      <OfferCategorySheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        options={options}
        selected={selected}
        onChange={onChange}
        optionCounts={optionCounts}
      />

      {isOpen && (
        <ul className="absolute top-full right-0 z-10 mt-1 hidden w-30 border border-gray-200 bg-gray-500 py-4 px-3.75 flex-col gap-3.75 rounded-xs tablet:flex">
          {options.map((option) => (
            <li key={option.value}>
              <label className="flex items-center justify-between">
                <span className="font-sans-400 text-base text-white">{option.label}</span>
                <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selected.includes(option.value)}
                    onChange={() => handleToggle(option.value)}
                    className="size-4 appearance-none border border-[#D9D9D9] bg-white"
                  />
                  {selected.includes(option.value) && (
                    <Image
                      src="/filter_checked.png"
                      alt=""
                      width={10}
                      height={10}
                      className="pointer-events-none absolute inset-0 m-auto"
                    />
                  )}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
