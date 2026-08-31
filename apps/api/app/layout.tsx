import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "animal-photocard-trade API",
  description: "동물 관상 평가 + 포토카드 거래 API 서버",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
