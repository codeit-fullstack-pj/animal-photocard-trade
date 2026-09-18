"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import RandomPointLauncher from "@/components/point/RandomPointLauncher";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getKstDateKey, isDrawnTodayInKst } from "@/lib/point/random-point-time";

// 랜덤 포인트 선물상자를 표시하지 않을 페이지
const EXCLUDED_PATHS = ["/", "/login", "/signup"];

// 당일 최초 자동 오픈 여부를 localStorage 기준으로 결정
function RandomPointAutoOpenLayer({ storageKey }) {
  // 오늘 이미 자동 모달을 보여줬는지 최초 마운트 시 한 번만 확인
  const [shouldAutoOpen] = useState(() => {
    if (typeof window === "undefined") {
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

export default function RandomPointGlobalLayer() {
  const pathname = usePathname();
  const { currentUser, isLoading } = useAuth();

  // 랜딩, 로그인, 회원가입 페이지인지 확인
  const isExcludedPath = EXCLUDED_PATHS.includes(pathname);

  // 인증 확인 중 / 비로그인 / 제외 페이지에서는 선물상자를 표시하지 않음
  if (isLoading || !currentUser?.id || isExcludedPath) {
    return null;
  }

  // 오늘 이미 랜덤 포인트를 뽑았다면 자동 모달은 띄우지 않고
  // 선물상자만 표시해서 재진입 시 대기 모달을 확인할 수 있게 함
  if (isDrawnTodayInKst(currentUser.lastDrawAt)) {
    return <RandomPointLauncher />;
  }

  // 현재 한국 날짜를 사용자별 자동 모달 노출 기록에 사용
  const today = getKstDateKey(new Date());

  // 날짜 계산에 실패해도 선물상자 자체는 정상적으로 표시
  if (!today) {
    return <RandomPointLauncher />;
  }

  // 사용자별 + KST 날짜별로 자동 모달 노출 여부를 구분
  const storageKey = `randomPointAutoOpened_${currentUser.id}_${today}`;

  return <RandomPointAutoOpenLayer key={storageKey} storageKey={storageKey} />;
}
