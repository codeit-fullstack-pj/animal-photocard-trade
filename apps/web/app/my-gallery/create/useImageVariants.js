"use client";

import { useEffect, useState } from "react";

// 썸네일 순서 · 라벨 · 캔버스 필터 정의
export const VARIANTS = [
  { key: "original", label: "원본", filter: null },
  { key: "sepia", label: "세이아", filter: "sepia(0.7)" },
  { key: "mono", label: "모노", filter: "grayscale(1)" },
  { key: "dot", label: "도트", filter: "dot" },
];

// 튜닝 파라미터
const MAX_SIZE = 1024; // 변형본 긴 변 최대 px
const DOT_BLOCKS = 72; // 도트: 긴 변 분할 칸 수
const OUTPUT_TYPE = "image/png";

function drawVariant(img, filter) {
  const scale = Math.min(
    1,
    MAX_SIZE / Math.max(img.naturalWidth, img.naturalHeight),
  );
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  if (filter === "dot") {
    const block = Math.max(2, Math.round(Math.max(w, h) / DOT_BLOCKS));
    const sw = Math.max(1, Math.round(w / block));
    const sh = Math.max(1, Math.round(h / block));
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, sw, sh);
    ctx.drawImage(canvas, 0, 0, sw, sh, 0, 0, w, h);
  } else {
    if (filter) ctx.filter = filter;
    ctx.drawImage(img, 0, 0, w, h);
  }

  return canvas;
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, OUTPUT_TYPE));
}

/**
 * 업로드된 File을 받아 원본 + 필터 3종의 캔버스 변형본을 만든다.
 * 각 변형본은 { blob, url } — url은 미리보기용 blob URL, blob은 업로드용.
 */
export function useImageVariants(file) {
  const [variants, setVariants] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const createdUrls = [];

    async function generate() {
      if (!file) {
        if (!cancelled) setVariants(null);
        return;
      }

      const srcUrl = URL.createObjectURL(file);
      createdUrls.push(srcUrl);

      const img = new Image();
      img.src = srcUrl;

      try {
        await img.decode();

        const entries = await Promise.all(
          VARIANTS.map(async ({ key, filter }) => {
            const blob = await canvasToBlob(drawVariant(img, filter));
            const url = URL.createObjectURL(blob);
            createdUrls.push(url);
            return [key, { blob, url }];
          }),
        );

        if (!cancelled) setVariants(Object.fromEntries(entries));
      } catch {
        if (!cancelled) setVariants(null);
      }
    }

    generate();

    return () => {
      cancelled = true;
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [file]);

  return { variants };
}
