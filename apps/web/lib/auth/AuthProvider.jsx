"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api-client";
import { getCurrentUser, refreshAccessToken, signout } from "@/lib/auth/api";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(undefined);
  // 로그아웃 중엔 보호된 페이지의 RequireAuth가 /login으로 끼어들지 않도록(레이스) 잠깐 표시해둔다
  const isLoggingOutRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      try {
        const { user } = await getCurrentUser();
        if (!cancelled) setCurrentUser(user);
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) {
          if (!cancelled) setCurrentUser(null);
          return;
        }
        try {
          await refreshAccessToken();
          const { user } = await getCurrentUser();
          if (!cancelled) setCurrentUser(user);
        } catch {
          try {
            await signout();
          } catch {}
          if (!cancelled) setCurrentUser(null);
        }
      }
    }

    loadCurrentUser();
    return () => {
      cancelled = true;
    };
  }, []);

  async function logout() {
    isLoggingOutRef.current = true;
    try {
      await signout();
    } catch {}
    setCurrentUser(null);
    router.push("/");
    setTimeout(() => {
      isLoggingOutRef.current = false;
    }, 1000);
  }

  // signin()은 이 Provider 바깥(LoginForm)에서 직접 호출되므로, 성공 응답의 user를
  // 여기로 넘겨 context에 바로 반영한다 — 안 그러면 로그인 직후에도 헤더가 비로그인 상태로 남는다
  function login(user) {
    isLoggingOutRef.current = false;
    setCurrentUser(user);
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading: currentUser === undefined,
        isLoggingOutRef,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth는 AuthProvider 안에서만 쓸 수 있습니다");
  }
  return context;
}
