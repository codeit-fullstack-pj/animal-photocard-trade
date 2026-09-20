import { ApiError } from "../lib/api-error.js";
import { prisma } from "../lib/prisma.js";
import { getUserChannelTopic } from "../lib/realtime.js";
import { createAuthClient } from "../lib/supabase.js";
import { countUnread } from "../repositories/notification.repository.js";
import {
  findUserByProviderUid,
  grantRandomPointIfAvailable,
} from "../repositories/user.repository.js";

// 랜덤 포인트별 누적 당첨 확률을 관리
const RANDOM_POINT_REWARDS = [
  { point: 10, max: 30 },
  { point: 20, max: 60 },
  { point: 30, max: 80 },
  { point: 50, max: 92 },
  { point: 100, max: 98 },
  { point: 300, max: 100 },
];

// 1부터 100 사이의 값을 이용해 확률에 맞는 랜덤 포인트를 반환
function getRandomPoint() {
  const randomNumber = Math.floor(Math.random() * 100) + 1;

  return RANDOM_POINT_REWARDS.find((reward) => randomNumber <= reward.max).point;
}

// 한국 시간 기준 오늘 시작 시각과 다음 추첨 가능 시각을 계산
function getKstDayBounds(now = new Date()) {
  const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
  const kstNow = new Date(now.getTime() + KST_OFFSET_MS);

  const todayStart = new Date(
    Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate()) - KST_OFFSET_MS,
  );

  const nextDrawAt = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  return {
    todayStart,
    nextDrawAt,
  };
}

// GET /users/me
export async function getCurrentUser(accessToken) {
  if (!accessToken) {
    throw new ApiError(401, "UNAUTHORIZED", "로그인이 필요합니다");
  }

  const supabase = createAuthClient();
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) {
    throw new ApiError(401, "UNAUTHORIZED", "로그인이 필요합니다");
  }

  const user = await findUserByProviderUid(data.user.id);
  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "로그인이 필요합니다");
  }

  const unreadCount = await countUnread(user.id);
  return {
    id: user.id,
    nickname: user.nickname,
    point: Number(user.point),
    lastDrawAt: user.lastDrawAt,
    unreadCount,
    createdAt: user.createdAt,
    // 다른 사용자로 인한 포인트·알림 변경을 실시간으로 받을 Realtime 채널명
    realtimeChannel: getUserChannelTopic(user.id),
  };
}

// 하루 한 번 랜덤 포인트를 지급하고 다음 추첨 가능 시각을 반환
export async function drawRandomPoint(user) {
  const drawnAt = new Date();
  const { todayStart, nextDrawAt } = getKstDayBounds(drawnAt);
  const earnedPoint = getRandomPoint();

  return prisma.$transaction(async (tx) => {
    const result = await grantRandomPointIfAvailable(tx, user.id, earnedPoint, todayStart, drawnAt);

    // 오늘 이미 포인트를 받았다면 중복 지급을 막음
    if (result.count === 0) {
      throw new ApiError(
        409,
        "RANDOM_POINT_ALREADY_DRAWN",
        "오늘의 랜덤 포인트를 이미 획득했습니다",
      );
    }

    return {
      earnedPoint,
      drawnAt,
      nextDrawAt,
    };
  });
}
