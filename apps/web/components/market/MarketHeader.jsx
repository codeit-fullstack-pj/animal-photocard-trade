import Link from "next/link";

export default function MarketHeader() {
  return (
    <section className="pt-[16px]">
      <div
        className="
          flex
          h-[20px]
          items-start
          justify-end

          tablet:h-[85px]
          tablet:items-start
          tablet:justify-between
          tablet:border-b
          tablet:border-white
        "
      >
        {/* 제목 */}
        <h1
          className="
            hidden

            tablet:block
            tablet:font-['BaskinRobbins']
            tablet:text-[48px]
            tablet:font-normal
            tablet:leading-none
            tablet:tracking-[-1px]

            pc:text-[48px]
          "
        >
          마켓플레이스
        </h1>

        {/* 판매하기 버튼 */}
        <Link
          href="/market/sell"
          className="
            fixed
            bottom-[40px]
            left-[16px]
            right-[16px]
            z-40
            flex
            h-[60px]
            items-center
            justify-center
            rounded-[2px]
            bg-[#9b51e5]
            text-[18px]
            font-bold
            text-white
            transition
            hover:bg-[#a65bea]

            tablet:static
            tablet:z-auto
            tablet:h-[60px]
            tablet:w-[442px]
            tablet:rounded-[2px]
          "
        >
          나의 포토카드 판매하기
        </Link>
      </div>
    </section>
  );
}
