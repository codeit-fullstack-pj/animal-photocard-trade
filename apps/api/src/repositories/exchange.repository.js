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

// 아래는 교환 제시(createExchange) 트랜잭션 전용

// 이 카드로 status가 PENDING인 Exchange가 있는지 (claim 확인의 나머지 절반)
export function findPendingExchangeByOfferCardId(tx, offerCardId) {
  return tx.exchange.findFirst({ where: { offerCardId, status: "PENDING" } });
}

// 새 교환 제시 INSERT. 중복은 여기서 안 걸러내고 부분 유니크 인덱스(P2002)가 최종 방어한다
export function createExchange(tx, { saleId, offerCardId, message }) {
  return tx.exchange.create({
    data: { saleId, offerCardId, message },
    select: { id: true, status: true, createdAt: true },
  });
}
