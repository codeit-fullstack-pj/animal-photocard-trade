import { createClient } from "@supabase/supabase-js";

export function createAuthClient() {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("SUPABASE_URL, SUPABASE_ANON_KEY 환경 변수가 필요합니다 (.env.example 참고)");
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
