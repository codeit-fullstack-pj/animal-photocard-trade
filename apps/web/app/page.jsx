import CtaSection from "@/components/landing/CtaSection";
import HeroSection from "@/components/landing/HeroSection";
import NotificationSection from "@/components/landing/NotificationSection";
import PointSection from "@/components/landing/PointSection";
import RandomBoxSection from "@/components/landing/RandomBoxSection";
import AppHeader from "@/components/ui/AppHeader";
import "./landing.css";

export default function Home() {
  return (
    // data-page="landing": landing.css의 랜딩 전용 스타일(화면 비례 글자 크기 등)을 켜는 표시
    <div data-page="landing" className="flex flex-1 flex-col overflow-x-clip">
      <AppHeader />
      <main className="flex-1">
        <HeroSection />
        <PointSection />
        <NotificationSection />
        <RandomBoxSection />
        <CtaSection />
      </main>
    </div>
  );
}
