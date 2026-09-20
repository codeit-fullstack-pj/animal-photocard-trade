import { createHmac } from "node:crypto";

// 사용자별 Realtime 채널명을 서버만 아는 시크릿으로 만든다.
// User.id/providerUid는 카드 이미지 URL 등으로 이미 남에게 노출될 수 있어서,
// 그런 값과 무관한(추측 불가능한) 채널명을 쓰기 위함 — public 채널을 그대로 써도 안전하다
function getChannelSecret() {
  const secret = process.env.REALTIME_CHANNEL_SECRET;
  if (!secret) {
    throw new Error("REALTIME_CHANNEL_SECRET 환경 변수가 필요합니다 (.env.example 참고)");
  }
  return secret;
}

export function getUserChannelTopic(userId) {
  return `user-${createHmac("sha256", getChannelSecret()).update(userId).digest("hex")}`;
}

// "다른 사용자로 인한 내 상태(포인트·알림) 변경"이 생겼을 때 프론트에 알려서 다시 불러오게 한다.
// Supabase Realtime REST Broadcast API를 쓰므로 서버가 소켓을 계속 들고 있을 필요가 없다.
// 방송 실패가 알림 생성 등 핵심 로직을 막으면 안 되므로 여기서 에러를 삼킨다
export async function broadcastUserChanged(userId) {
  try {
    const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
    const topic = getUserChannelTopic(userId);

    const res = await fetch(`${SUPABASE_URL}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: [{ topic, event: "changed", payload: {} }] }),
    });
    if (!res.ok) throw new Error(`broadcast 요청 실패: ${res.status}`);
  } catch (error) {
    console.error("[realtime] broadcastUserChanged 실패", error);
  }
}
