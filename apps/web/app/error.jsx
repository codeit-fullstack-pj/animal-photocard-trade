"use client"; // 에러 경계는 클라이언트 컴포넌트여야 한다

import { useEffect } from "react";

// page.jsx에서 렌더링 중 예외가 나면 페이지 대신 이 화면을 보여준다.
// (하이드레이션 불일치처럼 React가 스스로 복구하는 경고는 여기까지 오지 않고 콘솔에만 남는다)
export default function Error({ error, retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <h2 className="font-primary-bold text-2xl">페이지를 불러오지 못했어요</h2>
      <p className="font-sans-400 text-sm text-gray-300">잠시 후 다시 시도해 주세요.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="inline-flex h-11 items-center justify-center rounded-[0.375rem] bg-purple-button px-10 font-sans-500 text-sm text-white hover:bg-[#9548e6]"
      >
        다시 시도
      </button>
    </main>
  );
}
