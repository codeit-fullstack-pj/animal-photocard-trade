"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

import styles from "./Notification.module.css";

// 무한 스크롤 테스트용 — 한 번에 더 불러오는 개수
const PAGE_SIZE = 5;

// TODO: 알림 백엔드 나오면 실제 목록 조회(페이지네이션)로 교체. 지금은 스크롤 테스트용으로
// 넉넉하게 mock을 만들어둔다 — 실제로는 서버가 페이지 단위로 내려주고, 여기서 이어붙이면 된다
function buildMockNotifications() {
  const base = [
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
  ];

  for (let i = 4; i <= 24; i += 1) {
    base.push({
      id: `mock-${i}`,
      content: `테스트용 알림 ${i}번째 내용이에요. 무한 스크롤 동작 확인용입니다.`,
      timestamp: `${i}일 전`,
      status: i % 3 === 0 ? "READ" : "UNREAD",
    });
  }

  return base;
}

/**
 * 알림 벨을 누르면 그 바로 아래에 붙는 알림 드롭다운. Profile.jsx/Dropdown.jsx와 같은 패턴
 * (트리거+패널을 한 컴포넌트가 같이 소유, 바깥 클릭·Esc로 닫힘)을 쓴다.
 * 목록은 무한 스크롤 — 패널 안 스크롤 영역 바닥에 닿으면 다음 페이지만큼 더 보여준다.
 * AppHeader가 모바일용/태블릿·PC용 두 인스턴스를 따로 렌더링하는데, open/onOpenChange를 주면
 * 열림 상태를 그 부모가 들고 있는 하나의 state로 공유한다(컨트롤드) — 안 주면 기존처럼
 * 컴포넌트 내부 state로 스스로 여닫는다(언컨트롤드).
 * mobile=true면(모바일 헤더 안 트리거 전용) 열렸을 때 패널이 헤더 바로 아래를 100% 너비로
 * 덮는다 — 그동안 트리거(벨)는 AppHeader가 보여주는 뒤로가기+"알림" 타이틀 바로 덮이니 숨긴다.
 * @param {{ unreadCount: number, mobile?: boolean, open?: boolean, onOpenChange?: (open: boolean) => void }} props
 */
export default function Notification({
  unreadCount = 0,
  mobile = false,
  open: openProp,
  onOpenChange,
}) {
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? openProp : internalOpen;
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const sentinelRef = useRef(null);

  const setOpen = useCallback(
    (value) => {
      const next =
        typeof value === "function" ? value(isControlled ? openProp : internalOpen) : value;
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, openProp, internalOpen, onOpenChange],
  );

  const [notifications, setNotifications] = useState(buildMockNotifications);
  const visibleNotifications = notifications.filter((n) => n.status !== "DELETED");

  // 무한 스크롤: 실제로는 전부 로컬에 있지만, "더 불러온 것처럼" 보여주는 개수만 늘려간다.
  // 진짜 API가 생기면 이 숫자만큼 요청해서 notifications 뒤에 이어붙이는 방식으로 바꾸면 된다
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const pagedNotifications = visibleNotifications.slice(0, visibleCount);
  const hasMore = visibleCount < visibleNotifications.length;

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

  // TODO: 백엔드 나오면 여기서 읽음 처리 API 호출로 교체. 지금은 현재 불러와둔(get 된) 목록만 로컬로 바꿈
  function handleMarkRead(id) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: "READ" } : n)));
  }

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e) {
      // AppHeader가 모바일용/태블릿·PC용 두 Notification 인스턴스를 항상 같이 마운트해두고 open state를
      // 공유하기 때문에, 각자의 rootRef만 기준으로 "바깥"을 판단하면 한쪽 패널 안을 눌러도 다른 쪽
      // 인스턴스가 "내 바깥"이라고 오판해서 공유 state를 꺼버린다. data-notification-root가 붙은
      // 루트(둘 중 어느 쪽이든) 안이면 "안쪽"으로 본다.
      if (!e.target.closest?.("[data-notification-root]")) setOpen(false);
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
  }, [open, setOpen]);

  // 무한 스크롤: 목록 스크롤 영역(root) 바닥의 sentinel이 보이면 한 페이지만큼 더 노출한다
  useEffect(() => {
    if (!open || !hasMore) return;

    const sentinel = sentinelRef.current;
    const root = listRef.current;
    if (!sentinel || !root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, visibleNotifications.length));
        }
      },
      { root, threshold: 1 },
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [open, hasMore, visibleNotifications.length]);

  const mobileFull = mobile && open;

  return (
    <div
      ref={rootRef}
      data-notification-root
      className={`relative flex h-14 items-center tablet:h-16 pc:h-20 ${mobileFull ? "w-full" : ""}`}
    >
      {/* mobile에서 패널이 열리면 트리거는 AppHeader가 보여주는 뒤로가기+타이틀 바로 대체되니 숨긴다 */}
      {!mobileFull && (
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={open}
          aria-label="알림"
          onClick={() => setOpen((v) => !v)}
          className="relative flex h-[20px] w-[20px] items-center justify-center"
        >
          <Image
            src={unreadCount > 0 ? "/alarm_active.png" : "/alarm_default.png"}
            alt=""
            width={20}
            height={20}
          />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red px-0.5 font-sans-500 text-[9px] leading-none text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {open && (
        <div
          className={
            mobile
              ? "fixed inset-x-0 top-14 bottom-0 z-40 flex w-full flex-col bg-gray-500 py-0 px-0 text-left"
              : "absolute top-full right-0 z-10 w-75 h-auto rounded-xs bg-gray-500 py-0 px-0 text-left"
          }
        >
          {visibleNotifications.length === 0 ? (
            <div className="flex h-26.75 w-full items-center justify-center">
              <span className="font-sans-400 text-sm text-white">받은 알림이 없습니다</span>
            </div>
          ) : (
            <>
              <div
                ref={listRef}
                className={`${styles.scrollbarHide} overflow-y-auto ${mobile ? "flex-1" : "max-h-80"}`}
              >
                {pagedNotifications.map((notification) => (
                  // TODO: 알림 항목 UI — 지금은 스타일 확인용으로 내용만 임시로 찍음
                  <div
                    key={notification.id}
                    onClick={() => handleMarkRead(notification.id)}
                    className={`font-sans-400 relative flex h-26.75 cursor-pointer flex-col justify-between border-b border-gray-300 p-5 text-sm text-white ${
                      notification.status === "READ" ? "bg-gray-500" : "bg-[#222222]"
                    }`}
                  >
                    <Image
                      src="/x.png"
                      alt=""
                      width={20}
                      height={20}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
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

                {hasMore && (
                  <div ref={sentinelRef} className="flex h-10 w-full items-center justify-center">
                    <span className="font-sans-400 text-xs text-gray-300">불러오는 중...</span>
                  </div>
                )}
              </div>
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
