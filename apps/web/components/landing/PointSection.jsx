import ResponsivePicture from "./ResponsivePicture";
import SectionHeading from "./SectionHeading";

export default function PointSection() {
  return (
    <section className="content-auto relative overflow-clip my-16 sm:my-20 md:my-16 lg:my-24 py-16 md:py-16 md:pb-24 lg:min-h-[56.25rem] lg:pt-36 lg:pb-16">
      {/* 아래쪽 노란 원 배경: 중심이 화면 60% 지점, 원의 위쪽 1/4 정도만 보인다 (데스크톱 지름 = 화면 폭 71%) */}
      <div
        className="pointer-events-none absolute bottom-0 left-[110%] sm:left-[80%] md:left-[60%] lg:left-[60%] aspect-square w-[140%] -translate-x-1/2 translate-y-[60%] md:translate-y-[70%] lg:translate-y-[75%] rounded-full opacity-20 bg-[linear-gradient(to_bottom,#EFFF04_0%,#0F0F0F_100%)] inset-shadow-[0_0_3.125rem_0_rgba(255,255,255)] sm:w-[106%] md:w-[75%] lg:w-[71%]"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-[67.5rem] px-[8%] sm:px-[7%] lg:w-[56%] lg:px-0">
        <SectionHeading
          subtitle={"내 포토카드를 포인트로 팔고, 원하는 포토카드를\n포인트로 안전하게 교환하세요"}
        >
          포인트로 <span className="text-main">안전하게 거래</span>하세요
        </SectionHeading>

        <ResponsivePicture
          alt="포인트 잔액과 포토카드 상세 화면이 열린 태블릿"
          lg="/landing/point-lg.png"
          md="/landing/point-md.png"
          sm="/landing/point-sm.png"
          className="align-baseline mt-8 ml-[-2%] w-[115%] max-w-none sm:ml-0 sm:w-full md:mt-0.5 md:w-[90%] lg:mt-10 lg:w-[86%]"
        />
      </div>
    </section>
  );
}
