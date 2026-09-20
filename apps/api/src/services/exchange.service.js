import { ApiError } from "../lib/api-error.js";
import { prisma } from "../lib/prisma.js";
import { broadcastUserChanged } from "../lib/realtime.js";
import * as exchangeRepository from "../repositories/exchange.repository.js";
import * as notificationRepository from "../repositories/notification.repository.js";

//교환 제시 취소하기
export async function cancelExchange({ exchangeId, offerer }) {
  let sellerId;

  const result = await prisma.$transaction(async (tx) => {
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

    sellerId = exchange.sale.sellerId;

    return {
      exchangeId,
      status: exchange.status,
    };
  });

  await broadcastUserChanged(sellerId);
  return result;
}
