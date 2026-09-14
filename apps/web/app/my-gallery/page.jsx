"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/api";
import { getRemainingCount } from "@/lib/card/api";
import MyGalleryCards from "@/components/gallery/MyGalleryCards";
import LandingHeader from "@/components/landing/LandingHeader";

const CREATE_BUTTON_CLASSNAME =
  "hidden h-15.25 items-center justify-center rounded-xs font-sans-400 text-base text-white tablet:flex tablet:w-85.5 pc:w-110";

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
    <>
      <LandingHeader />
      <main className="flex w-full justify-center px-4 pt-10 font-sans-400 tablet:px-6 pc:px-0 pc:pt-20">
        <div className="mb-10 flex h-full w-84.25 flex-col items-center gap-8 tablet:w-full tablet:max-w-170 pc:mb-15 pc:max-w-none pc:w-310 pc:gap-20">
          <div className="flex w-full flex-col gap-3 pc:gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-left text-3xl font-primary tablet:text-4xl pc:text-[62px]">
                마이갤러리
              </h2>
              {remainingCount > 0 ? (
                <Link
                  href="/my-gallery/create"
                  className={`${CREATE_BUTTON_CLASSNAME} bg-purple-button`}
                >
                  포토카드 생성하기 {remainingCount}/{limit}
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className={`${CREATE_BUTTON_CLASSNAME} cursor-not-allowed bg-[#535353]`}
                >
                  포토카드 생성하기 {remainingCount}/{limit}
                </span>
              )}
            </div>
            <div className="h-0.5 w-full bg-gray-100" />
            <MyGalleryCards userName={userName} />
          </div>
        </div>
      </main>
    </>
  );
}
