"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import RandomPointLauncher from "@/components/point/RandomPointLauncher";

import { getKstDateKey, isDrawnTodayInKst } from "@/lib/point/random-point-time";
import { useAuth } from "@/lib/auth/AuthProvider";

// 랜덤 포인트 선물상자를 표시하지 않을 페이지
const EXCLUDED_PATHS = ["/", "/login", "/signup"];

// 당일 최초 자동 오픈 여부를 localStorage 기준으로 결정.
// hasDrawnToday를 이 컴포넌트 안에서 반영해야 한다 — 뽑기 성공으로 전역 currentUser가
// 갱신돼 hasDrawnToday가 바뀌어도 이 위치의 컴포넌트 타입 자체는 항상 그대로 유지되게 해서,
// React가 기존 RandomPointLauncher 인스턴스(열려 있던 모달·방금 뽑은 결과)를 리마운트로
// 날려버리지 않게 한다 (예전엔 hasDrawnToday로 아예 다른 컴포넌트를 렌더링해서 이 문제가 있었음)
function RandomPointAutoOpenLayer({ storageKey, hasDrawnToday }) {
  // 오늘 이미 자동 모달을 보여줬는지, 혹은 이미 뽑았는지 최초 마운트 시 한 번만 확인
  const [shouldAutoOpen] = useState(() => {
    if (hasDrawnToday || typeof window === "undefined") {
      return false;
    }

    return localStorage.getItem(storageKey) !== "true";
  });

  // 실제 자동 오픈 대상이면 오늘 노출한 것으로 기록
  useEffect(() => {
    if (!shouldAutoOpen) return;

    localStorage.setItem(storageKey, "true");
  }, [shouldAutoOpen, storageKey]);

  return <RandomPointLauncher autoOpen={shouldAutoOpen} />;
}

// 로그인 사용자에게만 랜덤 포인트 UI를 표시한다.
function RandomPointAuthenticatedLayer() {
  const { currentUser, isLoading } = useAuth();

  // 인증 확인 중이거나 비로그인 상태라면 선물상자를 표시하지 않음
  if (isLoading || !currentUser?.id) {
    return null;
  }

  // 현재 한국 날짜를 사용자별 자동 모달 노출 기록에 사용 (날짜 계산 실패 시 폴백 키 사용)
  const today = getKstDateKey(new Date());
  const storageKey = `randomPointAutoOpened_${currentUser.id}_${today ?? "unknown"}`;

  return (
    <RandomPointAutoOpenLayer
      key={storageKey}
      storageKey={storageKey}
      hasDrawnToday={isDrawnTodayInKst(currentUser.lastDrawAt)}
    />
  );
}

export default function RandomPointGlobalLayer() {
  const pathname = usePathname();

  // 랜딩, 로그인, 회원가입 페이지에서는
  // 사용자 조회와 랜덤 포인트 UI 자체를 실행하지 않음
  if (EXCLUDED_PATHS.includes(pathname)) {
    return null;
  }

  // 로그인 서비스 페이지에 진입한 뒤 현재 사용자 정보를 새로 조회
  return <RandomPointAuthenticatedLayer />;
}
