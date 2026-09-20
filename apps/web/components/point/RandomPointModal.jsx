"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  getRemainingTimeToNextKstMidnight,
  isDrawnTodayInKst,
} from "@/lib/point/random-point-time";
import { drawRandomPoint } from "@/lib/user/api";

export default function RandomPointModal({ isOpen, onClose, onDrawSuccess, previewState = null }) {
  const { currentUser, isLoading: isUserLoading, reloadCurrentUser } = useAuth();

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

  // 오늘 이미 추첨한 사용자의 대기 상태를 확인
  const isWaitingView = previewState === "waiting" || (!isUserLoading && hasDrawnToday);

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
    setSelectedBox(null);
    setIsSubmitting(false);
    setErrorMessage("");

    onClose();
  }

  // 선택한 선물 상자를 기준으로 랜덤 포인트 추첨 요청
  async function handleDrawRandomPoint() {
    if (!currentUser || hasDrawnToday || selectedBox === null || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const result = await drawRandomPoint();

      // 변경된 포인트와 마지막 추첨 시간을 전역 사용자 상태에 반영한다.
      await reloadCurrentUser();
      // 추첨 결과를 부모 컴포넌트에 전달해 결과 모달로 전환
      onDrawSuccess?.(result);
    } catch (error) {
      // 공통 API 에러의 종류에 따라 사용자에게 보여줄 메시지를 설정
      if (error instanceof ApiError) {
        if (error.code === "RANDOM_POINT_ALREADY_DRAWN") {
          try {
            // 서버 상태와 전역 사용자 상태가 다르면 최신 사용자 정보를 다시 반영한다.
            await reloadCurrentUser();
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={handleClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={`relative w-[343px] bg-gray-500 tablet:w-[600px] pc:w-[1034px] ${
          isWaitingView
            ? "h-[320px] tablet:h-[360px] pc:h-[420px]"
            : "h-[466px] tablet:h-[538px] pc:h-[765px]"
        }`}
      >
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
          {/* 랜덤 포인트 모달 제목 */}
          <h2 className="[font-family:var(--font-baskin-robbins)] text-[30px] leading-[1.3] font-bold tablet:text-[36px] pc:-translate-y-[8px] pc:text-[46px]">
            <span className="text-white">랜덤</span>
            <span className="text-purple-button">포인트</span>
          </h2>

          {/* 현재 사용자 정보를 불러온 뒤 상태에 맞는 화면을 표시 */}
          {!isUserLoading &&
            (isWaitingView ? (
              <>
                {/* 오늘 이미 포인트를 획득한 경우 다음 기회까지 남은 시간만 표시 */}
                <div className="mt-[48px] flex flex-col items-center text-white tablet:mt-[52px] pc:mt-[60px]">
                  <p className="font-sans-400 text-[16px] pc:text-[20px]">
                    다음 기회까지 남은 시간
                  </p>

                  <p className="font-sans-600 mt-[8px] text-[28px] pc:mt-[12px] pc:text-[40px]">
                    {remainingTime.hours}시간 {remainingTime.minutes}분
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* 랜덤 포인트 최초 추첨 안내 문구 */}
                <div className="font-sans-400 mt-[32px] flex flex-col text-[16px] text-white pc:-translate-y-[19px] pc:mt-[44px] pc:gap-0 pc:text-[20px]">
                  <p>매일마다 돌아오는 기회!</p>
                  <p>랜덤 상자 뽑기를 통해 포인트를 획득하세요!</p>
                </div>

                {/* 랜덤 포인트를 선택할 선물 상자 3개를 표시 */}
                <div className="mt-8 flex w-[315px] items-end justify-center gap-[8px] tablet:mt-10 tablet:w-[530px] tablet:gap-[17px] pc:mt-[120px] pc:w-[837px] pc:gap-[46px]">
                  {/* 첫 번째 선물 상자 */}
                  <button
                    type="button"
                    onClick={() => setSelectedBox(1)}
                    aria-pressed={selectedBox === 1}
                    className={`flex-1 transition-opacity ${
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

                  {/* 두 번째 선물 상자 */}
                  <button
                    type="button"
                    onClick={() => setSelectedBox(2)}
                    aria-pressed={selectedBox === 2}
                    className={`flex-1 transition-opacity ${
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

                  {/* 세 번째 선물 상자 */}
                  <button
                    type="button"
                    onClick={() => setSelectedBox(3)}
                    aria-pressed={selectedBox === 3}
                    className={`flex-1 transition-opacity ${
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
                  disabled={selectedBox === null || isSubmitting}
                  className="font-sans-600 mt-[60px] h-[60px] w-[55%] rounded-xs bg-purple-button text-sm text-white disabled:cursor-not-allowed disabled:bg-gray-300 disabled:opacity-100 tablet:mt-[59px] pc:mt-[75px] pc:w-[520px]"
                >
                  {isSubmitting ? "추첨 중..." : "선택완료"}
                </button>
              </>
            ))}

          {/* 랜덤 포인트 추첨 요청에 실패한 경우 오류 메시지를 표시 */}
          {errorMessage && <p className="font-sans-400 mt-3 text-sm text-red">{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
}
