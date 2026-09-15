import { Prisma } from "@prisma/client";

import { ApiError } from "../lib/api-error.js";
import { prisma } from "../lib/prisma.js";
import * as cardRepository from "../repositories/card.repository.js";
import * as exchangeRepository from "../repositories/exchange.repository.js";
import * as notificationRepository from "../repositories/notification.repository.js";
import * as saleRepository from "../repositories/sale.repository.js";
import * as userRepository from "../repositories/user.repository.js";

// 조회한 판매 데이터를 API 응답 형식으로 변환
export async function getSales({
  category,
  keyword,
  soldOut,
  status,
  sellerId,
  orderBy,
  cursor,
  limit = 20,
}) {
  const sales = await saleRepository.findSales({
    category,
    keyword,
    soldOut,
    status,
    sellerId,
    orderBy,
    cursor,
    limit,
  });

  // 요청한 개수보다 1개 더 조회됐으면 다음 페이지가 존재
  const hasNextPage = sales.length > limit;

  // 실제 응답에는 요청한 개수만 포함
  const pageSales = hasNextPage ? sales.slice(0, limit) : sales;

  // 다음 페이지가 있으면 현재 페이지의 마지막 판매글 ID를 cursor로 사용
  const nextCursor = hasNextPage ? pageSales[pageSales.length - 1].id : null;

  const lists = pageSales.map((sale) => {
    const hasPendingExchange = sale.exchanges.length > 0;

    return {
      id: sale.id,

      card: {
        id: sale.card.id,
        name: sale.card.name,
        tag: sale.card.tag,
        score: sale.card.image.score,
        image: sale.card.image.imageUrl,
        filterType: sale.card.filterType,
        category: sale.card.image.category,
      },

      seller: {
        id: sale.seller.id,
        nickname: sale.seller.nickname,
      },

      description: sale.description,
      canExchange: sale.canExchange,

      // Prisma의 BigInt는 JSON으로 바로 반환할 수 없어 숫자로 변환
      price: Number(sale.price),

      // 판매 중이면서 대기 중인 교환 신청이 있으면 응답에서 ON_EXCHANGE로 표시
      status: sale.status === "ON_SALE" && hasPendingExchange ? "ON_EXCHANGE" : sale.status,

      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
      closedAt: sale.closedAt,
    };
  });

  return {
    lists,
    nextCursor,
  };
}

/**
 * 구매 트랜잭션 처리 순서
 * CARD LOCK / SALE → USER → CARD → EXCHANGE → NOTIFICATION
 * 판매글 마감 → 포인트 정산 → 카드 소유권 이전 → 교환 제시 정리 → 알림 생성
 */
export async function purchaseCard({ saleId, buyer }) {
  const { id: buyerId, nickname: buyerNickname } = buyer;

  return prisma.$transaction(async (tx) => {
    //선 검증 fail fast [판매글 존재 여부, 구매자와 판매자 일치 여부]
    const sale = await saleRepository.findSaleById(tx, saleId);

    if (!sale) {
      throw new ApiError(404, "SALE_NOT_FOUND", "판매글을 찾을 수 없습니다.");
    }

    if (sale.sellerId === buyerId) {
      throw new ApiError(403, "SELF_PURCHASE_NOT_ALLOWED", "자신의 판매글은 구매할 수 없습니다.");
    }

    // 동일 카드에 대한 동시 교환 또는 구매를 방지
    await cardRepository.lockCardForUpdate(tx, sale.cardId);

    // 판매 중인 판매글을 판매 완료 상태로 변경
    const saleUpdate = {
      status: "SOLD_OUT",
      closedAt: new Date(),
    };

    const closed = await saleRepository.closeSaleIfOnSale(tx, saleId, saleUpdate);

    if (closed.count === 0) {
      throw new ApiError(409, "SALE_NOT_ON_SALE", "판매가 종료된 판매글입니다.");
    }

    // 사용자 ID 순서로 처리하여 포인트 정산 과정의 데드락을 방지
    const tasks = [{ userId: buyerId, isBuyer: true }, { userId: sale.sellerId }].sort((a, b) =>
      a.userId < b.userId ? -1 : 1,
    );

    let buyerUpdateResult;

    // 구매자의 포인트를 차감하고 판매자의 포인트를 증가
    for (const task of tasks) {
      const result = task.isBuyer
        ? await userRepository.deductPointIfEnough(tx, task.userId, sale.price)
        : await userRepository.increasePoint(tx, task.userId, sale.price);

      if (task.isBuyer) {
        buyerUpdateResult = result;
      }
    }

    if (buyerUpdateResult.count === 0) {
      throw new ApiError(409, "INSUFFICIENT_POINT", "보유 포인트가 부족합니다.");
    }

    // 판매자에게서 구매자로 카드 소유권을 이전
    const transferred = await cardRepository.transferCardOwner(
      tx,
      sale.cardId,
      sale.sellerId,
      buyerId,
    );

    if (transferred.count === 0) {
      throw new ApiError(409, "CARD_OWNER_CHANGED", "카드 소유자가 변경되어 구매할 수 없습니다.");
    }

    // 남아 있는 대기 중 교환 제안을 조회하고 거절 상태로 변경
    const pendingExchanges = await exchangeRepository.findPendingExchangesWithOfferer(tx, saleId);
    await exchangeRepository.rejectPendingExchanges(tx, saleId);

    // 교환 취소와 판매 완료 알림을 생성
    await notificationRepository.createManyNotifications(tx, [
      ...pendingExchanges.map((exchange) => ({
        userId: exchange.offerCard.ownerId,
        type: "SALE_SOLDOUT_EXCHANGE",
        content: `'${sale.card.tag} ${sale.card.name}'에 제안한 교환이 취소되었습니다`,
        targetId: null,
      })),
      {
        userId: sale.sellerId,
        type: "SALE_SOLD",
        content: `${buyerNickname}님이 '${sale.card.tag} ${sale.card.name}'을 구매했습니다 `,
        targetId: saleId,
      },
    ]);

    return {
      saleId,
      ...saleUpdate,
    };
  });
}

