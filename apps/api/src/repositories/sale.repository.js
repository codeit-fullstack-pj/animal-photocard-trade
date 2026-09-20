import { prisma } from "../lib/prisma.js";

// sellerId(판매자) 또는 offererId(교환 제시자)로 조회 조건을 생성.
// 둘 다 있으면 "내가 판매자이거나, 내가 대기 중인 교환을 제시한" 판매글을 OR로 묶는다
function getParticipantWhere({ sellerId, offererId }) {
  if (!sellerId && !offererId) return undefined;

  return {
    OR: [
      ...(sellerId ? [{ sellerId }] : []),
      ...(offererId
        ? [{ exchanges: { some: { status: "PENDING", offerCard: { ownerId: offererId } } } }]
        : []),
    ],
  };
}

// 판매 유형과 품절 포함 여부에 맞는 조회 조건을 생성
function getSaleStatusWhere({ includeSoldOut, status }) {
  let activeStatusWhere = {
    status: "ON_SALE",
  };

  // 판매 중은 대기 중인 교환 제안이 없는 판매글만 조회
  if (status === "ON_SALE") {
    activeStatusWhere = {
      status: "ON_SALE",
      exchanges: {
        none: {
          status: "PENDING",
        },
      },
    };
  }

  // 교환 제시 중은 대기 중인 교환 제안이 있는 판매글만 조회
  if (status === "ON_EXCHANGE") {
    activeStatusWhere = {
      status: "ON_SALE",
      exchanges: {
        some: {
          status: "PENDING",
        },
      },
    };
  }

  // 품절 포함을 체크하지 않으면 판매 중인 목록만 반환
  if (includeSoldOut !== "true") {
    return activeStatusWhere;
  }

  // 품절 포함을 체크하면 기존 목록에 품절된 판매글도 함께 반환
  return {
    OR: [activeStatusWhere, { status: "SOLD_OUT" }],
  };
}

// 판매 목록과 연결된 카드, 판매자, 교환 정보를 조회
export function findSales({
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
}) {
  return prisma.sale.findMany({
    where: {
      // 취소된 판매글은 판매 목록에서 제외
      NOT: {
        status: "CANCELED",
      },

      // 판매자·교환 제시자 조건과 판매 유형/품절 조건이 각각 자체 OR/exchanges 조건을 가질 수
      // 있어 같은 where 객체에 바로 스프레드하면 키가 덮어써진다 — AND 배열로 분리해서 합친다
      AND: [
        getParticipantWhere({ sellerId, offererId }),
        getSaleStatusWhere({ includeSoldOut, status }),
      ].filter(Boolean),

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

      // offerCard까지 포함하는 이유: offererId로 조회할 때, 목록 카드에 상대방의 카드가 아니라
      // "내가 제시한 카드"를 보여줘야 해서 서비스 레이어에서 이 중 내 offerCard를 골라 쓴다
      exchanges: {
        where: {
          status: "PENDING",
        },
        include: {
          offerCard: {
            include: {
              image: true,
            },
          },
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

    // page 방식이면 페이지 위치만큼 건너뛰고, 아니면 기존 cursor 방식을 사용
    ...(page !== undefined
      ? {
          skip: (page - 1) * limit,
        }
      : cursor
        ? {
            cursor: {
              id: cursor,
            },
            skip: 1,
          }
        : {}),

    // page 방식은 요청한 개수만, cursor 방식은 다음 페이지 확인용으로 1개 더 조회
    take: page !== undefined ? limit : limit + 1,
  });
}

// 현재 판매 목록 필터 조건에 해당하는 전체 판매글 개수를 조회
export function countSales({ category, keyword, includeSoldOut, status, sellerId, offererId }) {
  return prisma.sale.count({
    where: {
      // 취소된 판매글은 전체 개수 계산에서도 제외
      NOT: {
        status: "CANCELED",
      },

      // findSales와 동일한 이유로 AND 배열로 분리해서 합친다
      AND: [
        getParticipantWhere({ sellerId, offererId }),
        getSaleStatusWhere({ includeSoldOut, status }),
      ].filter(Boolean),

      // 카테고리 또는 검색어가 있으면 연결된 카드 정보를 기준으로 조회
      ...((category || keyword) && {
        card: {
          ...(keyword && {
            name: {
              contains: keyword,
              mode: "insensitive",
            },
          }),

          ...(category && {
            image: {
              category,
            },
          }),
        },
      }),
    },
  });
}

// 판매글 하나를 새로 생성
export function createSale(tx, { cardId, sellerId, description, canExchange, price }) {
  return tx.sale.create({
    data: { cardId, sellerId, description, canExchange, price },
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

// 교환 제시 목록 조회(listExchanges) 전용
// 판매글 존재 확인 + 요청자가 판매자인지 판단할 sellerId만 조회
export function findSaleSellerById(saleId) {
  return prisma.sale.findUnique({
    where: { id: saleId },
    select: { id: true, sellerId: true },
  });
}

// 판매글 상세 조회: 카드+이미지, 판매자, 교환신청(+제시카드+이미지+주인)까지 한 번에 가져옴
export function findSaleWithExchangesById(id) {
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
}

// 판매글 하나를 id로 찾아서, 전달받은 data(description/price/canExchange 등)로 수정
export function updateSaleById(id, data) {
  return prisma.sale.update({
    where: { id },
    data,
  });
}

// 판매글 하나를 CANCELED 상태로 바꾸고 closedAt을 갱신 (판매글 자체 취소).
// 판매 중(ON_SALE)인 판매글만 취소 가능 — 이미 품절되었거나 취소된 판매글은 그대로 둔다
// (closeSaleIfOnSale과 동일한 이유로 update가 아닌 updateMany + count로 매칭 여부를 확인한다)
export function cancelSaleById(tx, id, closedAt) {
  return tx.sale.updateMany({
    where: { id, status: "ON_SALE" },
    data: {
      status: "CANCELED",
      closedAt,
    },
  });
}
