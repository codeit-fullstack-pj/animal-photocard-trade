"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import Image from "next/image";

import MobileHeader from "@/components/ui/MobileHeader";

const TABLET_QUERY = "(min-width: 744px)";
const PC_QUERY = "(min-width: 1280px)";

const SHEET_VARIANTS = {
  mobile: { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } },
  tablet: { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } },
  pc: {
    initial: { scale: 0.96, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.96, opacity: 0 },
  },
};

function useShellBreakpoint() {
  const [breakpoint, setBreakpoint] = useState("mobile");

  useEffect(() => {
    const tabletQuery = window.matchMedia(TABLET_QUERY);
    const pcQuery = window.matchMedia(PC_QUERY);

    function update() {
      setBreakpoint(pcQuery.matches ? "pc" : tabletQuery.matches ? "tablet" : "mobile");
    }

    update();
    tabletQuery.addEventListener("change", update);
    pcQuery.addEventListener("change", update);
    return () => {
      tabletQuery.removeEventListener("change", update);
      pcQuery.removeEventListener("change", update);
    };
  }, []);

  return breakpoint;
}

export default function ResponsiveModalShell({
  isOpen,
  onClose,
  onBack,
  title,
  children,
  isSubmitting,
}) {
  const breakpoint = useShellBreakpoint();
  const [canDrag, setCanDrag] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function handleClose() {
    if (isSubmitting) return;
    onClose();
  }

  function handleBack() {
    if (isSubmitting) return;
    (onBack ?? onClose)();
  }

  function handleContentScroll(event) {
    setCanDrag(event.currentTarget.scrollTop === 0);
  }

  function handleDragEnd(event, info) {
    if (info.offset.y > 100 || info.velocity.y > 500) handleClose();
  }

  const sheetVariant = SHEET_VARIANTS[breakpoint];
  const isDraggable = breakpoint === "tablet" && !isSubmitting && canDrag;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          key="modal-shell"
          className="fixed inset-0 z-50 flex flex-col tablet:justify-end pc:items-center pc:justify-center"
        >
          {/* dim — 모바일은 화면 전체를 덮으므로 두지 않는다 */}
          <motion.button
            type="button"
            aria-label="닫기"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 hidden cursor-default bg-[#222222e6] tablet:block"
          />

          <motion.div
            initial={sheetVariant.initial}
            animate={sheetVariant.animate}
            exit={sheetVariant.exit}
            transition={{ duration: 0.28 }}
            drag={isDraggable ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            className="relative z-10 flex h-full w-full flex-col overflow-hidden bg-black tablet:h-[92vh] tablet:rounded-t-[20px] pc:h-[90vh] pc:max-h-193 pc:w-[90vw] pc:max-w-235 pc:rounded-[20px]"
          >
            {/* 모바일 헤더 — <는 페이지 이동이 아니라 모달 닫기다 */}
            <div className="shrink-0 tablet:hidden">
              <MobileHeader title={title} onBack={handleBack} />
            </div>

            {/* 태블릿 끌어내리기 핸들 */}
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              aria-label="닫기"
              className="mx-auto hidden shrink-0 py-3 tablet:block pc:hidden"
            >
              <span className="block h-1 w-10 rounded-full bg-gray-400" />
            </button>

            {/* PC 닫기 버튼 */}
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              aria-label="닫기"
              className="absolute top-6 right-6 z-10 hidden pc:block"
            >
              <Image src="/close.png" alt="" width={24} height={24} />
            </button>

            {/* 내용이 길면 세로로만 스크롤한다 (가로 스크롤은 어느 폭에서도 만들지 않는다) */}
            <div
              onScroll={handleContentScroll}
              className="min-h-0 flex-1 overflow-x-hidden px-4 py-5 tablet:px-5 tablet:py-6 tablet:pb-0 pc:p-15"
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
