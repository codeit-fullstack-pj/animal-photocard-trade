import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const users = [
  {
    id: "user-001",
    nickname: "냥냥이",
    email: "nyangnyang@example.com",
    provider: "google",
    providerUid: "google-user-001",
    point: 12500n,
    lastDrawAt: new Date("2026-09-05T09:30:00.000Z"),
    createdAt: new Date("2026-08-20T10:00:00.000Z"),
  },
  {
    id: "user-002",
    nickname: "멍멍이",
    email: "meongmeong@example.com",
    provider: "kakao",
    providerUid: "kakao-user-002",
    point: 8300n,
    lastDrawAt: new Date("2026-09-06T11:20:00.000Z"),
    createdAt: new Date("2026-08-21T14:30:00.000Z"),
  },
  {
    id: "user-003",
    nickname: "초코집사",
    email: "choco@example.com",
    provider: "google",
    providerUid: "google-user-003",
    point: 24500n,
    lastDrawAt: new Date("2026-09-04T08:45:00.000Z"),
    createdAt: new Date("2026-08-22T09:15:00.000Z"),
  },
  {
    id: "user-004",
    nickname: "구름이",
    email: "cloud@example.com",
    provider: "kakao",
    providerUid: "kakao-user-004",
    point: 6700n,
    lastDrawAt: new Date("2026-09-06T15:10:00.000Z"),
    createdAt: new Date("2026-08-24T16:20:00.000Z"),
  },
  {
    id: "user-005",
    nickname: "복실이",
    email: "boksil@example.com",
    provider: "google",
    providerUid: "google-user-005",
    point: 18200n,
    lastDrawAt: new Date("2026-09-05T13:00:00.000Z"),
    createdAt: new Date("2026-08-26T11:40:00.000Z"),
  },
];

