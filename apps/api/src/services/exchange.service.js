import { ApiError } from "../lib/api-error.js";
import { prisma } from "../lib/prisma.js";
import * as exchangeRepository from "../repositories/exchange.repository.js";
import * as notificationRepository from "../repositories/notification.repository.js";
import * as cardRepository from "../repositories/card.repository.js";
import * as saleRepository from "../repositories/sale.repository.js";

//교환 제시 취소하기
export async function cancelExchange({ exchangeId, offerer }) {
  return prisma.$transaction(async (tx) => {
    //교환 취소 처리
    const canceled = await exchangeRepository.cancelExchangeIfPending(tx, {
      exchangeId,
      offererId: offerer.id,
    });
    if (canceled.count === 0) {
      const found = await exchangeRepository.findMyExchangeById(tx, {
        exchangeId,
        offererId: offerer.id,
      });
      if (found) throw new ApiError(409, "EXCHANGE_NOT_PENDING", "이미 처리된 교환 제시입니다.");
      throw new ApiError(404, "EXCHANGE_NOT_FOUND", "교환 제시를 찾을 수 없습니다.");
    }

    //취소된 교환 조회
    const exchange = await exchangeRepository.findExchangeById(tx, exchangeId);
    //취소 알람 생성
    await notificationRepository.createManyNotifications(tx, [
      {
        userId: exchange.sale.sellerId,
        type: "EXCHANGE_CANCELED_BY_OFFERER",
        content: `${offerer.nickname}님이 교환 제시를 취소했습니다`,
        targetId: exchange.sale.id,
      },
    ]);
    return {
      exchangeId,
      status: exchange.status,
    };
  });
}

//판매자 입장에서 제안자의 교환 수락을 누르는 순간
export async function acceptExchange({ exchangeId, seller }) {
  return prisma.$transaction(async (tx) => {
    //교환건의 존재 여부, 수락 권한 체크
    const exchange = await exchangeRepository.findExchangeForAccept(tx, exchangeId);

    if (!exchange) throw new ApiError(404, "EXCHANGE_NOT_FOUND", "교환 제시를 찾을 수 없습니다.");
    if (exchange.sale.sellerId !== seller.id)
      throw new ApiError(403, "FORBIDDEN", "해당 교환 제시를 수락할 권한이 없습니다.");

    //카드 정렬 및 순차 잠금
    const cardIds = [exchange.offerCardId, exchange.sale.cardId].sort((a, b) => a.localeCompare(b));
    for (const cardId of cardIds) {
      await cardRepository.lockCardForUpdate(tx, cardId);
    }
    //판매글 잠금
    await saleRepository.lockSaleForUpdate(tx, exchange.saleId);
    //변경될 판매글에 대한 최신 상태 보장
    const sale = await saleRepository.findSaleById(tx, exchange.saleId);

    if (!sale) {
      throw new ApiError(404, "SALE_NOT_FOUND", "판매글을 찾을 수 없습니다.");
    }
    //카드에 대한 최신 상태 보장
    const offerCard = await cardRepository.findCardById(tx, exchange.offerCardId);
    if (!offerCard) throw new ApiError(404, "CARD_NOT_FOUND", "제시 카드를 찾을 수 없습니다.");

    if (offerCard.ownerId === seller.id)
      throw new ApiError(409, "SELF_EXCHANGE_NOT_ALLOWED", "자신의 카드와 교환할 수 없습니다.");

    //판매글 솔드아웃 처리
    const saleUpdate = {
      status: "SOLD_OUT",
      closedAt: new Date(),
    };
    const closed = await saleRepository.closeSaleIfOnSale(tx, exchange.saleId, saleUpdate);
    if (closed.count === 0)
      throw new ApiError(409, "SALE_NOT_ON_SALE", "판매가 종료된 판매글입니다.");

    //교환 수락 처리
    const respondedAt = new Date();
    const accepted = await exchangeRepository.acceptExchangeIfPending(tx, exchangeId, respondedAt);
    if (accepted.count !== 1) {
      throw new ApiError(409, "EXCHANGE_ALREADY_PROCESSED", "이미 처리된 교환 제시입니다.");
    }

    //카드 소유권 이전
    const transfers = [
      {
        cardId: sale.cardId,
        fromOwnerId: seller.id,
        toOwnerId: offerCard.ownerId,
        errorCode: "SALE_CARD_OWNER_CHANGED",
        errorMessage: "판매 카드의 소유권을 이전할 수 없습니다.",
      },
      {
        cardId: exchange.offerCardId,
        fromOwnerId: offerCard.ownerId,
        toOwnerId: seller.id,
        errorCode: "OFFER_CARD_OWNER_CHANGED",
        errorMessage: "제시 카드의 소유권을 이전할 수 없습니다.",
      },
    ];

    for (const transfer of transfers) {
      const result = await cardRepository.transferCardOwner(
        tx,
        transfer.cardId,
        transfer.fromOwnerId,
        transfer.toOwnerId,
      );

      if (result.count !== 1) {
        throw new ApiError(409, transfer.errorCode, transfer.errorMessage);
      }
    }

    const rejectedExchanges = await exchangeRepository.rejectPendingExchanges(
      tx,
      exchange.saleId,
      respondedAt,
    );

    await notificationRepository.createManyNotifications(tx, [
      {
        userId: offerCard.ownerId,
        type: "EXCHANGE_ACCEPTED",
        content: `'${sale.card.tag} ${sale.card.name}'에 제안한 교환이 수락되었습니다`,
        targetId: exchange.saleId,
      },
      ...rejectedExchanges.map((rejected) => ({
        userId: rejected.offerCard.ownerId,
        type: "EXCHANGE_REJECTED_BY_ACCEPT",
        content: `'${sale.card.tag} ${sale.card.name}'에 제안한 교환이 거절되었습니다.`,
        targetId: exchange.saleId,
      })),
    ]);
    return {
      id: exchangeId,
      status: "ACCEPTED",
      respondedAt,
    };
  });
}
