"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SaleFormView from "./SaleFormView";

// 판매자 본인이 보는 화면의 액션 버튼들 (수정하기 / 판매 내리기)
const SellerActionButtons = ({ sale }) => {
  const [isEditing, setIsEditing] = useState(false); // 수정 모달 표시 여부
  const [showCancelConfirm, setShowCancelConfirm] = useState(false); // 캔슬 확인 모달 표시 여부
  const router = useRouter();

  // 캔슬 확정 시 실행 — 서버에 캔슬 요청 보내고, 성공하면 화면 갱신 + 확인모달 닫기
  const handleCancel = async () => {
    const res = await fetch(`http://localhost:4000/api/v1/sales/${sale.id}/cancel`, {
      method: "PATCH",
    });

    if (res.ok) {
      router.refresh(); // 페이지 이동 없이 그 자리에서 최신 상태(CANCELED)로 갱신
      setShowCancelConfirm(false);
    } else {
      console.log("취소 실패");
    }
  };

  // 이미 종료된 판매글이면 버튼 대신 안내 문구만 보여줌 (재수정/재캔슬 방지)
  if (sale.status !== "ON_SALE") {
    return (
      <div className="w-full h-[80px] flex items-center justify-center text-gray-400 border border-gray-600 rounded-md">
        이미 종료된 판매글입니다
      </div>
    );
  }

  return (
    <>
      {/* 수정하기: 바로 실행 안 하고 수정 폼 모달만 띄움 */}
      <button
        onClick={() => setIsEditing(true)}
        className="w-full h-[80px] bg-[#a656f5] text-white"
      >
        판매글 수정하기
      </button>

      {/* 판매 내리기: 바로 실행 안 하고 확인 모달만 띄움 (실수 방지) */}
      <button
        onClick={() => setShowCancelConfirm(true)}
        className="w-full h-[80px] bg-transparent border border-white text-white"
      >
        판매 내리기
      </button>

      {/* 수정 모달 — SaleFormView에 initialData로 현재 값 넘겨서 미리 채움 */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#161616] w-[940px] p-[60px] rounded-3xl relative">
            <SaleFormView card={sale.card} initialData={sale} onClose={() => setIsEditing(false)} />
          </div>
        </div>
      )}

      {/* 캔슬 확인 모달 — "네"를 눌러야 진짜 handleCancel 실행됨 */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#161616] w-[400px] p-8 rounded-3xl text-white text-center">
            <p className="mb-6">정말 판매글을 내리시겠습니까?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 bg-gray-700 rounded-md py-2"
              >
                아니요
              </button>
              <button onClick={handleCancel} className="flex-1 bg-purple-600 rounded-md py-2">
                네, 내릴게요
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SellerActionButtons;
