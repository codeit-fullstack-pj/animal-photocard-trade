import TradeResultView from "@/components/trade/TradeResultView";
import RequireAuth from "@/components/auth/RequireAuth";

export default async function PurchaseSuccessPage({ searchParams }) {
  const { name } = await searchParams;

  return (
    <RequireAuth>
      <TradeResultView kind="purchase" variant="success" name={name} />
    </RequireAuth>
  );
}
