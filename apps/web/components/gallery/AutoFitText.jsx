"use client";

import { useEffect, useRef } from "react";

/**
 * 자식 텍스트가 요소 너비를 넘으면 폰트 크기를 자동으로 줄여 한 줄에 맞춘다.
 * 너비는 className(예: w-full, w-20)으로 바깥에서 정하고, 넘칠 때만 축소한다.
 * @param {{
 *   as?: keyof JSX.IntrinsicElements,
 *   className?: string,
 *   minFontSize?: number,
 *   children: import("react").ReactNode,
 * }} props
 */
export default function AutoFitText({
  as: Tag = "span",
  className = "",
  minFontSize = 9,
  children,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function fit() {
      el.style.fontSize = "";
      let size = parseFloat(getComputedStyle(el).fontSize);
      while (el.scrollWidth > el.clientWidth && size > minFontSize) {
        size -= 0.5;
        el.style.fontSize = `${size}px`;
      }
    }

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children, minFontSize]);

  return (
    <Tag ref={ref} className={`overflow-hidden text-ellipsis whitespace-nowrap ${className}`}>
      {children}
    </Tag>
  );
}
