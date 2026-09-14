// 이미지를 명암 기반 망점(halftone)으로 그리는 공용 로직.
// 어두운 영역일수록 점이 커지고, 밝은 영역일수록 점이 작아지거나 사라진다 (신문 인쇄 하프톤 방식).
// DotHalftoneImage(마이갤러리 카드 표시)와 useImageVariants(생성 페이지 필터 미리보기) 둘 다 쓴다.

const DEFAULT_COLS = 140; // 가로 방향 점 칸 수 — 클수록 점이 촘촘해진다
const DEFAULT_MAX_RADIUS_RATIO = 0.55; // 한 칸 크기 대비 점 최대 반지름 비율
const DEFAULT_MIN_VISIBLE_RADIUS = 0.4; // 이보다 작은 반지름은 아예 생략(거의 흰 영역)

/**
 * ctx(outW × outH 크기의 2d context)에 img를 망점으로 그린다.
 * @param {CanvasRenderingContext2D} ctx
 * @param {CanvasImageSource} img
 * @param {number} outW
 * @param {number} outH
 * @param {{ cols?: number, maxRadiusRatio?: number, minVisibleRadius?: number }} [options]
 */
export function drawHalftone(ctx, img, outW, outH, options = {}) {
  const {
    cols = DEFAULT_COLS,
    maxRadiusRatio = DEFAULT_MAX_RADIUS_RATIO,
    minVisibleRadius = DEFAULT_MIN_VISIBLE_RADIUS,
  } = options;
  const rows = Math.max(1, Math.round((cols * outH) / outW));

  // 작은 캔버스로 이미지를 축소해서 그리면, 브라우저의 축소 리샘플링이 그대로 칸별 평균 색이 된다
  const sample = document.createElement("canvas");
  sample.width = cols;
  sample.height = rows;
  const sampleCtx = sample.getContext("2d");
  sampleCtx.drawImage(img, 0, 0, cols, rows);

  let pixels;
  try {
    pixels = sampleCtx.getImageData(0, 0, cols, rows).data;
  } catch {
    // 다른 출처 이미지에 CORS 헤더가 없으면 픽셀을 못 읽는다 — 원본이라도 보여준다
    ctx.drawImage(img, 0, 0, outW, outH);
    return;
  }

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, outW, outH);
  ctx.fillStyle = "#000";

  const cellW = outW / cols;
  const cellH = outH / rows;
  const maxRadius = Math.min(cellW, cellH) * maxRadiusRatio;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      const luminance = (0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]) / 255; // 0(검정)~1(흰색)
      const radius = maxRadius * (1 - luminance);
      if (radius < minVisibleRadius) continue;

      ctx.beginPath();
      ctx.arc((x + 0.5) * cellW, (y + 0.5) * cellH, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
