import TradeResultView from "@/components/trade/TradeResultView";

export default async function PurchaseSuccessPage({ searchParams }) {
  const { name } = await searchParams;

  return <TradeResultView kind="purchase" variant="success" name={name} />;
}
