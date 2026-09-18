import { Noto_Sans_KR } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

const baskinRobbins = localFont({
  src: [
    { path: "./fonts/BaskinRobbins-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/BaskinRobbins-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-baskin-robbins",
  display: "swap",
});

export const metadata = {
  title: "최애멍냥",
  description: "동물 관상 평가 + 포토카드 거래",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ko"
      className={`${notoSansKr.variable} ${baskinRobbins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
