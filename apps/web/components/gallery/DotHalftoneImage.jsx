"use client";

import { useEffect, useRef } from "react";

import { drawHalftone } from "@/lib/image/halftone";

/**
 * 이미지를 명암 기반 망점(halftone)으로 그린다 — 신문 인쇄처럼 어두운 영역일수록 점이 커지고,
 * 밝은 영역일수록 점이 작아지거나 사라진다. CSS만으로는 픽셀 밝기를 읽을 수 없어서
 * canvas로 원본 이미지를 실제로 샘플링해 그린다.
 * @param {{ src: string, alt: string, width: number, height: number, className?: string }} props
 */
export default function DotHalftoneImage({ src, alt, width, height, className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !src) return;

    let cancelled = false;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));

    const ctx = canvas.getContext("2d");

    const img = new Image();
    // Supabase Storage 등 외부 출처 이미지의 픽셀을 canvas로 읽으려면 CORS 허용이 필요하다.
    // 허용 안 되어 있으면 아래 getImageData에서 에러가 나고, catch에서 원본 이미지로 대체한다
    img.crossOrigin = "anonymous";
    img.src = src;

    img
      .decode()
      .then(() => {
        if (!cancelled) drawHalftone(ctx, img, canvas.width, canvas.height);
      })
      .catch(() => {
        if (!cancelled) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      });

    return () => {
      cancelled = true;
    };
  }, [src, width, height]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={alt}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
