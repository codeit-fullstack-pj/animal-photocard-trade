import Image from "next/image";

// 원본 로고 크기 351 x 86. 높이만 className으로 정하면 너비는 비율대로 따라간다.
// 사용 예: <Logo className="h-8 lg:h-12" />  (모바일 32px, 데스크톱 48px)
export default function Logo({ className = "h-8" }) {
  return (
    <Image
      src="/logo.png"
      alt="최애멍냥"
      width={351}
      height={86}
      priority
      className={`w-auto ${className}`}
    />
  );
}
