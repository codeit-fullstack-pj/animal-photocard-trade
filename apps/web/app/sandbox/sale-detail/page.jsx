import AppHeader from "@/components/ui/AppHeader";
import { mockSales } from "@/mocks/sales.js";
import { mockUsers } from "@/mocks/users.js";

import SaleDetailSandbox from "./SaleDetailSandbox";

// 임시 확인용 라우트. 교환 제시 모달을 폭별로 열어보려고 만든 것이고, 확인이 끝나면 지운다.
export default function SaleDetailSandboxPage() {
  // 판매자가 user-001인 판매글 + 다른 사람(user-002)을 현재 사용자로 둬서 구매자 시점이 나온다
  const sale = mockSales[0];
  const currentUser = mockUsers[1];

  return (
    <>
      <AppHeader />
      <SaleDetailSandbox sale={sale} currentUser={currentUser} />
    </>
  );
}
