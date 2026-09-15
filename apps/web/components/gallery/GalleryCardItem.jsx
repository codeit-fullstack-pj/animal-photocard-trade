"use client";

import { useLayoutEffect, useRef, useState } from "react";

import PhotoCard from "./PhotoCard";

const CARD_WIDTH = 400; // PhotoCard 원본 폭(w-100). aspect-400/590 클래스와 짝이 맞아야 한다

/**
 * PhotoCard(400×590 고정)를 그리드 한 칸의 실제 폭에 맞춰 유동적으로 축소한다.
 * breakpoint별 고정 배율(0.40 / 0.82 / 1.00) 대신, 바깥 div가 그리드가 정해주는 폭을 그대로 받고
 * (aspect-ratio로 높이를 맞춤) ResizeObserver로 그 실제 폭을 측정해 배율을 계산한다.
 * → 화면 폭이 무엇이든 114번째 줄 grid의 gap만 고정 유지되고, 카드는 항상 셀을 정확히 채운다.
 * @param {{ card: object }} props
 */
export default function GalleryCardItem({ card }) {
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
    <div ref={wrapperRef} className="aspect-400/590 w-full overflow-hidden">
      <div className="origin-top-left" style={{ transform: `scale(${scale})` }}>
        <PhotoCard card={card} />
      </div>
    </div>
  );
}
