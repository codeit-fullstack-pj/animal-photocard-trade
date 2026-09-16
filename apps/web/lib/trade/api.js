import { apiFetch } from "@/lib/api-client";
import { mockCards } from "@/mocks/cards";
import { mockExchanges } from "@/mocks/exchanges";

//POST /salse/{saleId}/exchanges
export function createExchangeProposal(saleId, { offerCardId, message }) {
  return apiFetch(`/sales/${saleId}/exchanges`, {
    method: "POST",
    body: { offerCardId, message },
  });
}

// POST /sales/{saleId}/purchase
export async function purchaseCard(saleId) {
  return apiFetch(`/sales/${saleId}/purchase`, {
    method: "POST",
  });
}

//GET /sales/{saleId}/exchanges
export async function getSaleExchanges(saleId) {
  //mock으로 채워놓고 추후 fetch로 변경
  await new Promise((resolve) => setTimeout(resolve, 300));

  return mockExchanges
    .filter((exchange) => exchange.saleId === saleId)
    .map((exchange) => ({
      ...exchange,
      offerCard: mockCards.find((card) => card.id === exchange.offerCardId),
    }));
}

//POST /exchanges/{exchangeId}/cancel
export function cancelExchangeProposal(exchangeId) {
  return apiFetch(`/exchanges/${exchangeId}/cancel`, {
    method: "POST",
  });
}
