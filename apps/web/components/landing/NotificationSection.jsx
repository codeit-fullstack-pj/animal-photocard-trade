import ResponsivePicture from "./ResponsivePicture";
import SectionHeading from "./SectionHeading";

export default function NotificationSection() {
  // 데스크톱 섹션 높이 56.25rem = 1920px 창에서 900px(Figma). 창이 줄면 비율대로 줄어든다
  return (
    <section className="content-auto relative overflow-clip py-16 lg:min-h-[56.25rem] lg:pt-36 lg:pb-16">
      {/* 아래쪽 파란 원 배경 (Figma: 1920 프레임에서 X 83 / 지름 1606 / 불투명도 30% / #0085BA→#0F0F0F).
          중심이 화면 46% 지점, 지름은 화면 폭 84%, 원의 위쪽 1/4만 보인다 */}
      <div
        className="pointer-events-none absolute bottom-0 left-[35%] lg:left-[46%] aspect-square w-[140%] -translate-x-1/2 translate-y-[65%] md:translate-y-[60%] lg:translate-y-[75%] rounded-full opacity-20 bg-[linear-gradient(to_bottom,#0085BA_0%,#0F0F0F_100%)] inset-shadow-[0_0_3.125rem_0_rgba(255,255,255)] sm:w-[116%] md:w-[85%] lg:w-[84%]"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-[67.5rem] px-[8%] sm:px-[7%] lg:w-[56%] lg:px-0">
        <SectionHeading subtitle={"교환 제안부터 판매 완료까지,\n실시간 알림으로 놓치지 마세요"}>
          알림으로 보다 <span className="text-blue">빨라진 거래</span>
        </SectionHeading>

        <div className="relative mt-8 lg:mt-10">
          {/* 말풍선 2개. 데스크톱에서는 이미지 왼쪽 위에 겹친다 */}
          <div className="relative z-10 mb-4 flex flex-col items-start gap-3 lg:absolute lg:top-[24%] lg:left-20 lg:mb-0">
            <span className="rounded-[0.625rem] bg-blue px-3 sm:px-06 md:px-6 lg:px-6 py-2 sm:py-4 md:py-4 lg:py-4  font-sans-400 text-xs text-black shadow-md sm:text-sm md:text-xs lg:text-sm">
              제 포카랑 교환해요 <span className="font-emoji">✋</span>
            </span>
            <span className="ml-10 rounded-[0.625rem] bg-gray-400 px-3 sm:px-06 md:px-6 lg:px-6 py-2 sm:py-4 md:py-4 lg:py-4 font-sans-400 text-xs text-white shadow-md sm:ml-16 sm:text-sm md:text-xs lg:text-sm lg:ml-8">
              [스페인 여행] 포카 사고 싶어요! <span className="font-emoji">✋</span>
            </span>
          </div>

          <ResponsivePicture
            alt="알림 목록이 열린 마켓플레이스 태블릿 화면"
            lg="/landing/alert-lg.png"
            md="/landing/alert-md.png"
            sm="/landing/alert-sm.png"
            className="ml-[-2%] w-[106%] max-w-none sm:ml-0 sm:w-full md:-mt-6 md:ml-[12%] md:w-[78%] lg:mt-0 lg:ml-[28%] lg:w-[67%]"
          />
        </div>
      </div>
    </section>
  );
}
