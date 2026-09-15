import { findSales } from "../repositories/sale.repository.js";

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
  const sales = await findSales({
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
