"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";

import { getNotifications } from "@/lib/notification/api";
import styles from "./Notification.module.css";

// 무한 스크롤 시 한 번에 요청하는 개수(= GET /notification limit)
const PAGE_SIZE = 5;

function formatRelativeTime(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;

  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}일 전`;
}

const NotificationDataContext = createContext(null);

function useNotificationData() {
  return useContext(NotificationDataContext);
}

// open이 될 때만 새로 마운트되어 state가 자연 초기화되며, 실제 fetch/페이지네이션/읽음·삭제를 전담한다
function NotificationDataLoader({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  // undefined = 아직 첫 페이지를 안 불러옴, null = 다음 페이지 없음, 문자열 = 다음 페이지 cursor
  const [nextCursor, setNextCursor] = useState(undefined);
  const hasMore = Boolean(nextCursor);
  // isLoadingMore(state)는 반영이 비동기라, 같은 렌더 틱에 loadMore가 연달아 불리면(StrictMode 이중
  // 호출 등) 가드를 뚫고 같은 페이지를 두 번 요청해 중복 항목이 생길 수 있다. ref로 즉시 막는다
  const isLoadingMoreRef = useRef(false);

  useEffect(() => {
    let ignore = false;

    getNotifications({ limit: PAGE_SIZE })
      .then((result) => {
        if (ignore) return;
        setNotifications(result.lists);
        setNextCursor(result.nextCursor);
      })
      .catch(() => {
        if (!ignore) setError("알림을 불러오지 못했어요");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const loadMore = useCallback(() => {
    if (isLoadingMoreRef.current || !nextCursor) return;
    isLoadingMoreRef.current = true;

    setIsLoadingMore(true);
    getNotifications({ cursor: nextCursor, limit: PAGE_SIZE })
      .then((result) => {
        setNotifications((prev) => {
          // 혹시라도 같은 id가 다시 오면(중복 요청 등) React key 중복을 막기 위해 걸러낸다
          const existingIds = new Set(prev.map((n) => n.id));
          return [...prev, ...result.lists.filter((n) => !existingIds.has(n.id))];
        });
        setNextCursor(result.nextCursor);
      })
      .catch(() => setError("알림을 더 불러오지 못했어요"))
      .finally(() => {
        isLoadingMoreRef.current = false;
        setIsLoadingMore(false);
      });
  }, [nextCursor]);

  // TODO: 읽음/삭제 API가 생기면 서버 호출로 교체 — 지금은 로컬 상태만 바꿈
  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  function handleDeleteAll() {
    setNotifications([]);
  }

  function handleDelete(id) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  function handleMarkRead(id) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  const value = {
    notifications,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    handleMarkAllRead,
    handleDeleteAll,
    handleDelete,
    handleMarkRead,
  };

  return (
    <NotificationDataContext.Provider value={value}>{children}</NotificationDataContext.Provider>
  );
}

// AppHeader가 모바일용/PC용 두 Notification 트리를 이걸로 감싸서 알림 데이터를 하나만 공유하게 한다.
// open이 아닐 땐 children(트리거 버튼들)만 그대로 렌더 — 열릴 때만 Loader가 마운트되어 fetch가 한 번만 일어난다.
export function NotificationDataProvider({ open, children }) {
  return open ? <NotificationDataLoader>{children}</NotificationDataLoader> : children;
}

// 알림 패널의 실제 UI. 데이터는 NotificationDataProvider가 공급하고, 스크롤 감지만 인스턴스별로 갖는다
function NotificationPanel({ mobile }) {
  const listRef = useRef(null);
  const {
    notifications,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    handleMarkAllRead,
    handleDeleteAll,
    handleDelete,
    handleMarkRead,
  } = useNotificationData();

  // 목록 스크롤 영역이 바닥까지 내려가면(=실제 스크롤이 일어났을 때만) 다음 페이지를 불러온다
  useEffect(() => {
    if (!hasMore) return;

    const root = listRef.current;
    if (!root) return;

    function onScroll() {
      const atBottom = root.scrollHeight - root.scrollTop - root.clientHeight <= 1;
      console.log("[스크롤 바닥 체크]", atBottom);
      if (atBottom) loadMore();
    }

    root.addEventListener("scroll", onScroll);
    return () => root.removeEventListener("scroll", onScroll);
  }, [hasMore, loadMore]);

  // 모바일 전체화면 패널처럼 목록 영역이 커서 첫 페이지만으론 스크롤 자체가 안 생기면, 스크롤을
  // 기다리지 않고 바로 다음 페이지를 채워서 스크롤이 가능해질 때까지(또는 더 없을 때까지) 이어 받는다
  useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    const root = listRef.current;
    if (!root) return;

    if (root.scrollHeight <= root.clientHeight) loadMore();
  }, [hasMore, isLoadingMore, notifications, loadMore]);

  return (
    <div
      className={
        mobile
          ? "fixed inset-x-0 top-14 bottom-0 z-40 flex w-full flex-col bg-gray-500 py-0 px-0 text-left"
          : "absolute top-full right-0 z-10 w-75 h-auto rounded-xs bg-gray-500 py-0 px-0 text-left"
      }
    >
      {isLoading ? (
        <div className="flex h-26.75 w-full items-center justify-center">
          <span className="font-sans-400 text-sm text-white">불러오는 중...</span>
        </div>
      ) : error && notifications.length === 0 ? (
        <div className="flex h-26.75 w-full items-center justify-center">
          <span className="font-sans-400 text-sm text-white">{error}</span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex h-26.75 w-full items-center justify-center">
          <span className="font-sans-400 text-sm text-white">받은 알림이 없습니다</span>
        </div>
      ) : (
        <>
          <div
            ref={listRef}
            className={`${styles.scrollbarHide} overflow-y-auto ${mobile ? "flex-1" : "max-h-80"}`}
          >
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleMarkRead(notification.id)}
                className={`font-sans-400 relative flex h-26.75 cursor-pointer flex-col justify-between border-b border-gray-300 p-5 text-sm text-white ${
                  notification.isRead ? "bg-gray-500" : "bg-[#222222]"
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
                    notification.isRead ? "text-gray-300" : "text-white"
                  }`}
                >
                  {notification.content}
                </span>
                <span className="font-sans-300 text-xs text-gray-300">
                  {formatRelativeTime(notification.createdAt)}
                </span>
              </div>
            ))}

            {isLoadingMore && (
              <div className="flex h-10 w-full items-center justify-center">
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
  );
}

// open/onOpenChange를 주면 AppHeader가 모바일·PC 두 인스턴스의 열림 상태를 공유시킬 수 있다(컨트롤드)
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

  const setOpen = useCallback(
    (value) => {
      const next =
        typeof value === "function" ? value(isControlled ? openProp : internalOpen) : value;
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, openProp, internalOpen, onOpenChange],
  );

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e) {
      // 모바일·PC 두 인스턴스가 open을 공유하므로, 내 rootRef가 아니라 어느 쪽 루트든 안이면 "안쪽"으로 본다
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
          className="relative flex h-[24px] w-[24px] items-center justify-center"
        >
          <Image
            src={unreadCount > 0 ? "/alarm_active.png" : "/alarm_default.png"}
            alt=""
            width={24}
            height={24}
          />
          {unreadCount > 0 && (
            <span
              style={{ height: 14, minWidth: 14 }}
              className="absolute -top-0.5 -right-1 flex items-center justify-center rounded-full bg-red px-0.5 font-sans-500 text-[9px] leading-none text-white"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {open && <NotificationPanel mobile={mobile} />}
    </div>
  );
}
