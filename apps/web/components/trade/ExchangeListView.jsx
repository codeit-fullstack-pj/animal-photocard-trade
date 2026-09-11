import { mockExchanges } from "@/mocks/exchanges.js";
import { mockCards } from "@/mocks/cards.js";
import { mockUsers } from "@/mocks/users.js";

const ExchangeListView = ({ sale, currentUser, isSeller }) => {
  const saleExchanges = mockExchanges.filter((exchange) => {
    if (exchange.saleId !== sale.id) return false;

    if (isSeller) return true;

    const offerCard = mockCards.find((c) => c.id === exchange.offerCardId);
    return offerCard.ownerId === currentUser.id;
  });

  return (
    <div className="absolute right-[339px] top-[1450px] w-[1235px]">
      <div className="grid grid-cols-2 gap-6">
        {saleExchanges.map((exchange) => {
          const offerCard = mockCards.find((c) => c.id === exchange.offerCardId);
          const offerer = mockUsers.find((u) => u.id === offerCard.ownerId);

          return (
            <div key={exchange.id} className="flex flex-col gap-2">
              {/* 메시지 말풍선 */}
              <div className="bg-gray-300 text-black text-sm text-center rounded-lg px-4 py-3">
                {exchange.message}
              </div>

              {/* 카드 박스 */}
              <div className="bg-[#1a1a1f] rounded-xl overflow-hidden">
                <img
                  src={offerCard.imageUrl}
                  alt={offerCard.name}
                  className="w-full h-[180px] object-cover"
                />
                <div className="p-4">
                  <p className="text-sm font-semibold text-white mb-2">
                    {offerCard.tag} {offerCard.name}
                  </p>

                  {offerCard.score.axes.map((axis) => (
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

              {/* from 닉네임 */}
              <p className="text-xs text-gray-400 text-right">from. {offerer.nickname}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExchangeListView;
