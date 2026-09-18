"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api-client";
import { getCurrentUser, refreshAccessToken, signout } from "@/lib/auth/api";

export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState(undefined);

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
          // accessToken,refreshToken 모두 만료되었다면 로그아웃 상태로 둔다
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
    try {
      await signout();
    } catch {}
    setCurrentUser(null);
  }

  return { currentUser, isLoading: currentUser === undefined, logout };
}
