import { apiFetch } from "@/lib/api-client";

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
  const { exchanges } = await apiFetch(`/sales/${saleId}/exchanges`);
  return exchanges;
}

//POST /exchanges/{exchangeId}/cancel
export function cancelExchangeProposal(exchangeId) {
  return apiFetch(`/exchanges/${exchangeId}/cancel`, {
    method: "POST",
  });
}

// POST /exchanges/{exchangeId}/accept
export function acceptExchangeProposal(exchangeId) {
  return apiFetch(`/exchanges/${exchangeId}/accept`, {
    method: "POST",
  });
}

// POST /exchanges/{exchangeId}/reject
export function rejectExchangeProposal(exchangeId) {
  return apiFetch(`/exchanges/${exchangeId}/reject`, {
    method: "POST",
  });
}
