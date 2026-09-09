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
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const selectedValues = multiple ? (value ?? []) : value ? [value] : [];
  const isSelected = (v) => selectedValues.includes(v);
  const singleLabel = options.find((o) => o.value === value)?.label;

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

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        aria-haspopup={multiple ? "true" : "listbox"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-xs border bg-[#0F0F0F] text-left ${
          triggerImage
            ? "size-8.75 justify-center border-white px-0 tablet:h-12 tablet:w-full tablet:justify-between tablet:border-0 tablet:px-4"
            : "h-12 w-full justify-between border-[#DDD] px-4"
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

      {open && multiple && (
        <div
          role="group"
          aria-label={placeholder}
          className="absolute top-full left-0 z-10 mt-1 w-full min-w-40 overflow-hidden rounded-xs border border-[#DDD] bg-[#0F0F0F] tablet:min-w-0"
        >
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
                className="size-4 shrink-0 accent-[#A656F5]"
              />
            </label>
          ))}
        </div>
      )}

      {open && !multiple && (
        <ul
          role="listbox"
          className="absolute top-full left-0 z-10 mt-1 w-full overflow-hidden rounded-xs border border-[#DDD] bg-[#0F0F0F]"
        >
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                aria-selected={isSelected(o.value)}
                onClick={() => select(o.value)}
                className={`flex h-12 w-full items-center px-4 text-left hover:bg-white/10 ${
                  isSelected(o.value) ? "bg-[#A656F5] text-white" : "text-white"
                }`}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
