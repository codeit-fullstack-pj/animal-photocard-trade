// 판매글에 걸린 교환 신청 목록을 보여주는 컴포넌트
const ExchangeListView = ({ sale, currentUser, isSeller }) => {
  // sale.exchanges: 이미 "이 판매글에 딸린 것만" 백엔드에서 걸러서 옴
  // 판매자면 전부 다 보여주고, 구매자(신청자)면 자기가 신청한 것만 보이게 필터링
  const saleExchanges = sale.exchanges.filter((exchange) => {
    if (isSeller) return true;
    return exchange.offerCard.owner.id === currentUser.id;
  });

  return (
    <div className="absolute right-[339px] top-[1450px] w-[1235px]">
      <div className="grid grid-cols-2 gap-6">
        {saleExchanges.map((exchange) => {
          // 신청자가 제시한 카드, 그 카드 주인(=신청자) — 이미 데이터 안에 다 포함되어 있음
          const offerCard = exchange.offerCard;
          const offerer = offerCard.owner;

          return (
            <div key={exchange.id} className="flex flex-col gap-2">
              {/* 신청 메시지 */}
              <div className="bg-gray-300 text-black text-sm text-center rounded-lg px-4 py-3">
                {exchange.message}
              </div>

              {/* 제시 카드 정보 */}
              <div className="bg-[#1a1a1f] rounded-xl overflow-hidden">
                <img
                  src={offerCard.image.imageUrl}
                  alt={offerCard.name}
                  className="w-full h-[180px] object-cover"
                />
                <div className="p-4">
                  <p className="text-sm font-semibold text-white mb-2">
                    {offerCard.tag} {offerCard.name}
                  </p>

                  {/* 카드 능력치 그래프 */}
                  {offerCard.image.score.axes.map((axis) => (
                    <div key={axis.field} className="flex items-center gap-2 text-xs mb-1">
                      <span className="w-16 text-gray-400">{axis.field}</span>
                      <div className="flex-1 h-1.5 bg-white rounded-full">
                        <div
                          className="h-1.5 bg-[#a656f5] rounded-full"
                          style={{ width: `${axis.value}%` }}
                        />
                      </div>
                      <span className="text-gray-400">{axis.value}%</span>
                    </div>
                  ))}

                  <p className="text-xs text-gray-400 mt-2">{offerCard.description}</p>
                </div>
              </div>

              {/* 신청자 닉네임 */}
              <p className="text-xs text-gray-400 text-right">from. {offerer.nickname}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExchangeListView;
