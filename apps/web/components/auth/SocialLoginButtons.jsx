import { API_BASE_URL } from "@/lib/api-client";

// Google 로그인 버튼. OAuth는 전부 API 서버가 처리하므로 웹은 서버 주소로 이동만 한다.
// (서버 → Supabase → 서버 콜백에서 로그인 쿠키를 심고 → 웹 홈으로 돌아온다)
export default function SocialLoginButtons({ className = "" }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <a
        href={`${API_BASE_URL}/auth/social/google`}
        className="flex h-14 w-full items-center justify-center gap-3 rounded-[0.25rem] bg-white font-sans-500 text-sm text-black hover:bg-gray-100"
      >
        <GoogleIcon />
        Google로 로그인하기
      </a>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.68-.06-1.33-.17-1.96H12v3.71h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.32 2.98-7.27Z"
      />
      <path
        fill="#34A853"
        d="M12 21.6c2.7 0 4.97-.9 6.62-2.42l-3.24-2.5c-.9.6-2.04.95-3.38.95-2.6 0-4.8-1.76-5.6-4.12H3.07v2.58A10 10 0 0 0 12 21.6Z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.51A6 6 0 0 1 6.09 12c0-.52.1-1.03.3-1.51V7.91H3.07a10 10 0 0 0 0 8.18l3.33-2.58Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.37c1.47 0 2.78.5 3.82 1.5l2.86-2.86A9.96 9.96 0 0 0 12 2.4a10 10 0 0 0-8.93 5.51l3.33 2.58c.8-2.36 3-4.12 5.6-4.12Z"
      />
    </svg>
  );
}
