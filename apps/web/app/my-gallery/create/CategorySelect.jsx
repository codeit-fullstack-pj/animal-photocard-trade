"use client";

import { useEffect, useRef, useState } from "react";

const OPTIONS = [
  { value: "cat", label: "고양이" },
  { value: "dog", label: "강아지" },
];

export default function CategorySelect({
  name = "category",
  placeholder = "종류를 선택해 주세요",
  value: valueProp,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState("");
  const rootRef = useRef(null);

  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : internalValue;
  const selected = OPTIONS.find((o) => o.value === value);

  function selectValue(next) {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
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

  return (
    <div ref={rootRef} className="relative w-full">
      <input type="hidden" name={name} value={value} />

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-15 w-full items-center justify-between rounded-xs border border-[#DDD] bg-[#0F0F0F] px-5 py-4.5 text-left"
      >
        <span className={selected ? "text-white" : "text-[#888]"}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M14.2 16.2L10 12H18.4L14.2 16.2Z" fill="white" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute top-full left-0 z-10 mt-1 w-full overflow-hidden rounded-xs border border-[#DDD] bg-[#0F0F0F]"
        >
          {OPTIONS.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                onClick={() => selectValue(o.value)}
                className="flex h-15 w-full items-center px-5 text-left text-white hover:bg-white/10"
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
