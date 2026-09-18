import TradeResultView from "@/components/trade/TradeResultView";

export default async function PurchaseFailPage({ searchParams }) {
  const { code, name } = await searchParams;

  // TODO: code별 실패 사유 문구는 TradeResultView 안에서 분기해서 넣을 예정.
  // 지금은 화면에 표시하지 않고 읽어서 넘기기만 한다.
  return <TradeResultView kind="purchase" variant="fail" errorCode={code} name={name} />;
}
