"use client";

import Image from "next/image";
import { useState } from "react";

export default function TradeFilter({ options, selected, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (value) => {
    const toggle = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(toggle);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="font-sans-600 flex h-12.5 w-30 items-center gap-3 flex-start text-sm text-white"
      >
        카테고리
        <Image src="/down.png" alt="" width={16} height={16} />
      </button>

      {isOpen && (
        <ul className="absolute top-12.5 right-0 z-10 w-30 border border-gray-200 bg-gray-500 py-4 px-3.75 flex flex-col gap-3.75 rounded-xs">
          {options.map((option) => (
            <li key={option.value}>
              <label className="flex items-center justify-between">
                <span className="font-sans-400 text-sm text-white">{option.label}</span>
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
