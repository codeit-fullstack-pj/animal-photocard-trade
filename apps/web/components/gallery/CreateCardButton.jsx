import Link from "next/link";

// 오늘 생성 가능 횟수가 남아있으면 /my-gallery/create로 보내는 링크, 다 썼으면 비활성 표시만 하는 span
export default function CreateCardButton({ remainingCount, limit, className }) {
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
