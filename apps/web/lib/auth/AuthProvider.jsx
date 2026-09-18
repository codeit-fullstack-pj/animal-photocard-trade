"use client";

import { ApiError } from "@/lib/api-client";
import { getCurrentUser, refreshAccessToken, signout } from "@/lib/auth/api";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(undefined);

  //유저정보 조회 함수 (useCallback : 렌더링마다 새 함수생성되지 않도록 함)
  //-> 사용자 조회 결과만 반환하고 여기서는 React 상태를 직접 변경하지 않는다.
  const resolveCurrentUser = useCallback(async () => {
    try {
      const { user } = await getCurrentUser();
      return user;
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        return null;
      }
      //401
      try {
        await refreshAccessToken();
        const { user } = await getCurrentUser();
        return user;
      } catch {
        //refeshToken만료-재발급요청실패
        await signout().catch(() => {});
        return null;
      }
    }
  }, []);

  //첫 렌더링 (resolveCurrentUser 변경될 때만 effect재실행)
  useEffect(() => {
    let ignore = false;

    async function initializeAuth() {
      const user = await resolveCurrentUser();
      if (!ignore) {
        setCurrentUser(user);
      }
    }
    void initializeAuth();
    return () => {
      ignore = true;
    };
  }, [resolveCurrentUser]);

  //재요청방지를 위한 user 저장
  const login = useCallback((user) => {
    setCurrentUser(user);
  }, []);

  //포인트나 알림 수가 바뀌었을 때
  const reloadCurrentUser = useCallback(async () => {
    const user = await resolveCurrentUser();
    setCurrentUser(user);
    return user;
  }, [resolveCurrentUser]);

  //앱전체 로그아웃 함수
  const logout = useCallback(async () => {
    try {
      await signout();
    } finally {
      setCurrentUser(null);
    }
  }, []);

  //context생성
  const value = useMemo(
    () => ({
      currentUser,
      isLoading: currentUser === undefined,
      login,
      logout,
      reloadCurrentUser,
    }),
    [currentUser, login, logout, reloadCurrentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

//포장
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 내부에서 사용해야 합니다.");
  }
  return context;
}
