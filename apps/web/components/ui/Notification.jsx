"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * 알림 벨을 누르면 그 바로 아래에 붙는 알림 드롭다운. Profile.jsx/Dropdown.jsx와 같은 패턴
 * (트리거+패널을 한 컴포넌트가 같이 소유, 바깥 클릭·Esc로 닫힘)을 쓴다.
 * @param {{ unreadCount: number }} props
 */
export default function Notification({ unreadCount = 0 }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  // TODO: 알림 백엔드 나오면 실제 목록 조회로 교체. 지금은 버튼 스타일 확인용 mock
  // status: "UNREAD" | "READ" | "DELETED" — 목록엔 DELETED를 뺀 것만 보여준다
  const [notifications, setNotifications] = useState([
    {
      id: "mock-1",
      content:
        "회원님이 등록하신 판매글에 새로운 교환 신청이 도착했어요. 신청 내용을 확인하고 수락 또는 거절해 주세요. 24시간 내에 응답하지 않으면 자동으로 취소될 수 있어요.",
      timestamp: "방금 전",
      status: "UNREAD",
    },
    {
      id: "mock-2",
      content: "판매글이 판매 완료됐어요",
      timestamp: "10분 전",
      status: "READ",
    },
    {
      id: "mock-3",
      content: "삭제된 알림이에요 — 목록에는 안 보여야 해요",
      timestamp: "1일 전",
      status: "DELETED",
    },
  ]);
  const visibleNotifications = notifications.filter((n) => n.status !== "DELETED");

  // TODO: 백엔드 나오면 여기서 읽음 처리 API 호출로 교체. 지금은 현재 불러와둔(get 된) 목록만 로컬로 바꿈
  function handleMarkAllRead() {
    setNotifications((prev) =>
      prev.map((n) => (n.status === "DELETED" ? n : { ...n, status: "READ" })),
    );
  }

  // TODO: 백엔드 나오면 여기서 삭제 API 호출로 교체. 지금은 현재 불러와둔(get 된) 목록만 로컬로 바꿈
  function handleDeleteAll() {
    setNotifications((prev) => prev.map((n) => ({ ...n, status: "DELETED" })));
  }

  // TODO: 백엔드 나오면 여기서 개별 삭제 API 호출로 교체. 지금은 현재 불러와둔(get 된) 목록만 로컬로 바꿈
  function handleDelete(id) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: "DELETED" } : n)));
  }

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative flex h-14 items-center tablet:h-16 pc:h-20">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="알림"
        onClick={() => setOpen((v) => !v)}
        className="flex h-[20px] w-[20px] items-center justify-center"
      >
        <Image
          src={unreadCount > 0 ? "/alarm_active.png" : "/alarm_default.png"}
          alt=""
          width={20}
          height={20}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 z-10 w-75 h-auto rounded-xs bg-gray-500 py-0 px-0 text-left">
          {visibleNotifications.length === 0 ? (
            <div className="flex h-26.75 w-full items-center justify-center">
              <span className="font-sans-400 text-sm text-white">받은 알림이 없습니다</span>
            </div>
          ) : (
            <>
              {visibleNotifications.map((notification) => (
                // TODO: 알림 항목 UI — 지금은 스타일 확인용으로 내용만 임시로 찍음
                <div
                  key={notification.id}
                  className={`font-sans-400 relative flex h-26.75 flex-col justify-between border-b border-gray-300 p-5 text-sm text-white ${
                    notification.status === "READ" ? "bg-gray-500" : "bg-[#222222]"
                  }`}
                >
                  <Image
                    src="/x.png"
                    alt=""
                    width={20}
                    height={20}
                    onClick={() => handleDelete(notification.id)}
                    className="absolute top-5 right-5 cursor-pointer"
                  />
                  <span
                    className={`font-sans-400 line-clamp-2 pr-6 text-sm ${
                      notification.status === "READ" ? "text-gray-300" : "text-white"
                    }`}
                  >
                    {notification.content}
                  </span>
                  <span className="font-sans-300 text-xs text-gray-300">
                    {notification.timestamp}
                  </span>
                </div>
              ))}
              <div className="mt-0 flex h-12 items-center justify-between border-t border-solid border-[#393939]">
                <div
                  onClick={handleMarkAllRead}
                  className="font-sans-400 flex flex-1 cursor-pointer items-center justify-center text-sm text-gray-200 hover:text-white"
                >
                  전체 읽음 처리
                </div>
                <span className="h-full w-px bg-[#393939]" aria-hidden="true" />
                <div
                  onClick={handleDeleteAll}
                  className="font-sans-400 flex flex-1 cursor-pointer items-center justify-center text-sm text-gray-200 hover:text-white"
                >
                  전체 지우기
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
