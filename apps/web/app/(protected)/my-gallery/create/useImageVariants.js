"use client";

import { useEffect, useState } from "react";

import { drawHalftone } from "@/lib/image/halftone";

// 썸네일 순서 · 라벨 · 캔버스 필터 정의
export const VARIANTS = [
  { key: "original", label: "원본", filter: null },
  { key: "sepia", label: "세피아", filter: "sepia(0.7)" },
  { key: "mono", label: "모노", filter: "grayscale(1)" },
  { key: "dot", label: "도트", filter: "dot" },
];

// 튜닝 파라미터
const MAX_SIZE = 1024; // 변형본 긴 변 최대 px
const OUTPUT_TYPE = "image/png";

function drawVariant(img, filter) {
  const scale = Math.min(1, MAX_SIZE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  if (filter === "dot") {
    // 마이갤러리 카드에서 쓰는 것과 동일한 명암 기반 망점(halftone) — DotHalftoneImage.jsx 참고
    drawHalftone(ctx, img, w, h);
  } else {
    if (filter) ctx.filter = filter;
    ctx.drawImage(img, 0, 0, w, h);
  }

  return canvas;
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, OUTPUT_TYPE));
}

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
