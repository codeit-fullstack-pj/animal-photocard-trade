"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api-client";
import { getCurrentUser, refreshAccessToken } from "@/lib/auth/api";
import {
  getRemainingTimeToNextKstMidnight,
  isDrawnTodayInKst,
} from "@/lib/point/random-point-time";
import { drawRandomPoint } from "@/lib/user/api";

export default function RandomPointModal({ isOpen, onClose, onDrawSuccess, previewState = null }) {
  // 모달을 열 때 다시 조회한 최신 사용자 정보를 관리
  const [currentUser, setCurrentUser] = useState(undefined);

  // 사용자가 선택한 선물 상자 번호를 관리
  const [selectedBox, setSelectedBox] = useState(null);

  // 랜덤 포인트 추첨 요청 상태를 관리
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 랜덤 포인트 추첨 중 발생한 오류 메시지를 관리
  const [errorMessage, setErrorMessage] = useState("");

  // 다음 랜덤 포인트 기회까지 남은 시간을 관리
  const [remainingTime, setRemainingTime] = useState({
    hours: 0,
    minutes: 0,
  });

  // 마지막 추첨 시간이 한국 시간 기준 오늘인지 확인
  const hasDrawnToday = isDrawnTodayInKst(currentUser?.lastDrawAt);

  // 현재 사용자 정보를 조회 중인지 확인
  const isUserLoading = currentUser === undefined;

  // 오늘 이미 추첨한 사용자의 대기 상태를 확인
  const isWaitingView = previewState === "waiting" || (!isUserLoading && hasDrawnToday);

  // 랜덤 포인트 모달을 열 때 현재 사용자 정보를 최신 상태로 다시 조회
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    async function loadCurrentUser() {
      try {
        const { user } = await getCurrentUser();

        if (!cancelled) {
          setCurrentUser(user);
        }
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) {
          if (!cancelled) {
            setCurrentUser(null);
          }
          return;
        }

        try {
          await refreshAccessToken();
          const { user } = await getCurrentUser();

          if (!cancelled) {
            setCurrentUser(user);
          }
        } catch {
          if (!cancelled) {
            setCurrentUser(null);
          }
        }
      }
    }

    loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // 오늘 이미 추첨했다면 다음 KST 자정까지 남은 시간을 갱신
  useEffect(() => {
    if (!isOpen || !isWaitingView) return;

    function updateRemainingTime() {
      setRemainingTime(getRemainingTimeToNextKstMidnight());
    }

    updateRemainingTime();

    const intervalId = window.setInterval(updateRemainingTime, 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isOpen, isWaitingView]);

  // 모달을 닫을 때 랜덤 포인트 관련 상태를 초기화
  function handleClose() {
    setCurrentUser(undefined);
    setSelectedBox(null);
    setIsSubmitting(false);
    setErrorMessage("");

    onClose();
  }

  async function handleDrawRandomPoint() {
    if (!currentUser || hasDrawnToday || selectedBox === null || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const result = await drawRandomPoint();

      // 추첨 결과를 부모 컴포넌트에 전달해 결과 모달로 전환
      onDrawSuccess?.(result);
    } catch (error) {
      // 공통 API 에러의 종류에 따라 사용자에게 보여줄 메시지를 설정
      if (error instanceof ApiError) {
        if (error.code === "RANDOM_POINT_ALREADY_DRAWN") {
          try {
            // 서버에서 이미 추첨했다고 판단하면 최신 사용자 정보를 다시 조회
            const { user } = await getCurrentUser();
            setCurrentUser(user);
            setSelectedBox(null);
          } catch {
            setErrorMessage("현재 랜덤 포인트 상태를 확인할 수 없습니다.");
          }

          return;
        }

        if (error.code === "NETWORK_ERROR") {
          setErrorMessage(error.message);
          return;
        }

        setErrorMessage(error.message);
        return;
      }

      setErrorMessage("랜덤 포인트 추첨 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // 모달이 닫힌 상태라면 화면에 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="relative h-[466px] w-[343px] bg-gray-500 tablet:h-[538px] tablet:w-[600px] pc:h-[765px] pc:w-[1034px]">
        {/* 랜덤 포인트 모달을 닫음 */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-[21px] right-[21px] pc:top-[37px] pc:right-[37px]"
          aria-label="랜덤 포인트 모달 닫기"
        >
          <Image src="/close.png" alt="" width={18} height={18} className="h-[18px] w-[18px]" />
        </button>

        <div className="flex flex-col items-center pt-[62px] text-center pc:pt-[82px]">
          <h2 className="[font-family:var(--font-baskin-robbins)] text-[30px] leading-[1.3] font-bold tablet:text-[36px] pc:-translate-y-[8px] pc:text-[46px]">
            <span className="text-white">랜덤</span>
            <span className="text-purple-button">포인트</span>
          </h2>

          <div className="font-sans-400 mt-[32px] flex flex-col gap-[4px] text-[16px] text-white pc:-translate-y-[19px] pc:gap-0 pc:mt-[44px] pc:text-[20px]">
            <p>매일마다 돌아오는 기회!</p>
            <p>랜덤 상자 뽑기를 통해 포인트를 획득하세요!</p>
          </div>

          {/* 오늘 이미 포인트를 획득했다면 설명과 선물상자 사이에 남은 시간을 표시 */}
          {isWaitingView && (
            <div className="mt-6 flex flex-col items-center text-white tablet:mt-8 pc:mt-[50px]">
              <p className="font-sans-400 text-[16px] pc:text-[20px]">다음 기회까지 남은 시간</p>

              <p className="font-sans-600 mt-[8px] text-[28px] pc:mt-[12px] pc:text-[40px]">
                {remainingTime.hours}시간 {remainingTime.minutes}분
              </p>
            </div>
          )}

          {/* 랜덤 포인트를 선택할 선물 상자 3개를 표시 */}
          <div
            className={`flex w-[315px] items-end justify-center gap-[8px] tablet:w-[530px] tablet:gap-[17px] pc:w-[837px] pc:gap-[46px] ${
              isWaitingView ? "mt-5 tablet:mt-7 pc:mt-[45px]" : "mt-8 tablet:mt-10 pc:mt-[120px]"
            }`}
          >
            <button
              type="button"
              onClick={() => setSelectedBox(1)}
              disabled={isWaitingView}
              aria-pressed={selectedBox === 1}
              className={`flex-1 transition-opacity disabled:cursor-not-allowed ${
                selectedBox !== null && selectedBox !== 1 ? "opacity-30" : "opacity-100"
              }`}
            >
              <Image
                src="/landing/box-1.png"
                alt="첫 번째 선물 상자"
                width={492}
                height={382}
                className="h-auto w-full"
              />
            </button>

            <button
              type="button"
              onClick={() => setSelectedBox(2)}
              disabled={isWaitingView}
              aria-pressed={selectedBox === 2}
              className={`flex-1 transition-opacity disabled:cursor-not-allowed ${
                selectedBox !== null && selectedBox !== 2 ? "opacity-30" : "opacity-100"
              }`}
            >
              <Image
                src="/landing/box-2.png"
                alt="두 번째 선물 상자"
                width={492}
                height={382}
                className="mx-auto h-auto w-[90%]"
              />
            </button>

            <button
              type="button"
              onClick={() => setSelectedBox(3)}
              disabled={isWaitingView}
              aria-pressed={selectedBox === 3}
              className={`flex-1 transition-opacity disabled:cursor-not-allowed ${
                selectedBox !== null && selectedBox !== 3 ? "opacity-30" : "opacity-100"
              }`}
            >
              <Image
                src="/landing/box-3.png"
                alt="세 번째 선물 상자"
                width={492}
                height={382}
                className="h-auto w-full"
              />
            </button>
          </div>

          {/* 선물 상자를 선택한 뒤 랜덤 포인트 추첨을 진행 */}
          <button
            type="button"
            onClick={handleDrawRandomPoint}
            disabled={isWaitingView || selectedBox === null || isSubmitting}
            className={`font-sans-600 h-[60px] w-[55%] rounded-xs bg-purple-button text-sm text-white disabled:cursor-not-allowed disabled:bg-gray-300 disabled:opacity-100 pc:w-[520px] ${
              isWaitingView ? "mt-5 tablet:mt-7 pc:mt-[45px]" : "mt-8 tablet:mt-10 pc:mt-[78px]"
            }`}
          >
            {isSubmitting ? "추첨 중..." : "선택완료"}
          </button>

          {/* 랜덤 포인트 추첨 요청에 실패한 경우 오류 메시지를 표시 */}
          {errorMessage && <p className="font-sans-400 mt-3 text-sm text-red">{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
}
