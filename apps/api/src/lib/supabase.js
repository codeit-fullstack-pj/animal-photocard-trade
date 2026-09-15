import { createClient } from "@supabase/supabase-js";

function getEnv() {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("SUPABASE_URL, SUPABASE_ANON_KEY 환경 변수가 필요합니다 (.env.example 참고)");
  }
  return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
}

export function createAuthClient() {
  const { url, anonKey } = getEnv();
  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// 요청을 보낸 사용자 권한으로 동작하는 클라이언트. Storage 업로드처럼 RLS가 "본인 것만" 허용하는 작업에 쓴다
export function createUserScopedClient(accessToken) {
  const { url, anonKey } = getEnv();
  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

export const OAUTH_VERIFIER_KEY = "oauth-code-verifier";

export function createOAuthClient(store = new Map()) {
  const { url, anonKey } = getEnv();
  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: "pkce",
      storageKey: "oauth",
      storage: {
        getItem: (key) => store.get(key) ?? null,
        setItem: (key, value) => store.set(key, value),
        removeItem: (key) => store.delete(key),
      },
    },
  });
}
