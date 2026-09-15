import SellerActionButtons from "./SellerActionButtons.jsx";
import BuyerActionButtons from "./BuyerActionButtons.jsx";
import ExchangeListView from "./ExchangeListView.jsx";
import Link from "next/link";

// 판매글 상세 화면 — 판매자 본인이면 SellerActionButtons(수정/캔슬), 아니면 BuyerActionButtons를 보여줌
const SaleDetailView = ({ sale, currentUser }) => {
  // 지금 보고 있는 사람이 이 판매글의 판매자인지 판별
  const isSeller = currentUser.id === sale.seller.id;

  return (
    <main className="relative w-[1920px] min-h-[2185px] bg-[#161616] text-white">
      <div className="absolute left-[340px] top-[140px]">
        <Link href="/marketplace" className="text-2xl text-gray-300">
          마켓플레이스
        </Link>

        <h1 className="text-[40px] font-bold text-white mt-[60px]">{sale.card.tag}</h1>

        <h1 className="text-[40px] font-bold text-white mt-[20px]">{sale.card.name}</h1>
      </div>
      <p className="absolute right-[340px] top-[340px] text-white">by {sale.seller.nickname}</p>

      {/* 카드 이미지 박스 - mono gradient 테두리 */}
      <div className="absolute left-[341px] top-[400px] w-[800px] h-[800px] rounded-[24px] p-[2px] bg-gradient-to-br from-white via-gray-400 to-gray-700">
        <div className="w-full h-full rounded-[22px] bg-[#1a1a1f]" />
      </div>

      {/* 설명 */}
      <p className="absolute left-[1181px] top-[405px] w-[400px] text-sm text-gray-300 leading-relaxed">
        {sale.description}
      </p>

      {/* 구분선 */}
      <div className="absolute right-[339px] top-[553px] w-[400px] h-[1px] bg-white" />

      {/* 구매 포인트 */}
      <div className="absolute left-[1181px] top-[593px] w-[400px] flex items-center justify-between">
        <span className="text-sm text-white">구매 포인트</span>
        <span className="text-lg font-bold">{sale.price} 🪙</span>
      </div>

      {/* 교환희망여부 */}
      <div className="absolute left-[1181px] top-[643px] w-[400px] flex items-center gap-[273px]">
        <span className="text-sm text-white">교환희망여부</span>
        <input
          type="checkbox"
          checked={sale.canExchange}
          readOnly
          className="accent-gray-300 w-4 h-4"
        />
      </div>

      {/* 버튼 — isSeller에 따라 판매자용/구매자용 버튼을 다르게 렌더링 */}
      <div className="absolute left-[1181px] top-[1020px] w-[400px] flex flex-col gap-2 items-end">
        {isSeller ? <SellerActionButtons sale={sale} /> : <BuyerActionButtons sale={sale} />}
      </div>
      <div className="absolute right-[339px] top-[1350px] w-[1235px] flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">교환 제시 목록</h2>
        <p className="text-sm text-gray-400">교환하실 카드를 눌러 교환할 수 있습니다</p>
      </div>
      <div className="absolute right-[339px] top-[1400px] w-[1235px] h-[1px] bg-white" />

      {/* 교환 신청 목록 (판매자면 전체, 구매자면 자기 신청만 보이도록 isSeller를 넘겨줌) */}
      <ExchangeListView sale={sale} currentUser={currentUser} isSeller={isSeller} />
    </main>
  );
};

export default SaleDetailView;
