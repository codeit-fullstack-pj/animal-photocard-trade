import { Geist, Geist_Mono, Noto_Sans_KR } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Noto Sans KR — 본문용 토큰 (--font-body). 전역 적용은 별도 작업
const notoSansKr = Noto_Sans_KR({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
});

// 배스킨라빈스체 (BR) — 제목용
const baskinRobbins = localFont({
  src: [
    { path: "./fonts/BaskinRobbins-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/BaskinRobbins-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-heading",
  display: "swap",
});

export const metadata = {
  title: "animal-photocard-trade",
  description: "동물 관상 평가 + 포토카드 거래",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${baskinRobbins.variable} ${notoSansKr.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
