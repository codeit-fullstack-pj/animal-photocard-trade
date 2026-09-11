"use client";

import { useState } from "react";
import Image from "next/image";

import Dropdown from "./Dropdown";

const CATEGORY_OPTIONS = [
  { value: "DOG", label: "강아지" },
  { value: "CAT", label: "고양이" },
];

const SORT_OPTIONS = [
  { value: "score_desc", label: "관상지수 높은 순" },
  { value: "score_asc", label: "관상지수 낮은 순" },
  { value: "created_desc", label: "최근 등록 순" },
  { value: "created_asc", label: "오래된 등록 순" },
];

export default function GalleryToolbar() {
  // TODO: 상위(카드 목록)로 끌어올려 필터·정렬에 연결
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [sort, setSort] = useState("score_desc");

  // 모바일: 검색 1줄 / 카테고리·정렬 2줄. tablet+ : 검색·카테고리 왼쪽 묶음, 정렬 우측(ml-auto)
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3 tablet:flex-nowrap tablet:justify-start">
      <div className="flex h-12.5 w-full shrink-0 items-center gap-2 rounded-xs border border-gray-200 bg-black px-4 tablet:w-50 pc:w-80">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="검색"
          className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-[#888]"
        />
        <Image src="/search.png" alt="검색" width={20} height={20} className="shrink-0" />
      </div>

      <div className="w-8.75 shrink-0 tablet:w-40 tablet:flex-none">
        <Dropdown
          multiple
          options={CATEGORY_OPTIONS}
          value={categories}
          onChange={setCategories}
          placeholder="카테고리"
          triggerImage="/dropdown.png"
          placeholderClassName="text-white"
        />
      </div>

      <div className="w-40 shrink-0 tablet:ml-auto tablet:w-52 tablet:flex-none">
        <Dropdown options={SORT_OPTIONS} value={sort} onChange={setSort} placeholder="정렬" />
      </div>
    </div>
  );
}
