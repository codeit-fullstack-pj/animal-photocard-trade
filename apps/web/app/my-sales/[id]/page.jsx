import SaleDetailView from "@/components/trade/SaleDetailView";
import { mockSales } from "@/mocks/sales.js";
import { mockUsers } from "@/mocks/users.js";

const MySalesPage = async ({ params }) => {
  const { id } = await params;
  const sale = mockSales.find((s) => s.id === id);
  const currentUser = mockUsers[0]; // mockUsers[1]로 바꾸면 구매자 화면

  return <SaleDetailView sale={sale} currentUser={currentUser} />;
};

export default MySalesPage;