const images = [
  {
    id: "image-001",
    uploaderId: "user-001",
    imageUrl: "https://placehold.co/600x800?text=CAT+001",
    category: "CAT",
    score: {
      axes: [
        { field: "UDADA", value: 35 },
        { field: "ALOOF", value: 25 },
        { field: "CHURU_HUNTER", value: 22 },
        { field: "PUNY_HUMAN", value: 18 },
      ],
    },
  },
  {
    id: "image-002",
    uploaderId: "user-002",
    imageUrl: "https://placehold.co/600x800?text=DOG+002",
    category: "DOG",
    score: {
      axes: [
        { field: "ENERGIZER", value: 40 },
        { field: "MY_WAY", value: 30 },
        { field: "CAPITALIST", value: 20 },
        { field: "GRUMPY", value: 10 },
      ],
    },
  },
  {
    id: "image-003",
    uploaderId: "user-003",
    imageUrl: "https://placehold.co/600x800?text=CAT+003",
    category: "CAT",
    score: {
      axes: [
        { field: "ALOOF", value: 38 },
        { field: "PUNY_HUMAN", value: 27 },
        { field: "UDADA", value: 20 },
        { field: "CHURU_HUNTER", value: 15 },
      ],
    },
  },
  {
    id: "image-004",
    uploaderId: "user-004",
    imageUrl: "https://placehold.co/600x800?text=DOG+004",
    category: "DOG",
    score: {
      axes: [
        { field: "MY_WAY", value: 36 },
        { field: "ENERGIZER", value: 29 },
        { field: "GRUMPY", value: 20 },
        { field: "CAPITALIST", value: 15 },
      ],
    },
  },
  {
    id: "image-005",
    uploaderId: "user-005",
    imageUrl: "https://placehold.co/600x800?text=CAT+005",
    category: "CAT",
    score: {
      axes: [
        { field: "CHURU_HUNTER", value: 42 },
        { field: "UDADA", value: 25 },
        { field: "ALOOF", value: 18 },
        { field: "PUNY_HUMAN", value: 15 },
      ],
    },
  },
  {
    id: "image-006",
    uploaderId: "user-001",
    imageUrl: "https://placehold.co/600x800?text=DOG+006",
    category: "DOG",
    score: {
      axes: [
        { field: "CAPITALIST", value: 39 },
        { field: "MY_WAY", value: 26 },
        { field: "ENERGIZER", value: 21 },
        { field: "GRUMPY", value: 14 },
      ],
    },
  },
  {
    id: "image-007",
    uploaderId: "user-002",
    imageUrl: "https://placehold.co/600x800?text=DOG+007",
    category: "DOG",
    score: {
      axes: [
        { field: "GRUMPY", value: 37 },
        { field: "MY_WAY", value: 28 },
        { field: "ENERGIZER", value: 20 },
        { field: "CAPITALIST", value: 15 },
      ],
    },
  },
  {
    id: "image-008",
    uploaderId: "user-003",
    imageUrl: "https://placehold.co/600x800?text=CAT+008",
    category: "CAT",
    score: {
      axes: [
        { field: "PUNY_HUMAN", value: 34 },
        { field: "ALOOF", value: 30 },
        { field: "UDADA", value: 21 },
        { field: "CHURU_HUNTER", value: 15 },
      ],
    },
  },
  {
    id: "image-009",
    uploaderId: "user-004",
    imageUrl: "https://placehold.co/600x800?text=DOG+009",
    category: "DOG",
    score: {
      axes: [
        { field: "ENERGIZER", value: 45 },
        { field: "CAPITALIST", value: 23 },
        { field: "MY_WAY", value: 18 },
        { field: "GRUMPY", value: 14 },
      ],
    },
  },
  {
    id: "image-010",
    uploaderId: "user-005",
    imageUrl: "https://placehold.co/600x800?text=CAT+010",
    category: "CAT",
    score: {
      axes: [
        { field: "CHURU_HUNTER", value: 35 },
        { field: "ALOOF", value: 33 },
        { field: "PUNY_HUMAN", value: 18 },
        { field: "UDADA", value: 14 },
      ],
    },
  },
  {
    id: "image-011",
    uploaderId: "user-001",
    imageUrl: "https://placehold.co/600x800?text=DOG+011",
    category: "DOG",
    score: {
      axes: [
        { field: "MY_WAY", value: 40 },
        { field: "ENERGIZER", value: 32 },
        { field: "CAPITALIST", value: 16 },
        { field: "GRUMPY", value: 12 },
      ],
    },
  },
  {
    id: "image-012",
    uploaderId: "user-002",
    imageUrl: "https://placehold.co/600x800?text=CAT+012",
    category: "CAT",
    score: {
      axes: [
        { field: "ALOOF", value: 41 },
        { field: "UDADA", value: 24 },
        { field: "CHURU_HUNTER", value: 20 },
        { field: "PUNY_HUMAN", value: 15 },
      ],
    },
  },
];

