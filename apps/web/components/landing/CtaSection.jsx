import Image from "next/image";
import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="content-auto py-16 text-center lg:py-24">
      {/* 기울어진 포토카드. 원본 PNG(836×862)는 카드 주변에 투명 여백이 있어 비율을 그대로 두고 폭만 정한다.
          카드 부분은 이미지 폭의 약 41% → w-64(256px)일 때 카드 폭 약 105px (설계 약 88px보다 조금 큼) */}
      <Image
        src="/landing/cta-card.png"
        alt="cta card"
        width={836}
        height={862}
        className="mx-auto block h-auto w-42 rotate-24 drop-shadow-[0_0.625rem_1.875rem_rgba(0,0,0,0.5)] sm:w-44 md:w-56 lg:w-64"
      />

      {/* PNG 아래쪽 투명 여백만큼 제목 간격을 줄인다 */}
      <h2 className="mt-2 font-sans-600 text-xl sm:text-[1.625rem]">
        나의 최애를 지금 찾아보세요!
      </h2>

      <Link
        href="/market"
        className="inline-flex h-8 sm:h-11 md:h-8 lg:h-11 mt-6 items-center justify-center bg-purple-button px-6 sm:px-12 md:px-6 lg:px-12 py-1 sm:py-6 md:py-5 lg:py-6 font-sans-500 text-[0.8125rem] text-white hover:bg-[#9548e6] text-[12px] sm:text-sm md:text-xs lg:text-sm"
      >
        최애 찾으러 가기
      </Link>
    </section>
  );
}
