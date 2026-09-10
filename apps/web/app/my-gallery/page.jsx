import Link from "next/link";

import MyGalleryCards from "@/components/gallery/MyGalleryCards";
import LandingHeader from "@/components/landing/LandingHeader";

export default function MyGalleryPage() {
  // TODO: 인증 연동 시 로그인 유저 정보·남은 생성 횟수로 교체
  const userName = "닉네임";
  const remainingCount = 0;

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
              <Link
                href="/my-gallery/create"
                className="hidden h-15.25 items-center justify-center rounded-xs bg-purple-button font-sans-400 text-base text-white tablet:flex tablet:w-85.5 pc:w-110"
              >
                포토카드 생성하기 {remainingCount}/5
              </Link>
            </div>
            <div className="h-0.5 w-full bg-gray-100" />
            <MyGalleryCards userName={userName} />
          </div>
        </div>
      </main>
    </>
  );
}
