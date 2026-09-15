"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * 커스텀 드롭다운 (네이티브 select 대신 직접 구현).
 * - multiple=false: value는 string. 옵션 버튼을 고르면 트리거에 라벨이 표시되고 패널이 닫힌다.
 * - multiple=true : value는 string[]. 트리거는 항상 placeholder만 보여주고, 패널은 체크박스로
 *                   구성된다. 체크박스를 토글해도 패널은 열린 채 유지되며 바깥 클릭·Esc로 닫힌다.
 * - triggerImage : 지정 시 모바일에서는 트리거를 이 이미지 하나로 표시하고, tablet+ 에서는
 *                  기존 라벨+화살표 트리거를 쓴다.
 * @param {{
 *   options: { value: string, label: string }[],
 *   value: string | string[],
 *   onChange: (value: string | string[]) => void,
 *   placeholder?: string,
 *   multiple?: boolean,
 *   className?: string,
 *   placeholderClassName?: string,
 *   triggerImage?: string,
 *   optionCounts?: Record<string, number>, // 모바일 바텀시트에서 옵션 옆에 개수를 보여줄 때만 넘긴다
 * }} props
 */
export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = "선택",
  multiple = false,
  className = "",
  placeholderClassName = "text-[#888]",
  triggerImage,
  optionCounts,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const selectedValues = multiple ? (value ?? []) : value ? [value] : [];
  const isSelected = (v) => selectedValues.includes(v);
  const singleLabel = options.find((o) => o.value === value)?.label;

  // 모바일 바텀시트(카테고리, multiple) 전용 임시 선택 상태. 체크해도 바로 onChange를 부르지 않고,
  // "N개 포토카드 보기" 버튼을 눌러야 실제 필터에 반영된다. 시트를 열 때마다 현재 적용된 값으로 동기화.
  const [draftCategories, setDraftCategories] = useState(selectedValues);
  const isDraftSelected = (v) => draftCategories.includes(v);
  // 모바일 바텀시트 하단 "N개 포토카드 보기" 버튼에 표시할 개수.
  // 아무것도 체크 안 한 상태는 "전체 선택"과 동일하게 취급해 전체 개수를 보여준다 (실제로도 필터 없이 전체가 보임).
  const selectedCount =
    draftCategories.length === 0
      ? Object.values(optionCounts ?? {}).reduce((sum, c) => sum + (c ?? 0), 0)
      : draftCategories.reduce((sum, v) => sum + (optionCounts?.[v] ?? 0), 0);

  // 시트가 열리는 순간의 적용된 값으로 draft를 맞춘다 (렌더 중 조정 — React 권장 패턴)
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open && multiple) setDraftCategories(value ?? []);
  }

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function select(next) {
    if (multiple) {
      onChange?.(
        isSelected(next) ? selectedValues.filter((v) => v !== next) : [...selectedValues, next],
      );
      return;
    }
    onChange?.(next);
    setOpen(false);
  }

  function toggleDraft(v) {
    setDraftCategories((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  }

  // 보라색 "N개 포토카드 보기" 버튼: 그동안 체크해둔 draft를 실제로 반영하고 시트를 닫는다.
  function applyFilter() {
    if (multiple) onChange?.(draftCategories);
    setOpen(false);
  }

  // 초기화 버튼: 체크 상태와 실제 필터를 즉시 모두 비운다.
  function resetFilter() {
    if (multiple) {
      setDraftCategories([]);
      onChange?.([]);
    } else {
      onChange?.(null);
    }
  }

  // 모바일 바텀시트·태블릿 인라인 패널이 내용을 그대로 공유한다 (레이아웃만 다름)
  const optionsList = multiple ? (
    <div role="group" aria-label={placeholder}>
      {options.map((o) => (
        <label
          key={o.value}
          className="flex h-12 w-full cursor-pointer items-center justify-between gap-2.5 px-4 text-white hover:bg-white/10"
        >
          <span className="min-w-0 truncate">{o.label}</span>
          <input
            type="checkbox"
            checked={isSelected(o.value)}
            onChange={() => select(o.value)}
            className="size-4 shrink-0 accent-purple-button"
          />
        </label>
      ))}
    </div>
  ) : (
    <ul role="listbox">
      {options.map((o) => (
        <li key={o.value}>
          <button
            type="button"
            role="option"
            aria-selected={isSelected(o.value)}
            onClick={() => select(o.value)}
            className={`flex h-12 w-full items-center px-4 text-left hover:bg-white/10 ${
              isSelected(o.value) ? "bg-purple-button text-white" : "text-white"
            }`}
          >
            {o.label}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        aria-haspopup={multiple ? "true" : "listbox"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-xs border bg-black text-left ${
          triggerImage
            ? "size-8.75 justify-center border-white px-0 tablet:h-12 tablet:w-full tablet:justify-between tablet:border-0 tablet:px-4"
            : "h-12 w-full justify-between border-gray-200 px-4"
        } ${className}`}
      >
        {triggerImage && (
          <Image
            src={triggerImage}
            alt={placeholder}
            width={20}
            height={20}
            className="shrink-0 tablet:hidden"
          />
        )}
        <span
          className={`min-w-0 flex-1 truncate ${!multiple && singleLabel ? "text-white" : placeholderClassName} ${
            triggerImage ? "hidden tablet:block" : ""
          }`}
        >
          {multiple ? placeholder : (singleLabel ?? placeholder)}
        </span>
        <svg
          width="24"
          height="24"
          viewBox="0 0 28 28"
          fill="none"
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""} ${
            triggerImage ? "hidden tablet:block" : ""
          }`}
        >
          <path d="M14.2 16.2L10 12H18.4L14.2 16.2Z" fill="white" />
        </svg>
      </button>

      {open && (
        <>
          {/* 모바일 바텀시트는 카테고리(multiple)만 쓴다. 정렬은 모바일에서도 트리거 바로 아래에
              붙는 일반 드롭다운 리스트 형태를 그대로 유지한다 */}
          {multiple && (
            <div className="tablet:hidden">
              <div
                className="fixed inset-0 z-40 bg-black/60"
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />
              <div className="fixed inset-x-0 bottom-0 z-50 flex h-auto w-full flex-col overflow-hidden rounded-t-lg bg-[#1B1B1B]">
                <div className="relative flex h-13 w-full shrink-0 items-center justify-center px-4">
                  <span className="font-sans-700 text-white">필터</span>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="닫기"
                    className="absolute right-4 flex items-center"
                  >
                    <Image src="/close.png" alt="" width={24} height={24} />
                  </button>
                </div>
                <div className="flex h-auto w-full flex-col gap-7.5 pb-7.5">
                  <div className="flex h-auto w-full flex-col gap-2.5 overflow-y-auto">
                    <div className="flex h-13 w-full items-center justify-start px-4">
                      <div className="flex h-full w-21 items-center justify-center border-b border-white">
                        <span className="text-white">카테고리</span>
                      </div>
                    </div>
                    {options.map((o) => (
                      <div
                        key={o.value}
                        onClick={() => toggleDraft(o.value)}
                        className="flex h-13 w-full items-center justify-between px-8"
                      >
                        <span
                          className={isDraftSelected(o.value) ? "text-purple-button" : "text-white"}
                        >
                          {o.label}
                        </span>
                        {optionCounts && (
                          <span className="text-white">{optionCounts[o.value] ?? 0}개</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex h-13.75 w-full items-center gap-2.75 px-4">
                    <button
                      type="button"
                      onClick={resetFilter}
                      aria-label="초기화"
                      className="flex h-13.75 w-13.5 shrink-0 items-center justify-center"
                    >
                      <Image src="/refresh.png" alt="" width={24} height={24} />
                    </button>
                    <button
                      type="button"
                      onClick={applyFilter}
                      className="h-13.75 flex-1 rounded-xs bg-purple-button"
                    >
                      <span className="text-white">{selectedCount}개 포토카드 보기</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 카테고리(multiple): 태블릿 이상에서만 트리거 바로 아래에 붙는 패널.
              정렬(!multiple): 모바일 포함 모든 화면에서 트리거 바로 아래에 붙는 패널 */}
          <div
            className={`absolute top-full left-0 z-10 mt-1 w-full min-w-40 overflow-hidden rounded-xs border border-gray-200 bg-black tablet:min-w-0 ${
              multiple ? "hidden tablet:block" : "block"
            }`}
          >
            {optionsList}
          </div>
        </>
      )}
    </div>
  );
}
