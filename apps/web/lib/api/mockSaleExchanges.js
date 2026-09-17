import { mockCards } from "@/mocks/cards";
import { mockExchanges } from "@/mocks/exchanges";
import { mockUsers } from "@/mocks/users";

// GET /sales/:saleId/exchanges 응답 모양을 그대로 흉내 낸다 (sale.service.js 의 toExchangeResponse).
// 상세 페이지가 mock 판매글로 도는 동안만 쓰고, 실제 API 를 붙이면 지운다.
export function getMockSaleExchanges(saleId) {
  return mockExchanges
    .filter((exchange) => exchange.saleId === saleId && exchange.status === "PENDING")
    .map((exchange) => {
      const offerCard = mockCards.find((card) => card.id === exchange.offerCardId);
      const offerer = mockUsers.find((user) => user.id === offerCard.ownerId);

      return {
        id: exchange.id,
        status: exchange.status,
        message: exchange.message,
        createdAt: exchange.createdAt,
        respondedAt: exchange.respondedAt,
        offerer: {
          id: offerer?.id,
          nickname: offerer?.nickname,
        },
        offerCard: {
          id: offerCard.id,
          name: offerCard.name,
          tag: offerCard.tag,
          description: offerCard.description,
          filterType: offerCard.filterType,
          imageUrl: offerCard.imageUrl,
          category: offerCard.category,
          score: offerCard.score,
        },
      };
    });
}
