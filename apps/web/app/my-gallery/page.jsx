"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/api";
import { getRemainingCount } from "@/lib/card/api";
import MyGalleryCards from "@/components/gallery/MyGalleryCards";
import MobileHeader from "@/components/ui/MobileHeader";
import AppHeader from "@/components/ui/AppHeader";
import RequireAuth from "@/components/auth/RequireAuth";

const CREATE_BUTTON_CLASSNAME =
  "hidden h-15.25 items-center justify-center rounded-xs font-sans-400 text-base text-white tablet:flex tablet:w-85.5 pc:w-110";

function CreateCardButton({ remainingCount, limit, className }) {
  return remainingCount > 0 ? (
    <Link href="/my-gallery/create" className={`${className} bg-purple-button`}>
      포토카드 생성하기 {remainingCount}/{limit}
    </Link>
  ) : (
    <span aria-disabled="true" className={`${className} cursor-not-allowed bg-[#535353]`}>
      포토카드 생성하기 {remainingCount}/{limit}
    </span>
  );
}

export default function MyGalleryPage() {
  // 조회 전(또는 실패)에는 빈 값으로 둔다 — MyGalleryCards가 "{userName}님이 보유한..."을 그대로 찍어서 어색해 보일 수 있음
  const [userName, setUserName] = useState("");

  // 조회 전(또는 실패)에는 0으로 둬서 생성 버튼을 막아둔다 — 확인 안 된 상태에서 눌리게 하는 것보단 안전한 쪽
  const [remainingCount, setRemainingCount] = useState(0);
  const [limit, setLimit] = useState(5);

  useEffect(() => {
    let ignore = false;

    getCurrentUser()
      .then((result) => {
        if (ignore) return;
        setUserName(result.user.nickname);
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    getRemainingCount()
      .then((result) => {
        if (ignore) return;
        setRemainingCount(result.remainingCount);
        setLimit(result.limit);
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <RequireAuth>
      <div className="tablet:hidden">
        <MobileHeader title="마이갤러리" />
      </div>
      <div className="hidden tablet:block">
        <AppHeader />
      </div>
      <main className="mt-10 flex w-full justify-center px-4 font-sans-400 tablet:px-6 pc:mt-20 pc:px-0">
        <div className="mb-10 flex h-full w-full flex-col items-center gap-8 tablet:max-w-170 pc:mb-15 pc:max-w-none pc:w-310 pc:gap-20">
          <div className="flex w-full flex-col gap-3 pc:gap-5">
            {/* 모바일에선 MobileHeader가 이미 타이틀을 보여주고, 생성하기 버튼도 하단에 따로 있어서 이 줄 전체를 숨긴다 */}
            <div className="hidden items-center justify-between tablet:flex">
              <h2 className="text-left text-3xl font-primary tablet:text-4xl pc:text-[62px]">
                마이갤러리
              </h2>
              <CreateCardButton
                remainingCount={remainingCount}
                limit={limit}
                className={CREATE_BUTTON_CLASSNAME}
              />
            </div>
            <div className="hidden h-0.5 w-full bg-gray-100 tablet:block" />
            <MyGalleryCards userName={userName} />
            {/* 모바일에선 위쪽 생성하기 버튼이 안 보이니, 페이지네이션 아래 하단에 footer처럼 하나 더 둔다 */}
            <CreateCardButton
              remainingCount={remainingCount}
              limit={limit}
              className="flex h-15.25 w-full items-center justify-center rounded-xs font-sans-400 text-base text-white tablet:hidden"
            />
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}
