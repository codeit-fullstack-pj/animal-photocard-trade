import SaleDetailView from "@/components/trade/SaleDetailView";
import AppHeader from "@/components/ui/AppHeader";
import MobileHeader from "@/components/ui/MobileHeader";
import { mockSales } from "@/mocks/sales.js";
import { mockUsers } from "@/mocks/users.js";
import { notFound } from "next/navigation";

// TODO: GET /sales/:saleId 가 생기면 mock 대신 실제 판매글을 불러온다.
// 현재 사용자도 그때 useCurrentUser 로 바꾼다. ?as=seller 는 그때까지 쓰는 임시 전환이다.
export default async function SaleDetailPage({ params, searchParams }) {
  const { id } = await params;
  const { as } = await searchParams;

  const sale = mockSales.find((item) => item.id === id);
  if (!sale) notFound();

  const currentUser = as === "seller" ? mockUsers[0] : mockUsers[1];

  return (
    <>
      {/* 모바일은 목록으로 돌아가는 뒤로가기 헤더, 태블릿부터는 전역 헤더 */}
      <div className="tablet:hidden">
        <MobileHeader title="마켓플레이스" backHref="/market" />
      </div>
      <div className="hidden tablet:block">
        <AppHeader />
      </div>
      <SaleDetailView sale={sale} currentUser={currentUser} />
    </>
  );
}