const cards = [
  {
    id: "card-001",
    ownerId: "user-001",
    createdById: "user-001",
    name: "우주를 정복하는 고양이",
    filterType: 1,
    tag: "우주를 정복하는 마에스트로",
    topScore: 35,
    description: "도도하지만 츄르 앞에서는 솔직해지는 고양이입니다.",
    imageId: "image-001",
  },
  {
    id: "card-002",
    ownerId: "user-002",
    createdById: "user-002",
    name: "에너자이저 멍멍이",
    filterType: 2,
    tag: "세상을 누비는 에너자이저",
    topScore: 40,
    description: "잠시도 가만히 있지 않는 에너지 넘치는 강아지입니다.",
    imageId: "image-002",
  },
  {
    id: "card-003",
    ownerId: "user-003",
    createdById: "user-003",
    name: "도도한 고양이",
    filterType: 1,
    tag: "도도한 매력의 집사",
    topScore: 38,
    description: "무심한 듯하지만 은근히 사람을 챙기는 고양이입니다.",
    imageId: "image-003",
  },
  {
    id: "card-004",
    ownerId: "user-004",
    createdById: "user-004",
    name: "마이웨이 멍멍이",
    filterType: 2,
    tag: "나만의 길을 걷는 멍멍이",
    topScore: 36,
    description: "남의 시선보다 자신의 길을 중요하게 생각합니다.",
    imageId: "image-004",
  },
  {
    id: "card-005",
    ownerId: "user-005",
    createdById: "user-005",
    name: "츄르 헌터",
    filterType: 1,
    tag: "츄르를 사수하는 헌터",
    topScore: 42,
    description: "츄르를 발견하면 누구보다 빠르게 달려갑니다.",
    imageId: "image-005",
  },
  {
    id: "card-006",
    ownerId: "user-001",
    createdById: "user-001",
    name: "작은 자본가",
    filterType: 2,
    tag: "작은 자본가",
    topScore: 39,
    description: "무엇이든 효율과 가치를 먼저 생각하는 강아지입니다.",
    imageId: "image-006",
  },
  {
    id: "card-007",
    ownerId: "user-002",
    createdById: "user-002",
    name: "까칠한 멍멍이",
    filterType: 2,
    tag: "까칠하지만 귀여운 멍멍이",
    topScore: 37,
    description: "조금 까칠하지만 알고 보면 정이 많은 강아지입니다.",
    imageId: "image-007",
  },
  {
    id: "card-008",
    ownerId: "user-003",
    createdById: "user-003",
    name: "인간 조련사 고양이",
    filterType: 1,
    tag: "인간을 다루는 마에스트로",
    topScore: 34,
    description: "집사를 자신의 뜻대로 움직이게 만드는 고양이입니다.",
    imageId: "image-008",
  },
  {
    id: "card-009",
    ownerId: "user-004",
    createdById: "user-004",
    name: "끝없이 달리는 멍멍이",
    filterType: 2,
    tag: "끝없이 달리는 에너자이저",
    topScore: 45,
    description: "산책이라는 단어만 들어도 뛰기 시작합니다.",
    imageId: "image-009",
  },
  {
    id: "card-010",
    ownerId: "user-005",
    createdById: "user-005",
    name: "도도한 츄르 헌터",
    filterType: 1,
    tag: "도도한 츄르 헌터",
    topScore: 35,
    description: "도도함과 츄르 사랑을 동시에 가진 고양이입니다.",
    imageId: "image-010",
  },
  {
    id: "card-011",
    ownerId: "user-001",
    createdById: "user-001",
    name: "자유로운 멍멍이",
    filterType: 2,
    tag: "자유로운 에너자이저",
    topScore: 40,
    description: "자유롭게 뛰어다니는 것을 좋아하는 강아지입니다.",
    imageId: "image-011",
  },
  {
    id: "card-012",
    ownerId: "user-002",
    createdById: "user-002",
    name: "우아한 고양이",
    filterType: 1,
    tag: "우아한 고양이",
    topScore: 41,
    description: "조용하고 우아한 분위기를 가진 고양이입니다.",
    imageId: "image-012",
  },
];

const sales = [
  {
    id: "sale-001",
    cardId: "card-001",
    sellerId: "user-001",
    description: "귀여운 고양이 포토카드 판매합니다.",
    canExchange: true,
    status: "ON_SALE",
    price: 5000n,
  },
  {
    id: "sale-002",
    cardId: "card-002",
    sellerId: "user-002",
    description: "활발한 강아지 포토카드입니다.",
    canExchange: true,
    status: "ON_SALE",
    price: 7000n,
  },
  {
    id: "sale-003",
    cardId: "card-003",
    sellerId: "user-003",
    description: "도도한 고양이 카드입니다.",
    canExchange: false,
    status: "SOLD_OUT",
    price: 6500n,
  },
  {
    id: "sale-004",
    cardId: "card-004",
    sellerId: "user-004",
    description: "마이웨이 강아지 카드입니다.",
    canExchange: true,
    status: "ON_SALE",
    price: 8000n,
  },
  {
    id: "sale-005",
    cardId: "card-005",
    sellerId: "user-005",
    description: "츄르 헌터 고양이 카드입니다.",
    canExchange: false,
    status: "ON_SALE",
    price: 6500n,
  },
  {
    id: "sale-006",
    cardId: "card-006",
    sellerId: "user-001",
    description: "작은 자본가 강아지 카드입니다.",
    canExchange: true,
    status: "ON_SALE",
    price: 8000n,
  },
  {
    id: "sale-007",
    cardId: "card-007",
    sellerId: "user-002",
    description: "까칠한 매력이 있는 강아지 카드입니다.",
    canExchange: true,
    status: "SOLD_OUT",
    price: 9000n,
  },
  {
    id: "sale-008",
    cardId: "card-008",
    sellerId: "user-003",
    description: "집사를 조련하는 고양이 카드입니다.",
    canExchange: true,
    status: "ON_SALE",
    price: 10000n,
  },
  {
    id: "sale-009",
    cardId: "card-009",
    sellerId: "user-004",
    description: "에너지 넘치는 강아지 카드입니다.",
    canExchange: true,
    status: "ON_SALE",
    price: 7500n,
  },
  {
    id: "sale-010",
    cardId: "card-010",
    sellerId: "user-005",
    description: "츄르를 사랑하는 고양이 카드입니다.",
    canExchange: false,
    status: "CANCELED",
    price: 4000n,
  },
  {
    id: "sale-011",
    cardId: "card-011",
    sellerId: "user-001",
    description: "자유로운 강아지 카드입니다.",
    canExchange: true,
    status: "ON_SALE",
    price: 6800n,
  },
  {
    id: "sale-012",
    cardId: "card-012",
    sellerId: "user-002",
    description: "우아한 고양이 카드입니다.",
    canExchange: true,
    status: "ON_SALE",
    price: 8200n,
  },
];

