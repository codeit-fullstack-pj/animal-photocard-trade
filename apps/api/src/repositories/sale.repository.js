//판매글 존재 여부 조회
export function findSaleById(tx, id) {
  return tx.sale.findUnique({ where: { id }, include: { card: true } });
}

//(판매 중인지 검증) -> 판매글 마감
export function closeSaleIfOnSale(tx, id, { status, closedAt }) {
  return tx.sale.updateMany({
    where: { id, status: "ON_SALE" },
    data: { status, closedAt },
  });
}
