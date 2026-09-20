"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { getRemainingTimeToNextKstMidnight } from "@/lib/point/random-point-time";

export default function RandomPointResultModal({ isOpen, earnedPoint, onClose }) {
  // 다음 랜덤 포인트 기회까지 남은 시간을 관리
  const [remainingTime, setRemainingTime] = useState({
    hours: 0,
    minutes: 0,
  });

  // 결과 모달이 열려 있는 동안 다음 KST 자정까지 남은 시간을 갱신
  useEffect(() => {
    if (!isOpen) return;

    function updateRemainingTime() {
      setRemainingTime(getRemainingTimeToNextKstMidnight());
    }

    updateRemainingTime();

    const intervalId = window.setInterval(updateRemainingTime, 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isOpen]);

  // 결과 모달이 닫힌 상태라면 화면에 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4 tablet:bg-black/70"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative flex h-[541px] w-[345px] flex-col items-center bg-gray-500 text-center tablet:h-[658px] tablet:w-[455px] pc:h-[678px] pc:w-[455px]"
      >
        {/* 랜덤 포인트 결과 모달을  닫음 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-[21px] right-[21px] pc:top-[28px] pc:right-[28px]"
          aria-label="랜덤 포인트 결과 모달 닫기"
        >
          <Image src="/close.png" alt="" width={18} height={18} className="h-[18px] w-[18px]" />
        </button>

        <h2 className="[font-family:var(--font-baskin-robbins)] text-[30px] leading-[1.3] font-bold pc:mt-[80px]  tablet:mt-[85px] mt-[77px] tablet:text-[34px] pc:text-[38px]">
          <span className="text-white">랜덤</span>
          <span className="text-purple-button">포인트</span>
        </h2>

        <div className="pc:mt-[84px]  tablet:mt-[78 px] mt-[58px]  flex flex-col items-center text-white pc:mt-[55px]">
          <Image
            src="/point_logo.png"
            alt="포인트"
            width={640}
            height={428}
            sizes="(max-width: 743px) 238px, 320px"
            className="h-[159px] w-[238px] tablet:h-[214px] tablet:w-[320px] pc:h-[214px] pc:w-[320px]"
          />

          <p className="[font-family:var(--font-baskin-robbins)] text-[30px] font-bold pc:mt-[83px] tablet:mt-[78px] mt-[59px] pc:text-[34px]">
            <span className="text-purple-button">{earnedPoint}P</span>
            <span className="text-white"> 획득!</span>
          </p>
        </div>

        {/* 다음 랜덤 포인트 기회까지 남은 시간을 표시 */}
        <div className="mt-[13px] flex flex-col items-center justify-center pc:mt-[16px] tablet:mt-[20px] mt-[20px] tablet:flex-row tablet:gap-[8px]">
          <p className="font-sans-400 text-[12px] text-gray-300 pc:text-[14px]">
            다음 기회까지 남은 시간
          </p>

          <p className="font-sans-600 mt-[6px] text-[12px] text-white tablet:mt-0 pc:text-[14px]">
            {remainingTime.hours}시간 {remainingTime.minutes}분
          </p>
        </div>
      </div>
    </div>
  );
}
