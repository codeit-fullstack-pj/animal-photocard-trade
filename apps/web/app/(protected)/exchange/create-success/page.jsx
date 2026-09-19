import TradeResultView from "@/components/trade/TradeResultView";

export default async function ExchangeCreateSuccessPage({ searchParams }) {
  const { name } = await searchParams;

  return <TradeResultView kind="exchange" variant="success" name={name} />;
}
