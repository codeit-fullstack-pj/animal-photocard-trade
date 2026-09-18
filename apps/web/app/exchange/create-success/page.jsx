import TradeResultView from "@/components/trade/TradeResultView";
import RequireAuth from "@/components/auth/RequireAuth";

export default async function ExchangeCreateSuccessPage({ searchParams }) {
  const { name } = await searchParams;

  return (
    <RequireAuth>
      <TradeResultView kind="exchange" variant="success" name={name} />
    </RequireAuth>
  );
}
