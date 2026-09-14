import Link from "next/link";

export default function MarketHeader() {
  return (
    <section className="pt-[16px]">
      <div className="flex h-[85px] items-start justify-between border-b border-white">
        {/* 제목 */}
        <h1
          className="
            font-baskin
            pt-[0px]
            text-[48px]
            leading-[1.2]
            tracking-[-2px]
          "
        >
          마켓플레이스
        </h1>

        {/* 판매하기 버튼 */}
        <Link
          href="/market/sell"
          className="
            mt-[0px]
            flex
            h-[60px]
            w-[442px]
            items-center
            justify-center
            rounded-[2px]
            bg-[#9b51e5]
            text-[18px]
            font-bold
            text-white
            transition
            hover:bg-[#a65bea]
          "
        >
          나의 포토카드 판매하기
        </Link>
      </div>
    </section>
  );
}
