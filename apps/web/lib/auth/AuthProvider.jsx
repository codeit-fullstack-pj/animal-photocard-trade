"use client";

import { ApiError } from "@/lib/api-client";
import { getCurrentUser, refreshAccessToken, signout } from "@/lib/auth/api";
import { getRealtimeClient } from "@/lib/realtime/client";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(undefined);
  const initialAuthPromiseRef = useRef(null);
  const isLoggingOutRef = useRef(false);

  useEffect(() => {
    if (pathname === "/market") isLoggingOutRef.current = false;
  }, [pathname]);

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
    //오래된 유저응답을 덮어쓰지 않기 위함
    let ignore = false;

    if (!initialAuthPromiseRef.current) {
      initialAuthPromiseRef.current = resolveCurrentUser();
    }

    initialAuthPromiseRef.current.then((user) => {
      if (!ignore) setCurrentUser(user);
    });

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

  // 다른 사용자의 행동(구매·교환 제시 등)으로 내 포인트·알림이 바뀌는 경우를 실시간으로 반영한다.
  // 서버가 /users/me로 내려주는 realtimeChannel(추측 불가능한 채널명)을 구독해서,
  // "바뀌었다"는 신호만 받으면 현재 사용자 정보를 다시 불러온다 (값 자체는 서버 응답을 신뢰)
  useEffect(() => {
    const channelTopic = currentUser?.realtimeChannel;
    if (!channelTopic) return;

    const supabase = getRealtimeClient();
    if (!supabase) return;

    const channel = supabase
      .channel(channelTopic)
      .on("broadcast", { event: "changed" }, () => {
        reloadCurrentUser();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.realtimeChannel, reloadCurrentUser]);

  //앱전체 로그아웃 함수
  const logout = useCallback(async () => {
    // 보호 페이지의 비로그인 게이트가 로그아웃 이동을 /login으로 바꾸지 않도록 한다.
    isLoggingOutRef.current = pathname !== "/market";
    try {
      await signout();
    } finally {
      setCurrentUser(null);
      router.replace("/market");
    }
  }, [pathname, router]);

  //context생성
  const value = useMemo(
    () => ({
      currentUser,
      isLoading: currentUser === undefined,
      isLoggingOutRef,
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
