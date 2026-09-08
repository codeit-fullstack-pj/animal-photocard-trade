import Image from "next/image";

import ResponsivePicture from "./ResponsivePicture";
import SectionHeading from "./SectionHeading";

export default function RandomBoxSection() {
  return (
    <section className="content-auto relative overflow-clip pt-16 pb-12 lg:min-h-[56.25rem] lg:pt-36 lg:pb-16">
      {/* 아래로 갈수록 진해지는 올리브색 배경 */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[75%] bg-[linear-gradient(to_bottom,rgba(59,64,25,0)_0%,#0F0F0F_10%,#262900_100%)]"
        aria-hidden="true"
      />

      {/* 좌우에 기울어진 선물 상자 장식. 왼쪽 큰 상자는 섹션 아래로 잘려 나간다 */}
      <Image
        src="/landing/box-1.png"
        alt=""
        width={492}
        height={382}
        className="pointer-events-none absolute opacity-15 -bottom-[6%] -left-[8%] w-[46%] rotate-[-12deg] sm:w-[34%] md:bottom-[-14%] md:-left-[5.5%] lg:-bottom-[28%] lg:left-[4.5%] lg:w-[34%]"
      />
      <Image
        src="/landing/box-3.png"
        alt=""
        width={492}
        height={382}
        className="pointer-events-none absolute opacity-15 top-[40%] -right-[4%] w-[22%] rotate-[10deg] sm:w-[16%] md:top-[48%] md:right-[-1%] lg:top-[43%] lg:right-[20%] lg:w-[13%]"
      />

      <div className="relative mx-auto w-full max-w-[67.5rem] px-[8%] sm:px-[7%] lg:w-[56%] lg:px-0">
        <SectionHeading subtitle={"하루에 한 번 주어지는 랜덤 상자를 열고,\n포인트를 획득하세요"}>
          랜덤 상자로 <span className="text-main">포인트 받자!</span>{" "}
          <span className="font-emoji">🎉</span>
        </SectionHeading>

        <ResponsivePicture
          alt="랜덤포인트 상자 뽑기 화면이 열린 태블릿"
          lg="/landing/random-lg.png"
          md="/landing/random-md.png"
          sm="/landing/random-sm.png"
          className="mx-auto mt-8 w-[94%] sm:w-[88%] lg:mt-10 lg:ml-[8%] lg:w-[77%]"
        />
      </div>
    </section>
  );
}
