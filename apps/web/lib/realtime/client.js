import { createClient } from "@supabase/supabase-js";

// Realtime Broadcast 수신 전용 — DB 접근은 전부 API 서버(apps/api)를 거치므로
// 이 클라이언트로는 auth.signIn/테이블 조회 같은 건 하지 않는다
let client = null;

export function getRealtimeClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  client = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}
