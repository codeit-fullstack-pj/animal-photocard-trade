import { prisma } from "../lib/prisma.js";

// 판매 목록과 연결된 카드, 판매자, 교환 정보를 조회
export function findSales({
  category,
  keyword,
  soldOut,
  status,
  sellerId,
  orderBy,
  cursor,
  limit,
}) {
  return prisma.sale.findMany({
    where: {
      // 판매자 조건이 있으면 해당 판매자의 판매글만 조회
      ...(sellerId && {
        sellerId,
      }),

      // 품절만 보기일 때 판매 완료된 판매글만 조회
      ...(soldOut === "true" && {
        status: "SOLD_OUT",
      }),

      // 판매 중인 판매글만 조회하고 대기 중인 교환 제안은 제외
      ...(status === "ON_SALE" && {
        AND: [
          {
            status: "ON_SALE",
          },
          {
            exchanges: {
              none: {
                status: "PENDING",
              },
            },
          },
        ],
      }),

      // 대기 중인 교환 제안이 있는 판매글만 조회
      ...(status === "ON_EXCHANGE" && {
        AND: [
          {
            status: "ON_SALE",
          },
          {
            exchanges: {
              some: {
                status: "PENDING",
              },
            },
          },
        ],
      }),

      // 카테고리 또는 검색어가 있으면 연결된 카드 정보를 기준으로 조회
      ...((category || keyword) && {
        card: {
          // 검색어가 있으면 카드 이름에 검색어가 포함된 판매글을 조회
          ...(keyword && {
            name: {
              contains: keyword,
              mode: "insensitive",
            },
          }),

          // 카테고리가 있으면 연결된 이미지의 카테고리를 기준으로 조회
          ...(category && {
            image: {
              category,
            },
          }),
        },
      }),
    },

    include: {
      card: {
        include: {
          image: true,
        },
      },

      seller: true,

      exchanges: {
        where: {
          status: "PENDING",
        },
      },
    },

    // 선택한 기준에 따라 판매글을 정렬하고 동일한 값은 id로 순서를 고정
    orderBy:
      orderBy === "OLDEST"
        ? [{ createdAt: "asc" }, { id: "asc" }]
        : orderBy === "POINT_ASC"
          ? [{ price: "asc" }, { id: "asc" }]
          : orderBy === "POINT_DESC"
            ? [{ price: "desc" }, { id: "asc" }]
            : orderBy === "SCORE_ASC"
              ? [
                  {
                    card: {
                      topScore: "asc",
                    },
                  },
                  { id: "asc" },
                ]
              : orderBy === "SCORE_DESC"
                ? [
                    {
                      card: {
                        topScore: "desc",
                      },
                    },
                    { id: "asc" },
                  ]
                : [{ createdAt: "desc" }, { id: "asc" }],

    // cursor가 있으면 해당 판매글 다음부터 조회
    ...(cursor && {
      cursor: {
        id: cursor,
      },
      skip: 1,
    }),

    take: limit + 1,
  });
}

// 판매글 ID로 판매글과 연결된 카드를 조회
export function findSaleById(tx, id) {
  return tx.sale.findUnique({
    where: { id },
    include: { card: true },
  });
}

// 판매 중인 판매글만 지정한 상태로 마감
export function closeSaleIfOnSale(tx, id, { status, closedAt }) {
  return tx.sale.updateMany({
    where: {
      id,
      status: "ON_SALE",
    },
    data: {
      status,
      closedAt,
    },
  });
}

// FOR UPDATE로 Sale 행을 잠근다. card.repository.js의 lockCardForUpdate와 같은 방식
export function lockSaleForUpdate(tx, saleId) {
  return tx.$queryRaw`SELECT * FROM "Sale" WHERE id = ${saleId} FOR UPDATE`;
}

// 이 카드로 status가 ON_SALE인 Sale이 있는지 (claim 확인의 절반)
export function findOnSaleByCardId(tx, cardId) {
  return tx.sale.findFirst({ where: { cardId, status: "ON_SALE" } });
}
