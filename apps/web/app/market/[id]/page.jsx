import SaleDetailView from "@/components/trade/SaleDetailView";
import RequireAuth from "@/components/auth/RequireAuth";
import AppHeader from "@/components/ui/AppHeader";
import MobileHeader from "@/components/ui/MobileHeader";
import { getSale } from "@/lib/sales/api";
import { mockUsers } from "@/mocks/users.js";
import { notFound } from "next/navigation";

// TODO: 로그인이 붙으면 currentUser를 실제 로그인 사용자로 바꾼다. ?as=seller는 그때까지 쓰는 임시 전환이다.
export default async function SaleDetailPage({ params, searchParams }) {
  const { id } = await params;
  const { as } = await searchParams;

  let sale;
  try {
    sale = await getSale(id);
  } catch (error) {
    if (error?.status === 404) notFound();
    throw error;
  }

  const currentUser = as === "seller" ? mockUsers[0] : mockUsers[1];

  return (
    <RequireAuth>
      {/* 모바일은 목록으로 돌아가는 뒤로가기 헤더, 태블릿부터는 전역 헤더 */}
      <div className="tablet:hidden">
        <MobileHeader title="마켓플레이스" backHref="/market" />
      </div>
      <div className="hidden tablet:block">
        <AppHeader />
      </div>
      <SaleDetailView sale={sale} currentUser={currentUser} />
    </RequireAuth>
  );
}