const exchanges = [
  {
    id: "exchange-001",
    saleId: "sale-001",
    offerCardId: "card-002",
    message: "강아지 카드와 교환하고 싶습니다.",
    status: "PENDING",
    createdAt: new Date("2026-09-07T10:00:00.000Z"),
    respondedAt: null,
  },
  {
    id: "exchange-002",
    saleId: "sale-002",
    offerCardId: "card-003",
    message: "제가 가지고 있는 고양이 카드와 교환 가능할까요?",
    status: "ACCEPTED",
    createdAt: new Date("2026-09-06T12:00:00.000Z"),
    respondedAt: new Date("2026-09-06T13:00:00.000Z"),
  },
  {
    id: "exchange-003",
    saleId: "sale-004",
    offerCardId: "card-005",
    message: "츄르 헌터 카드와 교환을 요청합니다.",
    status: "REJECTED",
    createdAt: new Date("2026-09-06T14:00:00.000Z"),
    respondedAt: new Date("2026-09-06T15:00:00.000Z"),
  },
  {
    id: "exchange-004",
    saleId: "sale-006",
    offerCardId: "card-004",
    message: "강아지 카드끼리 교환하고 싶어요.",
    status: "PENDING",
    createdAt: new Date("2026-09-07T15:00:00.000Z"),
    respondedAt: null,
  },
  {
    id: "exchange-005",
    saleId: "sale-008",
    offerCardId: "card-007",
    message: "이 카드와 교환 신청합니다.",
    status: "CANCELED",
    createdAt: new Date("2026-09-05T10:00:00.000Z"),
    respondedAt: new Date("2026-09-05T11:00:00.000Z"),
  },
  {
    id: "exchange-006",
    saleId: "sale-009",
    offerCardId: "card-010",
    message: "고양이 카드와 교환하고 싶습니다.",
    status: "ACCEPTED",
    createdAt: new Date("2026-09-04T10:00:00.000Z"),
    respondedAt: new Date("2026-09-04T11:00:00.000Z"),
  },
  {
    id: "exchange-007",
    saleId: "sale-007",
    offerCardId: "card-011",
    message: "이 강아지 카드와 교환 가능한가요?",
    status: "REJECTED",
    createdAt: new Date("2026-09-03T10:00:00.000Z"),
    respondedAt: new Date("2026-09-03T12:00:00.000Z"),
  },
];

