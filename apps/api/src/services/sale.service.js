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
  includeSoldOut,
  status,
  sellerId,
  offererId,
  orderBy,
  cursor,
  page,
  limit = 20,
}) {
  const [sales, totalCount] = await Promise.all([
    saleRepository.findSales({
      category,
      keyword,
      includeSoldOut,
      status,
      sellerId,
      offererId,
      orderBy,
      cursor,
      page,
      limit,
    }),

    saleRepository.countSales({
      category,
      keyword,
      includeSoldOut,
      status,
      sellerId,
      offererId,
    }),
  ]);

  // cursor 방식에서만 한 개 더 조회한 결과로 다음 페이지 존재 여부를 확인
  const hasNextPage = page === undefined && sales.length > limit;

  // 실제 응답에는 요청한 개수만 포함
  const pageSales = hasNextPage ? sales.slice(0, limit) : sales;

  // 다음 페이지가 있으면 현재 페이지의 마지막 판매글 ID를 cursor로 사용
  const nextCursor = hasNextPage ? pageSales[pageSales.length - 1].id : null;

  const lists = pageSales.map((sale) => {
    const hasPendingExchange = sale.exchanges.length > 0;

    // offererId로 조회했고 내가 이 판매글의 판매자는 아닌 경우 — 상대방 카드 대신
    // 내가 제시한 카드(offerCard)를 찾는다. 자기 판매글엔 제시할 수 없어 판매자·제시자는 겹치지 않는다
    const myOffer =
      offererId && sale.sellerId !== sellerId
        ? sale.exchanges.find((exchange) => exchange.offerCard.ownerId === offererId)
        : undefined;

    const card = myOffer
      ? {
          id: myOffer.offerCard.id,
          name: myOffer.offerCard.name,
          tag: myOffer.offerCard.tag,
          score: myOffer.offerCard.image.score,
          image: myOffer.offerCard.image.imageUrl,
          filterType: myOffer.offerCard.filterType,
          category: myOffer.offerCard.image.category,
        }
      : {
          id: sale.card.id,
          name: sale.card.name,
          tag: sale.card.tag,
          score: sale.card.image.score,
          image: sale.card.image.imageUrl,
          filterType: sale.card.filterType,
          category: sale.card.image.category,
        };

    return {
      id: sale.id,

      card,

      seller: {
        id: sale.seller.id,
        nickname: sale.seller.nickname,
      },

      description: sale.description,
      canExchange: sale.canExchange,

      // 내가 제시한 카드에는 가격이 없다 (내 소유 카드일 뿐 판매 대상이 아님).
      // Prisma의 BigInt는 JSON으로 바로 반환할 수 없어 숫자로 변환
      price: myOffer ? undefined : Number(sale.price),

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
    totalCount,

    ...(page !== undefined && {
      totalPages: Math.ceil(totalCount / limit),
    }),
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
 * 교환 제시 트랜잭션 처리순서
 * CARD LOCK → SALE LOCK
 * 교환 생성 → 알림 생성
 */
export async function createExchange({ saleId, offerCardId, message, offerer }) {
  return prisma.$transaction(async (tx) => {
    //선 검증 fail fast. 아래에서 한번 더 검증
    const saleExists = await saleRepository.findSaleById(tx, saleId);
    if (!saleExists) throw new ApiError(404, "SALE_NOT_FOUND", "판매글을 찾을 수 없습니다.");
    const offerCardExists = await cardRepository.findCardById(tx, offerCardId);
    if (!offerCardExists) throw new ApiError(404, "CARD_NOT_FOUND", "카드를 찾을 수 없습니다.");

    // 제안카드와 판매글 잠금
    await cardRepository.lockCardForUpdate(tx, offerCardId);
    await saleRepository.lockSaleForUpdate(tx, saleId);

    // 판매와 제안카드 여부 재조회
    const sale = await saleRepository.findSaleById(tx, saleId);
    const offerCard = await cardRepository.findCardById(tx, offerCardId);

    if (offerCard.ownerId !== offerer.id)
      throw new ApiError(403, "NOT_CARD_OWNER", "본인 소유의 카드만 제시할 수 있습니다.");
    if (sale.sellerId === offerer.id)
      throw new ApiError(403, "SELF_EXCHANGE_NOT_ALLOWED", "자신의 판매글에는 제시할 수 없습니다.");
    if (sale.status !== "ON_SALE")
      throw new ApiError(409, "SALE_NOT_ON_SALE", "판매 중인 판매글이 아닙니다.");

    // 이미 판매중이거나 교환 제시중인 카드 조회
    const onSale = await saleRepository.findOnSaleByCardId(tx, offerCardId);
    if (onSale) throw new ApiError(409, "CARD_ALREADY_CLAIMED", "이미 판매 중인 카드입니다.");
    const pendingExchange = await exchangeRepository.findPendingExchangeByOfferCardId(
      tx,
      offerCardId,
    );
    if (pendingExchange)
      throw new ApiError(409, "CARD_ALREADY_CLAIMED", "이미 교환 제시 중인 카드입니다.");

    // 교환 중복여부 조회 및 생성 및 저장
    let exchange;
    try {
      exchange = await exchangeRepository.createExchange(tx, { saleId, offerCardId, message });
    } catch (error) {
      //보수적 방어
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
        throw new ApiError(409, "DUPLICATE_EXCHANGE", "이미 같은 카드로 제시한 교환이 있습니다.");
      throw error;
    }

    //교환 제시 알림 생성
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

//교환 목록 조회 응답 모양
function toExchangeResponse(exchange) {
  const { offerCard } = exchange;

  return {
    id: exchange.id,
    status: exchange.status,
    message: exchange.message,
    createdAt: exchange.createdAt,
    respondedAt: exchange.respondedAt,
    offerer: {
      id: offerCard.owner.id,
      nickname: offerCard.owner.nickname,
    },
    offerCard: {
      id: offerCard.id,
      name: offerCard.name,
      tag: offerCard.tag,
      description: offerCard.description,
      filterType: offerCard.filterType,
      imageUrl: offerCard.image.imageUrl,
      category: offerCard.image.category,
      score: offerCard.image.score,
    },
  };
}
//판매글의 PENDING 교환 제시 목록을 조회
export async function listExchanges({ saleId, viewer }) {
  const sale = await saleRepository.findSaleSellerById(saleId);

  if (!sale) throw new ApiError(404, "SALE_NOT_FOUND", "판매글을 찾을 수 없습니다.");

  const isSeller = sale.sellerId === viewer.id;
  const exchanges = await exchangeRepository.findPendingExchangesBySaleId(
    isSeller ? { saleId } : { saleId, offererId: viewer.id },
  );
  return { exchanges: exchanges.map(toExchangeResponse) };
}

/**
 * 판매글 등록 트랜잭션 처리순서
 * CARD LOCK → 소유자 확인 → 중복 판매/교환 제시 확인 → 판매글 생성
 */
export async function createSale({ cardId, sellerId, description, canExchange, price }) {
  return prisma.$transaction(async (tx) => {
    const card = await cardRepository.findCardById(tx, cardId);
    if (!card) throw new ApiError(404, "CARD_NOT_FOUND", "카드를 찾을 수 없습니다.");

    await cardRepository.lockCardForUpdate(tx, cardId);

    if (card.ownerId !== sellerId) {
      throw new ApiError(403, "NOT_CARD_OWNER", "본인 소유의 카드만 판매할 수 있습니다.");
    }

    const onSale = await saleRepository.findOnSaleByCardId(tx, cardId);
    if (onSale) throw new ApiError(409, "CARD_ALREADY_CLAIMED", "이미 판매 중인 카드입니다.");

    const pendingExchange = await exchangeRepository.findPendingExchangeByOfferCardId(tx, cardId);
    if (pendingExchange) {
      throw new ApiError(409, "CARD_ALREADY_CLAIMED", "이미 교환 제시 중인 카드입니다.");
    }

    const sale = await saleRepository.createSale(tx, {
      cardId,
      sellerId,
      description,
      canExchange,
      price,
    });

    return {
      id: sale.id,
      status: sale.status,
      createdAt: sale.createdAt,
    };
  });
}

// 판매글 조회: 존재하지 않으면 404 에러, 있으면 그대로 반환
export async function getSaleById(id) {
  const sale = await saleRepository.findSaleWithExchangesById(id);
  if (!sale) {
    throw new ApiError(404, "SALE_NOT_FOUND", "판매글을 찾을 수 없습니다.");
  }

  // getSales(목록)와 동일하게, card는 image 관계를 평평하게 편 응답 형태로 변환한다
  // (exchanges[].offerCard는 프론트가 그대로 중첩 구조를 기대해서 raw 그대로 둔다)
  const hasPendingExchange = sale.exchanges.some((exchange) => exchange.status === "PENDING");

  return {
    id: sale.id,
    card: {
      id: sale.card.id,
      name: sale.card.name,
      tag: sale.card.tag,
      description: sale.card.description,
      score: sale.card.image.score,
      image: sale.card.image.imageUrl,
      filterType: sale.card.filterType,
      category: sale.card.image.category,
    },
    seller: { id: sale.seller.id, nickname: sale.seller.nickname },
    description: sale.description,
    canExchange: sale.canExchange,
    price: Number(sale.price),
    status: sale.status === "ON_SALE" && hasPendingExchange ? "ON_EXCHANGE" : sale.status,
    createdAt: sale.createdAt,
    updatedAt: sale.updatedAt,
    closedAt: sale.closedAt,
    exchanges: sale.exchanges,
  };
}

// 판매글 수정: 존재 확인 후, 전달받은 data로 Repository의 수정 함수 호출
export async function updateSale(id, data) {
  const sale = await saleRepository.findSaleWithExchangesById(id);
  if (!sale) {
    throw new ApiError(404, "SALE_NOT_FOUND", "판매글을 찾을 수 없습니다.");
  }
  return saleRepository.updateSaleById(id, data);
}

// 판매글 취소: 존재·소유자 확인 후, 트랜잭션(판매 중인 경우에만 취소 + 교환신청 일괄 취소) 실행
// 트랜잭션 결과(배열)에서 각각 판매글 취소 결과, 교환신청 취소 개수를 꺼내 응답 형태로 가공
export async function cancelSale(id, seller) {
  const sale = await saleRepository.findSaleWithExchangesById(id);
  if (!sale) {
    throw new ApiError(404, "SALE_NOT_FOUND", "판매글을 찾을 수 없습니다.");
  }

  if (sale.sellerId !== seller.id) {
    throw new ApiError(403, "NOT_SALE_OWNER", "본인의 판매글만 내릴 수 있습니다.");
  }

  const closedAt = new Date();
  const [canceled, exchangeResult] = await saleRepository.cancelSaleTransaction(id, closedAt);

  // 이미 품절되었거나 취소된 판매글은 다시 취소할 수 없다 (ON_SALE 상태에서만 취소 가능)
  if (canceled.count === 0) {
    throw new ApiError(409, "SALE_NOT_ON_SALE", "판매 중인 판매글만 내릴 수 있습니다.");
  }

  return {
    id,
    status: "CANCELED",
    closedAt,
    canceledExchangeCount: exchangeResult.count,
  };
}
