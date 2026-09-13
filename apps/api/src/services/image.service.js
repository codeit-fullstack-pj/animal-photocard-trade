import { randomUUID } from "node:crypto";

import { ApiError } from "../lib/api-error.js";
import { SCORE_AXES } from "../lib/score-config.js";
import { createUserScopedClient } from "../lib/supabase.js";
import { createImage } from "../repositories/image.repository.js";

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "card-images";
const TOTAL_SCORE = 100;

// image/jpeg → jpg 처럼 확장자를 mimetype에서 결정한다 (원본 파일명은 신뢰하지 않음)
export const MIME_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function uploadImage({ uploaderId, authUid, accessToken, category, file }) {
  const imageUrl = await uploadToStorage({ accessToken, authUid, file });
  const score = { axes: generateScoreAxes(category) };
  const image = await createImage({ uploaderId, imageUrl, category, score });
  return toImageResponse(image);
}

// 저장 경로의 첫 폴더가 Storage RLS 정책의 auth.uid()와 비교된다 (Supabase Auth uid, 즉 User.providerUid).
// User.id(우리 앱 PK)를 쓰면 auth.uid()와 절대 일치하지 않아 정책이 항상 막는다
async function uploadToStorage({ accessToken, authUid, file }) {
  const supabase = createUserScopedClient(accessToken);
  const path = `${authUid}/${randomUUID()}.${MIME_EXTENSIONS[file.mimetype]}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file.buffer, { contentType: file.mimetype });
  if (error) {
    throw new ApiError(500, "IMAGE_UPLOAD_FAILED", "이미지 업로드에 실패했습니다");
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return publicUrl;
}

// 관상 지수: 4개 축에 100을 무작위로 나눠 담는다 (칸막이 방식 — 절단점을 무작위로 찍어 구간 길이를 값으로 삼음)
function generateScoreAxes(category) {
  const keys = SCORE_AXES[category];
  const cuts = randomDistinctInts(keys.length - 1, TOTAL_SCORE).sort((a, b) => a - b);
  const boundaries = [0, ...cuts, TOTAL_SCORE];

  return keys.map((field, i) => ({ field, value: boundaries[i + 1] - boundaries[i] }));
}

// 1 ~ max-1 범위에서 서로 다른 정수 count개를 뽑는다 (절단점이 겹치면 값이 0인 축이 생기므로 겹치지 않게 뽑음)
function randomDistinctInts(count, max) {
  const pool = Array.from({ length: max - 1 }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

function toImageResponse(image) {
  return {
    id: image.id,
    uploaderId: image.uploaderId,
    category: image.category,
    imageUrl: image.imageUrl,
    score: image.score,
    createdAt: image.createdAt,
  };
}
