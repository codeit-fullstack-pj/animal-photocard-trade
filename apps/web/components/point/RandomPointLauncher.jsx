"use client";

import Image from "next/image";
import { useState } from "react";

import RandomPointModal from "@/components/point/RandomPointModal";
import RandomPointResultModal from "@/components/point/RandomPointResultModal";

export default function RandomPointLauncher({ autoOpen = false }) {
  // 랜덤 포인트 뽑기 모달의 열림 상태를 관리
  const [isModalOpen, setIsModalOpen] = useState(autoOpen);

  // 실제 추첨으로 획득한 포인트를 관리
  const [earnedPoint, setEarnedPoint] = useState(null);

  // 선물상자를 누르면 랜덤 포인트 뽑기 모달을 표시
  function handleOpenModal() {
    setEarnedPoint(null);
    setIsModalOpen(true);
  }

  // 실제 추첨 성공 후 뽑기 모달을 닫고 결과 모달로 전환
  function handleDrawSuccess(result) {
    setIsModalOpen(false);
    setEarnedPoint(result.earnedPoint);
  }

  return (
    <>
      {/* 화면 우측 하단에서 랜덤 포인트 뽑기 모달을 여는 선물상자를 표시 */}
      <button
        type="button"
        onClick={handleOpenModal}
        className="fixed right-[20px] bottom-[20px] z-40 tablet:right-[32px] tablet:bottom-[32px] pc:right-[40px] pc:bottom-[40px]"
        aria-label="랜덤 포인트 뽑기"
      >
        <Image
          src="/box_logo.png"
          alt=""
          width={80}
          height={80}
          className="h-[40px] w-[40px] object-contain tablet:h-[60px] tablet:w-[60px] pc:h-[70px] pc:w-[70px]"
        />
      </button>

      <RandomPointModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDrawSuccess={handleDrawSuccess}
      />

      <RandomPointResultModal
        isOpen={earnedPoint !== null}
        earnedPoint={earnedPoint}
        onClose={() => setEarnedPoint(null)}
      />
    </>
  );
}
