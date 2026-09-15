import { ApiError } from "../lib/api-error.js";
import { prisma } from "../lib/prisma.js";
import * as saleRepository from "../repositories/sale.repository.js";
import * as cardRepository from "../repositories/card.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import * as exchangeRepository from "../repositories/exchange.repository.js";
import * as notificationRepository from "../repositories/notification.repository.js";
/**
 * 구매 트랜잭션 처리 순서
 * [CARD LOCK / SALE -> USER -> CARD -> EXCHANGE -> NOTIFICATION]
 * 판매글 마감 > 유저 포인트 정산 > 카드 소유권 이전 > 남은 교환 제시 정리 > 알림 생성
 */
export async function purchaseCard({ saleId, buyer }) {
  const { id: buyerId, nickname: buyerNickname } = buyer;

  return prisma.$transaction(async (tx) => {
    //선 검증 [판매글 존재 여부, 구매자와 판매자 일치 여부]
    const sale = await saleRepository.findSaleById(tx, saleId);
    if (!sale) throw new ApiError(404, "SALE_NOT_FOUND", "판매글을 찾을 수 없습니다.");
    if (sale.sellerId === buyerId)
      throw new ApiError(403, "SELF_PURCHASE_NOT_ALLOWED", "자신의 판매글은 구매할 수 없습니다.");

    //CARD [동일 카드에 대해 동시 교환/구매 건 방어]
    await cardRepository.lockCardForUpdate(tx, sale.cardId);

    //SALE [판매 상태 ON_SALE검증 + sale Update 반영]
    const saleUpdate = {
      status: "SOLD_OUT",
      closedAt: new Date(),
    };
    const closed = await saleRepository.closeSaleIfOnSale(tx, saleId, saleUpdate);
    if (closed.count === 0)
      throw new ApiError(409, "SALE_NOT_ON_SALE", "판매가 종료된 판매글입니다.");

    //USER 검증 순서 정렬 - Dead Lock 방지
    const tasks = [{ userId: buyerId, isBuyer: true }, { userId: sale.sellerId }].sort((a, b) =>
      a.userId < b.userId ? -1 : 1,
    );

    //USER [구매자 Point 구매가능 여부 검증 + 구매자 Point 차감 + 판매자 Point 증가]
    let buyerUpdateResult;
    for (const task of tasks) {
      const result = task.isBuyer
        ? await userRepository.deductPointIfEnough(tx, task.userId, sale.price)
        : await userRepository.increasePoint(tx, task.userId, sale.price);
      if (task.isBuyer) buyerUpdateResult = result;
    }
    if (buyerUpdateResult.count === 0)
      throw new ApiError(409, "INSUFFICIENT_POINT", "보유 포인트가 부족합니다.");

    //CARD [안전하게 CARD의 소유자 변경]
    const transferred = await cardRepository.transferCardOwner(
      tx,
      sale.cardId,
      sale.sellerId,
      buyerId,
    );
    if (transferred.count === 0)
      throw new ApiError(409, "CARD_OWNER_CHANGED", "카드 소유자가 변경되어 구매할 수 없습니다.");

    //EXCHANGE [PENDING 교환 조회 및 저장 + REJECTED 변경]
    const pendingExchanges = await exchangeRepository.findPendingExchangesWithOfferer(tx, saleId);
    await exchangeRepository.rejectPendingExchanges(tx, saleId);

    //NOTIFICATION [교환거절 및 판매완료 알림 LOG 일괄 처리]
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