const notifications = [
  {
    id: "noti-001",
    userId: "user-003",
    type: "EXCHANGE_ACCEPTED",
    content: "멍멍이님과의 교환이 성사되었습니다.",
    targetId: "sale-002",
    isRead: false,
    createdAt: new Date("2026-09-06T13:05:00.000Z"),
  },
  {
    id: "noti-002",
    userId: "user-002",
    type: "EXCHANGE_ACCEPTED",
    content: "초코집사님과의 교환이 성사되었습니다.",
    targetId: "sale-002",
    isRead: false,
    createdAt: new Date("2026-09-06T13:10:00.000Z"),
  },
  {
    id: "noti-003",
    userId: "user-005",
    type: "EXCHANGE_REJECTED",
    content: "교환 요청이 거절되었습니다.",
    targetId: "sale-004",
    isRead: true,
    createdAt: new Date("2026-09-06T15:05:00.000Z"),
  },
  {
    id: "noti-004",
    userId: "user-003",
    type: "SALE_SOLD",
    content: "등록한 카드가 판매되었습니다.",
    targetId: "sale-003",
    isRead: true,
    createdAt: new Date("2026-09-05T18:00:00.000Z"),
  },
  {
    id: "noti-005",
    userId: "user-001",
    type: "EXCHANGE_CANCELED_BY_OFFERER",
    content: "교환 요청자가 교환을 취소했습니다.",
    targetId: "sale-008",
    isRead: false,
    createdAt: new Date("2026-09-05T11:05:00.000Z"),
  },
  {
    id: "noti-006",
    userId: "user-004",
    type: "EXCHANGE_ACCEPTED",
    content: "복실이님과의 교환이 성사되었습니다.",
    targetId: "sale-009",
    isRead: false,
    createdAt: new Date("2026-09-04T11:05:00.000Z"),
  },
  {
    id: "noti-007",
    userId: "user-002",
    type: "SALE_SOLDOUT_EXCHANGE",
    content: "판매글의 카드가 품절되어 교환 요청이 처리되었습니다.",
    targetId: "sale-007",
    isRead: true,
    createdAt: new Date("2026-09-03T12:05:00.000Z"),
  },
];

async function main() {
  // --------------------------------------------------
  // User
  // --------------------------------------------------

  for (const user of users) {
    await prisma.user.upsert({
      where: {
        id: user.id,
      },
      update: {
        nickname: user.nickname,
        email: user.email,
        provider: user.provider,
        providerUid: user.providerUid,
        point: user.point,
        lastDrawAt: user.lastDrawAt,
      },
      create: user,
    });
  }

  // --------------------------------------------------
  // ImageData
  // --------------------------------------------------

  for (const image of images) {
    await prisma.imageData.upsert({
      where: {
        id: image.id,
      },
      update: {
        uploaderId: image.uploaderId,
        imageUrl: image.imageUrl,
        category: image.category,
        score: image.score,
      },
      create: image,
    });
  }

  // --------------------------------------------------
  // Card
  // --------------------------------------------------

  for (const card of cards) {
    await prisma.card.upsert({
      where: {
        id: card.id,
      },
      update: {
        ownerId: card.ownerId,
        createdById: card.createdById,
        name: card.name,
        filterType: card.filterType,
        tag: card.tag,
        topScore: card.topScore,
        description: card.description,
        imageId: card.imageId,
      },
      create: card,
    });
  }

  // --------------------------------------------------
  // Sale
  // --------------------------------------------------

  for (const sale of sales) {
    await prisma.sale.upsert({
      where: {
        id: sale.id,
      },
      update: {
        cardId: sale.cardId,
        sellerId: sale.sellerId,
        description: sale.description,
        canExchange: sale.canExchange,
        status: sale.status,
        price: sale.price,
      },
      create: sale,
    });
  }

  // --------------------------------------------------
  // Exchange
  // --------------------------------------------------

  for (const exchange of exchanges) {
    await prisma.exchange.upsert({
      where: {
        id: exchange.id,
      },
      update: {
        saleId: exchange.saleId,
        offerCardId: exchange.offerCardId,
        message: exchange.message,
        status: exchange.status,
        createdAt: exchange.createdAt,
        respondedAt: exchange.respondedAt,
      },
      create: exchange,
    });
  }

  // --------------------------------------------------
  // Notification
  // --------------------------------------------------

  for (const notification of notifications) {
    await prisma.notification.upsert({
      where: {
        id: notification.id,
      },
      update: {
        userId: notification.userId,
        type: notification.type,
        content: notification.content,
        targetId: notification.targetId,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      },
      create: notification,
    });
  }
}

main()
  .catch((error) => {
    console.error("Seed 실패");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
