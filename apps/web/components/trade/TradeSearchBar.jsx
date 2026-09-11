"use client";

import Image from "next/image";

export default function TradeSearchBar({ value, onChange }) {
  return (
    <label className="flex h-12.5 w-80 items-center justify-between border border-gray-200 px-4 focus-within:border-purple rounded-xs">
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
