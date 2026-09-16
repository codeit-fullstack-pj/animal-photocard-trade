"use client";

import Image from "next/image";

export default function TradeSearchBar({ value, onChange }) {
  return (
    <label className="order-2 flex h-12 min-w-0 flex-1 items-center justify-between border border-gray-200 px-4 focus-within:border-purple rounded-xs tablet:order-0 tablet:h-12.5 tablet:w-80 tablet:flex-none">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="검색"
        className="font-sans-400 w-full bg-transparent text-sm text-white placeholder:text-gray-200 focus:outline-none"
      />
      <Image src="/search.png" alt="검색" width={20} height={20} />
    </label>
  );
}
