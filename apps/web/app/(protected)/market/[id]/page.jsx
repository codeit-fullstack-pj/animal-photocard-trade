import SaleDetailView from "@/components/trade/SaleDetailView";
import AppHeader from "@/components/ui/AppHeader";
import MobileHeader from "@/components/ui/MobileHeader";
import { getSale } from "@/lib/sales/api";
import { notFound } from "next/navigation";

export default async function SaleDetailPage({ params }) {
  const { id } = await params;

  let sale;
  try {
    sale = await getSale(id);
  } catch (error) {
    if (error?.status === 404) notFound();
    throw error;
  }

  return (
    <>
      {/* 모바일은 목록으로 돌아가는 뒤로가기 헤더, 태블릿부터는 전역 헤더 */}
      <div className="tablet:hidden">
        <MobileHeader title="마켓플레이스" backHref="/market" />
      </div>
      <div className="hidden tablet:block">
        <AppHeader />
      </div>
      <SaleDetailView sale={sale} />
    </>
  );
}
