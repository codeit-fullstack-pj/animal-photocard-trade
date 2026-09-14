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
