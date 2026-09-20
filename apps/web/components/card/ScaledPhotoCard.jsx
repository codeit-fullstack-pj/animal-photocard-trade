"use client";

import { useLayoutEffect, useRef, useState } from "react";

import PhotoCard from "./PhotoCard";

const CARD_WIDTH = 400; // PhotoCard 원본 폭(w-100). aspect-*/* 클래스와 짝이 맞아야 한다

/**
 * PhotoCard(400px 고정 폭)를 그리드 한 칸의 실제 폭에 맞춰 유동적으로 축소/확대한다.
 * 바깥 div가 그리드가 정해주는 폭을 그대로 받고(aspect-ratio로 높이를 맞춤),
 * ResizeObserver로 그 실제 폭을 측정해 배율을 계산한다.
 * @param {object} props PhotoCard에 그대로 전달되는 props
 */
export default function ScaledPhotoCard(props) {
  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / CARD_WIDTH);
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`w-full overflow-hidden ${
        props.variant === "owned" ? "aspect-400/586" : "aspect-400/550"
      }`}
    >
      <div className="origin-top-left" style={{ transform: `scale(${scale})` }}>
        <PhotoCard {...props} />
      </div>
    </div>
  );
}
