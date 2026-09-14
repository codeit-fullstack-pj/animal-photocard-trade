import { ApiError } from "../lib/api-error.js";
import { createAuthClient } from "../lib/supabase.js";
import { countUnread } from "../repositories/notification.repository.js";
import { findUserByProviderUid } from "../repositories/user.repository.js";

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
  };
}
