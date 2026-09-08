import Link from "next/link";

import SignupForm from "./components/SignupForm";
import SocialLoginButtons from "./components/SocialLoginButtons";
import Logo from "@/components/ui/Logo";

export const metadata = {
  title: "회원가입 | 최애멍냥",
};

export default function SignupPage() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-16 sm:py-24">
      <Link href="/" aria-label="최애멍냥 홈">
        <Logo className="h-14 sm:h-20 lg:h-24" />
      </Link>

      <div className="mt-10 w-full max-w-[32.5rem] sm:mt-14">
        <SignupForm />
        <SocialLoginButtons className="mt-3" />

        <p className="mt-10 text-center font-sans-400 text-sm text-gray-100">
          최애멍냥이 처음이신가요?
          <Link href="/login" className="ml-2 text-purple-button underline underline-offset-2">
            로그인하기
          </Link>
        </p>
      </div>
    </main>
  );
}
