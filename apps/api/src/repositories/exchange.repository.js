//판매글에 해당하는 교환 제시건 찾기
export function findPendingExchangesWithOfferer(tx, saleId) {
  return tx.exchange.findMany({
    where: { saleId, status: "PENDING" },
    include: { offerCard: { select: { ownerId: true } } },
  });
}
//판매글에 해당하는 교환 일괄 거절
export function rejectPendingExchanges(tx, saleId) {
  return tx.exchange.updateMany({
    where: { saleId, status: "PENDING" },
    data: { status: "REJECTED", respondedAt: new Date() },
  });
}