/**
 * 판매글에 자신의 카드로 교환을 제시한다.
 * @param {{ saleId: string, offerCardId: string, message: string|undefined,
 *           offerer: { id: string, nickname: string } }} params
 * @returns {Promise<{ exchangeId: string, status: string, createdAt: Date }>}
 */
export async function createExchange({ saleId, offerCardId, message, offerer }) {
  return prisma.$transaction(async (tx) => {
    // 잠그기 전 fail fast. 아래에서 한번 더 검증
    const saleExists = await saleRepository.findSaleById(tx, saleId);
    if (!saleExists) throw new ApiError(404, "SALE_NOT_FOUND", "판매글을 찾을 수 없습니다.");
    const offerCardExists = await cardRepository.findCardById(tx, offerCardId);
    if (!offerCardExists) throw new ApiError(404, "CARD_NOT_FOUND", "카드를 찾을 수 없습니다.");

    //CARD LOCK : 제안카드에 대해서만 잠금
    await cardRepository.lockCardForUpdate(tx, offerCardId);
    //SALE LOCK : 판매글에 대해서 잠금
    await saleRepository.lockSaleForUpdate(tx, saleId);

    // 잠근 뒤 다시 읽는다. 이제부터 트랜잭션이 끝날 때까지 유효한 값
    const sale = await saleRepository.findSaleById(tx, saleId);
    const offerCard = await cardRepository.findCardById(tx, offerCardId);

    //CARD
    if (offerCard.ownerId !== offerer.id)
      throw new ApiError(403, "NOT_CARD_OWNER", "본인 소유의 카드만 제시할 수 있습니다.");

    //SALE
    if (sale.sellerId === offerer.id)
      throw new ApiError(403, "SELF_EXCHANGE_NOT_ALLOWED", "자신의 판매글에는 제시할 수 없습니다.");
    if (sale.status !== "ON_SALE")
      throw new ApiError(409, "SALE_NOT_ON_SALE", "판매 중인 판매글이 아닙니다.");

    //CLAIM 정책 검증
    const onSale = await saleRepository.findOnSaleByCardId(tx, offerCardId);
    if (onSale) throw new ApiError(409, "CARD_ALREADY_CLAIMED", "이미 판매 중인 카드입니다.");
    const pendingExchange = await exchangeRepository.findPendingExchangeByOfferCardId(
      tx,
      offerCardId,
    );
    if (pendingExchange)
      throw new ApiError(409, "CARD_ALREADY_CLAIMED", "이미 교환 제시 중인 카드입니다.");

    //EXCHANGE 유니크 조회 및 생성 + 응답 교환 저장
    let exchange;
    try {
      exchange = await exchangeRepository.createExchange(tx, { saleId, offerCardId, message });
    } catch (error) {
      //보수적 방어
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
        throw new ApiError(409, "DUPLICATE_EXCHANGE", "이미 같은 카드로 제시한 교환이 있습니다.");
      throw error;
    }

    //NOTIFICATION
    await notificationRepository.createManyNotifications(tx, [
      {
        userId: sale.sellerId,
        type: "EXCHANGE_RECEIVED",
        content: `${offerer.nickname}님이 '${sale.card.tag} ${sale.card.name}'에 교환을 제시했습니다`,
        targetId: saleId,
      },
    ]);
    return {
      exchangeId: exchange.id,
      status: exchange.status,
      createdAt: exchange.createdAt,
    };
  });
}
