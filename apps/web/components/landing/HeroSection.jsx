import Logo from "./Logo";
import Link from "next/link";
import ResponsivePicture from "./ResponsivePicture";

export default function HeroSection() {
  return (
    <section className="px-[4%] sm:px-8 md:px-[4%] lg:px-12">
      {/* 회색 카드 + 오른쪽 위 보라색, 왼쪽 아래 파란색 그라데이션 */}
      <div className="relative rounded-[1.5rem] bg-[#3f3f3f] bg-[radial-gradient(ellipse_75%_95%_at_100%_0%,rgba(167,126,255,0.55),transparent_100%),radial-gradient(ellipse_45%_40%_at_0%_100%,rgba(41,201,249,0.12),transparent_100%)] px-[3.4%] sm:px-4 md:px-[1.8%] lg:px-4 pb-6 text-center sm:rounded-[1.75rem] sm:pt-16 sm:pb-8 lg:pt-16 lg:pb-20">
        <div className="hidden sm:block">
          <Logo className="mx-auto h-11 sm:h-11 md:h-14 lg:h-14" />
        </div>

        <p className="mt-5 sm:mt-5 md:mt-4 lg:mt-5 pt-8 sm:pt-0 md:pt-0 lg:pt-0 font-sans-600 text-[1.5rem] leading-[1.3] md:text-[2.5rem] sm:text-[0.55rem] lg:text-5xl">
          내가 츄르를 바칠 상인가!
          <br />
          우리집 <span className="text-[#9747FF]">최애</span> 자랑
        </p>

        <Link
          href="/market"
          className="inline-flex rounded-xs h-9 sm:h-12 md:h-18 lg:h-14 mt-7 items-center justify-center bg-purple-button px-6 sm:px-10 md:px-12 lg:px-10 font-sans-500 text-[0.66rem] sm:text-sm md:text-xl lg:text-lg text-white hover:bg-[#9548e6] text-center"
        >
          관상 카드 만들어보기
        </Link>

        <ResponsivePicture
          alt="마켓플레이스 화면이 열린 노트북과 포토카드 사진들"
          lg="/landing/hero-lg.png"
          md="/landing/hero-md.png"
          sm="/landing/hero-sm.png"
          className="mx-[-3.5%] mt-6 sm:mt-8 md:mx-[-6.5%] lg:mx-[-3.5%] lg:mt-10"
        />
      </div>
    </section>
  );
}
