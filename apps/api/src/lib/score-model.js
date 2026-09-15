import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-wasm";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// apps/api/src/lib -> apps/api/models
const MODELS_DIR = path.join(__dirname, "../../models");
const IMAGE_SIZE = 224; // models/{dog,cat}/metadata.json 의 imageSize
const PIXEL_MID = 127.5; // Teachable Machine 표준 전처리: (픽셀-127.5)/127.5 → [-1, 1]

let backendReady = null;
function ensureBackend() {
  if (!backendReady) {
    backendReady = tf.setBackend("wasm").then(() => tf.ready());
  }
  return backendReady;
}

// category(대문자 DOG/CAT) -> 로드된 모델 Promise. 서버 켜진 동안 한 번만 디스크에서 읽는다
const modelCache = new Map();

function getModel(category) {
  if (!modelCache.has(category)) {
    modelCache.set(category, loadModel(category));
  }
  return modelCache.get(category);
}

// tfjs-node 없이(순수 tfjs) Node에서 로컬 모델 파일을 읽어 메모리 IOHandler로 넘긴다
async function loadModel(category) {
  const dir = path.join(MODELS_DIR, category.toLowerCase());
  const modelJson = JSON.parse(await readFile(path.join(dir, "model.json"), "utf-8"));
  const manifest = modelJson.weightsManifest[0];

  const shardBuffers = await Promise.all(
    manifest.paths.map((shardPath) => readFile(path.join(dir, shardPath))),
  );
  const weightData = Buffer.concat(shardBuffers);

  return tf.loadLayersModel(
    tf.io.fromMemory({
      modelTopology: modelJson.modelTopology,
      weightSpecs: manifest.weights,
      weightData: weightData.buffer.slice(
        weightData.byteOffset,
        weightData.byteOffset + weightData.byteLength,
      ),
    }),
  );
}

// 이미지 버퍼 → 확률 배열([0,1], 합계 1에 가까움). 순서는 models/{category}/metadata.json 의 labels 순서
// (SCORE_AXES 순서와 이미 일치하도록 라벨을 맞춰둠)
export async function predictProbabilities(category, imageBuffer) {
  const [, model] = await Promise.all([ensureBackend(), getModel(category)]);

  // Teachable Machine 웹 위젯과 동일하게 중앙 정사각형 크롭 후 리사이즈 (원본 비율 왜곡 방지)
  const { data, info } = await sharp(imageBuffer)
    .resize(IMAGE_SIZE, IMAGE_SIZE, { fit: "cover", position: "center" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const probabilities = tf.tidy(() => {
    const pixels = tf.tensor3d(new Uint8Array(data), [info.height, info.width, info.channels]);
    const input = pixels.toFloat().sub(PIXEL_MID).div(PIXEL_MID).expandDims(0);
    return model.predict(input).dataSync();
  });

  return Array.from(probabilities);
}
