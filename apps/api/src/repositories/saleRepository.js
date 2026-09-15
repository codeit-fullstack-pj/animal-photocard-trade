import { prisma } from "../lib/prisma.js";

// 판매글 하나를 id로 조회. 카드+이미지, 판매자, 교환신청(+제시카드+이미지+주인)까지 한 번에 가져옴
export const findSaleById = (id) => {
  return prisma.sale.findUnique({
    where: { id },
    include: {
      card: { include: { image: true } },
      seller: true,
      exchanges: {
        include: {
          offerCard: {
            include: {
              image: true,
              owner: true,
            },
          },
        },
      },
    },
  });
};

// 판매글 하나를 id로 찾아서, 전달받은 data(description/price/canExchange 등)로 수정
export const updateSaleById = (id, data) => {
  return prisma.sale.update({
    where: { id },
    data,
  });
};

// 판매글 하나를 CANCELED 상태로 바꾸고 closedAt을 현재 시각으로 갱신 (판매글 자체 취소)
export const cancelSaleById = (id) => {
  return prisma.sale.update({
    where: { id },
    data: {
      status: "CANCELED",
      closedAt: new Date(),
    },
  });
};

// 이 판매글에 걸린 PENDING 상태 교환신청들을 전부 찾아서 CANCELED로 일괄 변경
export const cancelExchangesBySaleId = (saleId) => {
  return prisma.exchange.updateMany({
    where: {
      saleId: saleId,
      status: "PENDING",
    },
    data: {
      status: "CANCELED",
    },
  });
};

// 위 두 작업(판매글 취소 + 교환신청 취소)을 하나의 트랜잭션으로 묶어서 실행 (둘 다 성공 or 둘 다 실패)
export const cancelSaleTransaction = (id) => {
  return prisma.$transaction([cancelSaleById(id), cancelExchangesBySaleId(id)]);
};
