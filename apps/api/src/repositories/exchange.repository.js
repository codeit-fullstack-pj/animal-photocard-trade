import { prisma } from "../lib/prisma.js";

//판매글에 해당하는 교환 제시건 찾기
export function findPendingExchangesWithOfferer(tx, saleId) {
  return tx.exchange.findMany({
    where: { saleId, status: "PENDING" },
    include: { offerCard: { select: { ownerId: true } } },
  });
}

//판매글에 해당하는 교환 일괄 거절
export function rejectPendingExchanges(tx, saleId, respondedAt = new Date()) {
  return tx.exchange.updateManyAndReturn({
    where: { saleId, status: "PENDING" },
    data: { status: "REJECTED", respondedAt },
    select: { id: true, offerCard: { select: { ownerId: true } } },
  });
}

// 판매글 자체가 내려갈 때(cancelSale), 그 판매글에 걸린 교환 제시를 일괄 취소
export function cancelPendingExchanges(tx, saleId) {
  return tx.exchange.updateMany({
    where: { saleId, status: "PENDING" },
    data: { status: "CANCELED", respondedAt: new Date() },
  });
}

// 교환 제시(createExchange) 트랜잭션 전용
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

// 교환 제시 취소(cancelExchange) 트랜잭션 전용
// 제시자 본인의 PENDING 제시만 CANCELED로. 조건을 WHERE에 넣어 조회 없이 한 번에 처리
export function cancelExchangeIfPending(tx, { exchangeId, offererId }) {
  return tx.exchange.updateMany({
    where: { id: exchangeId, status: "PENDING", offerCard: { ownerId: offererId } },
    data: { status: "CANCELED" },
  });
}

// 알림에 쓸 판매글 작성자 id 조회
export function findExchangeById(tx, exchangeId) {
  return tx.exchange.findUnique({
    where: { id: exchangeId },
    include: {
      sale: { select: { id: true, sellerId: true } },
    },
  });
}

// 취소 실패 원인을 구분하기 위한 조회
export function findMyExchangeById(tx, { exchangeId, offererId }) {
  return tx.exchange.findFirst({
    where: { id: exchangeId, offerCard: { ownerId: offererId } },
  });
}

// 교환 제시 목록 조회(listExchanges) 전용
// 판매글의 PENDING 제시 조회. offererId가 있으면 그 사람이 낸 제시만 조회.
export function findPendingExchangesBySaleId({ saleId, offererId }) {
  return prisma.exchange.findMany({
    where: {
      saleId,
      status: "PENDING",
      ...(offererId && { offerCard: { ownerId: offererId } }),
    },
    select: {
      id: true,
      status: true,
      message: true,
      createdAt: true,
      respondedAt: true,
      offerCard: {
        select: {
          id: true,
          name: true,
          tag: true,
          description: true,
          filterType: true,
          owner: { select: { id: true, nickname: true } },
          image: { select: { imageUrl: true, category: true, score: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

//교환 수락을 위한 조회 함수 (판매ID 및 판매자 정보 포함)
export function findExchangeForAccept(tx, exchangeId) {
  return tx.exchange.findUnique({
    where: { id: exchangeId },
    select: {
      id: true,
      status: true,
      saleId: true,
      offerCardId: true,
      sale: {
        select: {
          sellerId: true,
          cardId: true,
        },
      },
    },
  });
}

//교환 거절을 위한 조회 함수 (판매자 확인, 제시자 알림 정보 포함)
export function findExchangeForReject(tx, exchangeId) {
  return tx.exchange.findUnique({
    where: { id: exchangeId },
    select: {
      id: true,
      saleId: true,
      offerCard: { select: { ownerId: true } },
      sale: {
        select: {
          sellerId: true,
          card: { select: { tag: true, name: true } },
        },
      },
    },
  });
}

//교환 업데이트
export function updateExchangeIfPending(tx, exchangeId, status, respondedAt) {
  return tx.exchange.updateMany({
    where: { id: exchangeId, status: "PENDING" },
    data: { status, respondedAt },
  });
}
