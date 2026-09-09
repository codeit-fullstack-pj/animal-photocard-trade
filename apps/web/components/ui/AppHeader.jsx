import Image from "next/image";
import Link from "next/link";

export default function AppHeader({ user }) {
  const alarmImage = user.unreadCount > 0 ? "/alarm_active.png" : "/alarm_default.png";

  return (
    <header className="h-[80px] w-full bg-[#0F0F0F]">
      <div className="mx-auto flex h-full w-full max-w-[1240px] items-center justify-between">
        {/* 서비스 로고 */}
        <Link href="/" aria-label="최애 멍냥 홈">
          <Image src="/logo.png" alt="최애 멍냥" width={182} height={61} priority />
        </Link>

        {/* 로그인한 사용자 정보 */}
        <div className="flex items-center gap-[32px]">
          <span className="font-sans-500 text-[14px] text-[#DDDDDD]">
            {Number(user.point).toLocaleString("ko-KR")} P
          </span>

          <button
            type="button"
            className="flex h-[20px] w-[20px] items-center justify-center"
            aria-label="알림"
          >
            <Image src={alarmImage} alt="" width={20} height={20} />
          </button>

          <span className="font-sans-700 text-[16px] text-[#DDDDDD]">{user.nickname}</span>

          <span className="h-[16px] w-px bg-[#5A5A5A]" aria-hidden="true" />

          <button type="button" className="font-sans-500 text-[14px] text-[#DDDDDD]">
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}
