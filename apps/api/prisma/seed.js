import { prisma } from "../src/lib/prisma.js";
import { deriveCardDescription, deriveCardTag } from "../src/lib/card-flavor.js";

const SEED_ID_NAMESPACES = {
  user: "001",
  image: "002",
  card: "003",
  sale: "004",
  exchange: "005",
  noti: "006",
};

// 사람이 읽기 쉬운 seed 참조값(user-001 등)을 재실행 가능한 고정 UUID로 변환한다.
function toSeedUuid(seedId) {
  const match = /^(user|image|card|sale|exchange|noti)-(\d{3})$/.exec(seedId);
  if (!match) throw new Error(`알 수 없는 seed ID 형식입니다: ${seedId}`);

  const [, type, sequence] = match;
  return `00000000-0000-4000-8${SEED_ID_NAMESPACES[type]}-${sequence.padStart(12, "0")}`;
}

const users = [
  {
    id: "user-001",
    nickname: "냥냥이",
    email: "nyangnyang@example.com",
    provider: "local",
    providerUid: "google-user-001",
    point: 2000n,
    lastDrawAt: new Date("2026-09-05T09:30:00.000Z"),
    createdAt: new Date("2026-08-20T10:00:00.000Z"),
  },
  {
    id: "user-002",
    nickname: "멍멍이",
    email: "meongmeong@example.com",
    provider: "local",
    providerUid: "kakao-user-002",
    point: 1800n,
    lastDrawAt: new Date("2026-09-06T11:20:00.000Z"),
    createdAt: new Date("2026-08-21T14:30:00.000Z"),
  },
  {
    id: "user-003",
    nickname: "초코집사",
    email: "choco@example.com",
    provider: "local",
    providerUid: "google-user-003",
    point: 900n,
    lastDrawAt: new Date("2026-09-04T08:45:00.000Z"),
    createdAt: new Date("2026-08-22T09:15:00.000Z"),
  },
  {
    id: "user-004",
    nickname: "구름이",
    email: "cloud@example.com",
    provider: "local",
    providerUid: "kakao-user-004",
    point: 600n,
    lastDrawAt: new Date("2026-09-06T15:10:00.000Z"),
    createdAt: new Date("2026-08-24T16:20:00.000Z"),
  },
  {
    id: "user-005",
    nickname: "복실이",
    email: "boksil@example.com",
    provider: "local",
    providerUid: "google-user-005",
    point: 350n,
    lastDrawAt: new Date("2026-09-05T13:00:00.000Z"),
    createdAt: new Date("2026-08-26T11:40:00.000Z"),
  },
];

// imageUrl은 Supabase Storage(card-images 버킷의 seed/ 경로)에 업로드된 실제 파일을 가리킨다
const images = [
  {
    id: "image-001",
    uploaderId: "user-001",
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-001.png",
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
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-002.png",
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
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-003.png",
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
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-004.png",
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
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-005.png",
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
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-006.png",
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
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-007.png",
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
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-008.png",
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
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-009.png",
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
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-010.png",
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
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-011.png",
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
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-012.png",
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

  // --- image-013 ~ image-030: 마이갤러리 데모용 (전부 user-001 업로드) ---
  {
    id: "image-013",
    uploaderId: "user-001",
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-013.png",
    category: "CAT",
    score: {
      axes: [
        { field: "ALOOF", value: 40 },
        { field: "UDADA", value: 30 },
        { field: "CHURU_HUNTER", value: 18 },
        { field: "PUNY_HUMAN", value: 12 },
      ],
    },
  },
  {
    id: "image-014",
    uploaderId: "user-001",
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-014.png",
    category: "DOG",
    score: {
      axes: [
        { field: "MY_WAY", value: 44 },
        { field: "ENERGIZER", value: 22 },
        { field: "CAPITALIST", value: 20 },
        { field: "GRUMPY", value: 14 },
      ],
    },
  },
  {
    id: "image-015",
    uploaderId: "user-001",
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-015.png",
    category: "DOG",
    score: {
      axes: [
        { field: "ENERGIZER", value: 48 },
        { field: "MY_WAY", value: 24 },
        { field: "CAPITALIST", value: 16 },
        { field: "GRUMPY", value: 12 },
      ],
    },
  },
  {
    id: "image-016",
    uploaderId: "user-001",
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-016.png",
    category: "CAT",
    score: {
      axes: [
        { field: "CHURU_HUNTER", value: 46 },
        { field: "UDADA", value: 24 },
        { field: "ALOOF", value: 18 },
        { field: "PUNY_HUMAN", value: 12 },
      ],
    },
  },
  {
    id: "image-017",
    uploaderId: "user-001",
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-017.png",
    category: "CAT",
    score: {
      axes: [
        { field: "ALOOF", value: 33 },
        { field: "PUNY_HUMAN", value: 33 },
        { field: "UDADA", value: 20 },
        { field: "CHURU_HUNTER", value: 14 },
      ],
    },
  },
  {
    id: "image-018",
    uploaderId: "user-001",
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-018.png",
    category: "DOG",
    score: {
      axes: [
        { field: "GRUMPY", value: 41 },
        { field: "MY_WAY", value: 27 },
        { field: "ENERGIZER", value: 20 },
        { field: "CAPITALIST", value: 12 },
      ],
    },
  },
  {
    id: "image-019",
    uploaderId: "user-001",
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-019.png",
    category: "CAT",
    score: {
      axes: [
        { field: "UDADA", value: 50 },
        { field: "ALOOF", value: 22 },
        { field: "CHURU_HUNTER", value: 16 },
        { field: "PUNY_HUMAN", value: 12 },
      ],
    },
  },
  {
    id: "image-020",
    uploaderId: "user-001",
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-020.png",
    category: "DOG",
    score: {
      axes: [
        { field: "CAPITALIST", value: 43 },
        { field: "ENERGIZER", value: 25 },
        { field: "MY_WAY", value: 18 },
        { field: "GRUMPY", value: 14 },
      ],
    },
  },
  {
    id: "image-021",
    uploaderId: "user-001",
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-021.png",
    category: "CAT",
    score: {
      axes: [
        { field: "ALOOF", value: 29 },
        { field: "UDADA", value: 29 },
        { field: "CHURU_HUNTER", value: 24 },
        { field: "PUNY_HUMAN", value: 18 },
      ],
    },
  },
  {
    id: "image-022",
    uploaderId: "user-001",
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-022.png",
    category: "DOG",
    score: {
      axes: [
        { field: "ENERGIZER", value: 38 },
        { field: "MY_WAY", value: 30 },
        { field: "CAPITALIST", value: 20 },
        { field: "GRUMPY", value: 12 },
      ],
    },
  },
  {
    id: "image-023",
    uploaderId: "user-001",
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-023.png",
    category: "CAT",
    score: {
      axes: [
        { field: "CHURU_HUNTER", value: 39 },
        { field: "ALOOF", value: 28 },
        { field: "UDADA", value: 20 },
        { field: "PUNY_HUMAN", value: 13 },
      ],
    },
  },
  {
    id: "image-024",
    uploaderId: "user-001",
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-024.png",
    category: "DOG",
    score: {
      axes: [
        { field: "MY_WAY", value: 47 },
        { field: "ENERGIZER", value: 23 },
        { field: "CAPITALIST", value: 18 },
        { field: "GRUMPY", value: 12 },
      ],
    },
  },
  {
    id: "image-025",
    uploaderId: "user-001",
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-025.png",
    category: "CAT",
    score: {
      axes: [
        { field: "PUNY_HUMAN", value: 36 },
        { field: "ALOOF", value: 31 },
        { field: "UDADA", value: 19 },
        { field: "CHURU_HUNTER", value: 14 },
      ],
    },
  },
  {
    id: "image-026",
    uploaderId: "user-001",
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-026.png",
    category: "DOG",
    score: {
      axes: [
        { field: "GRUMPY", value: 34 },
        { field: "MY_WAY", value: 33 },
        { field: "ENERGIZER", value: 21 },
        { field: "CAPITALIST", value: 12 },
      ],
    },
  },
  {
    id: "image-027",
    uploaderId: "user-001",
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-027.png",
    category: "CAT",
    score: {
      axes: [
        { field: "UDADA", value: 44 },
        { field: "CHURU_HUNTER", value: 26 },
        { field: "ALOOF", value: 18 },
        { field: "PUNY_HUMAN", value: 12 },
      ],
    },
  },
  {
    id: "image-028",
    uploaderId: "user-001",
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-028.png",
    category: "DOG",
    score: {
      axes: [
        { field: "ENERGIZER", value: 31 },
        { field: "MY_WAY", value: 31 },
        { field: "CAPITALIST", value: 24 },
        { field: "GRUMPY", value: 14 },
      ],
    },
  },
  {
    id: "image-029",
    uploaderId: "user-001",
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-029.png",
    category: "CAT",
    score: {
      axes: [
        { field: "ALOOF", value: 49 },
        { field: "UDADA", value: 23 },
        { field: "CHURU_HUNTER", value: 16 },
        { field: "PUNY_HUMAN", value: 12 },
      ],
    },
  },
  {
    id: "image-030",
    uploaderId: "user-001",
    imageUrl:
      "https://tgeegyvuyrhwjphdcbsa.supabase.co/storage/v1/object/public/card-images/seed/image-030.png",
    category: "DOG",
    score: {
      axes: [
        { field: "CAPITALIST", value: 40 },
        { field: "MY_WAY", value: 28 },
        { field: "ENERGIZER", value: 20 },
        { field: "GRUMPY", value: 12 },
      ],
    },
  },
];

const cardSeeds = [
  {
    id: "card-001",
    ownerId: "user-001",
    createdById: "user-001",
    name: "나비",
    filterType: 1,
    topScore: 35,
    imageId: "image-001",
    createdAt: new Date("2026-08-20T10:00:00+09:00"),
  },
  {
    id: "card-002",
    ownerId: "user-003",
    createdById: "user-002",
    name: "콩이",
    filterType: 2,
    topScore: 40,
    imageId: "image-002",
    createdAt: new Date("2026-08-21T10:00:00+09:00"),
  },
  {
    id: "card-003",
    ownerId: "user-001",
    createdById: "user-003",
    name: "루루",
    filterType: 1,
    topScore: 38,
    imageId: "image-003",
    createdAt: new Date("2026-08-22T10:00:00+09:00"),
  },
  {
    id: "card-004",
    ownerId: "user-004",
    createdById: "user-004",
    name: "초코",
    filterType: 2,
    topScore: 36,
    imageId: "image-004",
    createdAt: new Date("2026-08-23T10:00:00+09:00"),
  },
  {
    id: "card-005",
    ownerId: "user-005",
    createdById: "user-005",
    name: "보리",
    filterType: 1,
    topScore: 42,
    imageId: "image-005",
    createdAt: new Date("2026-08-24T10:00:00+09:00"),
  },
  {
    id: "card-006",
    ownerId: "user-001",
    createdById: "user-001",
    name: "두부",
    filterType: 2,
    topScore: 39,
    imageId: "image-006",
    createdAt: new Date("2026-08-25T10:00:00+09:00"),
  },
  {
    id: "card-007",
    ownerId: "user-003",
    createdById: "user-002",
    name: "까미",
    filterType: 2,
    topScore: 37,
    imageId: "image-007",
    createdAt: new Date("2026-08-26T10:00:00+09:00"),
  },
  {
    id: "card-008",
    ownerId: "user-003",
    createdById: "user-003",
    name: "모찌",
    filterType: 1,
    topScore: 34,
    imageId: "image-008",
    createdAt: new Date("2026-08-27T10:00:00+09:00"),
  },
  {
    id: "card-009",
    ownerId: "user-005",
    createdById: "user-004",
    name: "댕이",
    filterType: 2,
    topScore: 45,
    imageId: "image-009",
    createdAt: new Date("2026-08-28T10:00:00+09:00"),
  },
  {
    id: "card-010",
    ownerId: "user-004",
    createdById: "user-005",
    name: "솜이",
    filterType: 1,
    topScore: 35,
    imageId: "image-010",
    createdAt: new Date("2026-08-29T10:00:00+09:00"),
  },
  {
    id: "card-011",
    ownerId: "user-001",
    createdById: "user-001",
    name: "호두",
    filterType: 2,
    topScore: 40,
    imageId: "image-011",
    createdAt: new Date("2026-08-30T10:00:00+09:00"),
  },
  {
    id: "card-012",
    ownerId: "user-002",
    createdById: "user-002",
    name: "별이",
    filterType: 1,
    topScore: 41,
    imageId: "image-012",
    createdAt: new Date("2026-08-31T10:00:00+09:00"),
  },

  // --- card-013 ~ card-030: 마이갤러리 데모용 (전부 user-001 보유) ---
  {
    id: "card-013",
    ownerId: "user-002",
    createdById: "user-001",
    name: "소금",
    filterType: 1,
    topScore: 40,
    imageId: "image-013",
    createdAt: new Date("2026-09-07T10:00:00.000Z"),
  },
  {
    id: "card-014",
    ownerId: "user-002",
    createdById: "user-001",
    name: "후추",
    filterType: 2,
    topScore: 44,
    imageId: "image-014",
    createdAt: new Date("2026-09-08T10:00:00.000Z"),
  },
  {
    id: "card-015",
    ownerId: "user-001",
    createdById: "user-001",
    name: "감자",
    filterType: 3,
    topScore: 48,
    imageId: "image-015",
    createdAt: new Date("2026-09-09T10:00:00.000Z"),
  },
  {
    id: "card-016",
    ownerId: "user-002",
    createdById: "user-001",
    name: "고구마",
    filterType: 1,
    topScore: 46,
    imageId: "image-016",
    createdAt: new Date("2026-09-10T10:00:00.000Z"),
  },
  {
    id: "card-017",
    ownerId: "user-005",
    createdById: "user-001",
    name: "밤톨",
    filterType: 2,
    topScore: 33,
    imageId: "image-017",
    createdAt: new Date("2026-09-11T10:00:00.000Z"),
  },
  {
    id: "card-018",
    ownerId: "user-004",
    createdById: "user-001",
    name: "대추",
    filterType: 3,
    topScore: 41,
    imageId: "image-018",
    createdAt: new Date("2026-09-12T10:00:00.000Z"),
  },
  {
    id: "card-019",
    ownerId: "user-004",
    createdById: "user-001",
    name: "라떼",
    filterType: 1,
    topScore: 50,
    imageId: "image-019",
    createdAt: new Date("2026-09-13T10:00:00.000Z"),
  },
  {
    id: "card-020",
    ownerId: "user-001",
    createdById: "user-001",
    name: "모카",
    filterType: 2,
    topScore: 43,
    imageId: "image-020",
    createdAt: new Date("2026-09-14T10:00:00.000Z"),
  },
  {
    id: "card-021",
    ownerId: "user-001",
    createdById: "user-001",
    name: "우유",
    filterType: 3,
    topScore: 29,
    imageId: "image-021",
    createdAt: new Date("2026-09-15T10:00:00.000Z"),
  },
  {
    id: "card-022",
    ownerId: "user-001",
    createdById: "user-001",
    name: "두유",
    filterType: 1,
    topScore: 38,
    imageId: "image-022",
    createdAt: new Date("2026-09-16T10:00:00.000Z"),
  },
  {
    id: "card-023",
    ownerId: "user-001",
    createdById: "user-001",
    name: "미소",
    filterType: 2,
    topScore: 39,
    imageId: "image-023",
    createdAt: new Date("2026-09-17T10:00:00.000Z"),
  },
  {
    id: "card-024",
    ownerId: "user-001",
    createdById: "user-001",
    name: "방울",
    filterType: 3,
    topScore: 47,
    imageId: "image-024",
    createdAt: new Date("2026-09-18T10:00:00.000Z"),
  },
  {
    id: "card-025",
    ownerId: "user-001",
    createdById: "user-001",
    name: "초롱",
    filterType: 1,
    topScore: 36,
    imageId: "image-025",
    createdAt: new Date("2026-09-19T10:00:00.000Z"),
  },
  {
    id: "card-026",
    ownerId: "user-001",
    createdById: "user-001",
    name: "은별",
    filterType: 2,
    topScore: 34,
    imageId: "image-026",
    createdAt: new Date("2026-09-20T10:00:00.000Z"),
  },
  {
    id: "card-027",
    ownerId: "user-001",
    createdById: "user-001",
    name: "달래",
    filterType: 3,
    topScore: 44,
    imageId: "image-027",
    createdAt: new Date("2026-09-21T10:00:00.000Z"),
  },
  {
    id: "card-028",
    ownerId: "user-001",
    createdById: "user-001",
    name: "여울",
    filterType: 1,
    topScore: 31,
    imageId: "image-028",
    createdAt: new Date("2026-09-22T10:00:00.000Z"),
  },
  {
    id: "card-029",
    ownerId: "user-001",
    createdById: "user-001",
    name: "노을",
    filterType: 2,
    topScore: 49,
    imageId: "image-029",
    createdAt: new Date("2026-09-23T10:00:00.000Z"),
  },
  {
    id: "card-030",
    ownerId: "user-001",
    createdById: "user-001",
    name: "바람",
    filterType: 3,
    topScore: 40,
    imageId: "image-030",
    createdAt: new Date("2026-09-24T10:00:00.000Z"),
  },
];

const imageById = new Map(images.map((image) => [image.id, image]));
const cards = cardSeeds.map((card) => {
  const image = imageById.get(card.imageId);

  return {
    ...card,
    tag: deriveCardTag(image.category, image.score.axes),
    description: deriveCardDescription(image.category, image.score.axes),
  };
});

const saleSeeds = [
  {
    id: "sale-001",
    cardId: "card-001",
    sellerId: "user-001",
    canExchange: true,
    status: "ON_SALE",
    price: 300n,
    createdAt: new Date("2026-08-21T12:00:00+09:00"),
  },
  {
    id: "sale-002",
    cardId: "card-002",
    sellerId: "user-002",
    canExchange: true,
    status: "SOLD_OUT",
    price: 500n,
    createdAt: new Date("2026-08-22T12:00:00+09:00"),
    closedAt: new Date("2026-09-06T13:00:00.000Z"),
  },
  {
    id: "sale-003",
    cardId: "card-003",
    sellerId: "user-003",
    canExchange: false,
    status: "SOLD_OUT",
    price: 800n,
    createdAt: new Date("2026-08-23T12:00:00+09:00"),
    closedAt: new Date("2026-08-27T15:30:00+09:00"),
  },
  {
    id: "sale-004",
    cardId: "card-004",
    sellerId: "user-004",
    canExchange: true,
    status: "ON_SALE",
    price: 1000n,
    createdAt: new Date("2026-08-24T12:00:00+09:00"),
  },
  {
    id: "sale-005",
    cardId: "card-005",
    sellerId: "user-005",
    canExchange: false,
    status: "ON_SALE",
    price: 1200n,
    createdAt: new Date("2026-08-25T12:00:00+09:00"),
  },
  {
    id: "sale-006",
    cardId: "card-006",
    sellerId: "user-001",
    canExchange: true,
    status: "ON_SALE",
    price: 1500n,
    createdAt: new Date("2026-08-26T12:00:00+09:00"),
  },
  {
    id: "sale-007",
    cardId: "card-007",
    sellerId: "user-002",
    canExchange: true,
    status: "SOLD_OUT",
    price: 300n,
    createdAt: new Date("2026-08-27T12:00:00+09:00"),
    closedAt: new Date("2026-09-02T18:00:00+09:00"),
  },
  {
    id: "sale-008",
    cardId: "card-008",
    sellerId: "user-003",
    canExchange: true,
    status: "ON_SALE",
    price: 500n,
    createdAt: new Date("2026-08-28T12:00:00+09:00"),
  },
  {
    id: "sale-009",
    cardId: "card-009",
    sellerId: "user-004",
    canExchange: true,
    status: "SOLD_OUT",
    price: 800n,
    createdAt: new Date("2026-08-29T12:00:00+09:00"),
    closedAt: new Date("2026-09-04T11:00:00.000Z"),
  },
  {
    id: "sale-010",
    cardId: "card-010",
    sellerId: "user-005",
    canExchange: false,
    status: "CANCELED",
    price: 1000n,
    createdAt: new Date("2026-08-30T12:00:00+09:00"),
    closedAt: new Date("2026-09-03T11:00:00+09:00"),
  },
  {
    id: "sale-011",
    cardId: "card-011",
    sellerId: "user-001",
    canExchange: true,
    status: "ON_SALE",
    price: 1200n,
    createdAt: new Date("2026-08-31T12:00:00+09:00"),
  },
  {
    id: "sale-012",
    cardId: "card-012",
    sellerId: "user-002",
    canExchange: true,
    status: "ON_SALE",
    price: 1500n,
    createdAt: new Date("2026-09-01T12:00:00+09:00"),
  },
];

const customSaleDescriptions = {
  "sale-001": `저희 예쁜 나비 보세요! 도도하게 앉아 있는 모습이 정말 사랑스럽답니다.
사진만 봐도 마음이 몽글몽글해지는 나비와 좋은 카드로 교환하고 싶어요.`,
  "sale-002": `우리 집 에너자이저 콩이를 소개합니다! 산책만 나가면 누구보다 신나게 달려요.
보기만 해도 기분 좋아지는 콩이 카드, 소중한 카드와 교환 기다릴게요!`,
  "sale-004": `초코의 매력적인 눈빛 좀 보세요! 자기만의 취향이 확실한 멋진 강아지예요.
초코의 개성이 마음에 드셨다면 예쁜 카드로 교환 제안 부탁드려요.`,
  "sale-006": `간식 앞에서 활짝 웃는 두부가 정말 귀엽지 않나요?
영리하고 사랑스러운 두부를 자랑하고 싶어서 올렸어요. 좋은 인연 기다립니다!`,
  "sale-008": `저희 집 귀염둥이 모찌 보세요! 집사를 바라보는 표정부터 남다른 고양이랍니다.
모찌의 매력에 빠지셨다면 아끼는 카드와 교환 제안해 주세요!`,
  "sale-011": `자유로운 영혼 호두를 소개해요! 뛰어노는 모습이 세상에서 제일 행복해 보여요.
호두의 밝은 에너지를 좋아해 주실 분과 기분 좋은 교환을 하고 싶습니다.`,
};

const cardById = new Map(cards.map((card) => [card.id, card]));
const sales = saleSeeds.map((sale) => ({
  ...sale,
  description: customSaleDescriptions[sale.id] ?? cardById.get(sale.cardId).description,
}));

const exchanges = [
  {
    id: "exchange-001",
    saleId: "sale-001",
    offerCardId: "card-013",
    message:
      "나비가 넘 귀여워서 교환 요청드려요오~ 저희 소금이도 새침한 매력이 있어서 같이 보면 찰떡일 것 같아요!",
    status: "PENDING",
    createdAt: new Date("2026-09-07T10:00:00.000Z"),
    respondedAt: null,
  },
  {
    id: "exchange-002",
    saleId: "sale-002",
    offerCardId: "card-016",
    message: "콩이의 해맑은 표정에 완전 반했어요! 저희 고구마와 귀염둥이 맞교환 어떠신가요? 😻",
    status: "ACCEPTED",
    createdAt: new Date("2026-09-06T12:00:00.000Z"),
    respondedAt: new Date("2026-09-06T13:00:00.000Z"),
  },
  {
    id: "exchange-003",
    saleId: "sale-004",
    offerCardId: "card-017",
    message: "초코 눈빛이 너무 매력적이에요~ 높은 곳을 좋아하는 밤톨이와 교환 신청해 봅니다!",
    status: "REJECTED",
    createdAt: new Date("2026-09-06T14:00:00.000Z"),
    respondedAt: new Date("2026-09-06T15:00:00.000Z"),
  },
  {
    id: "exchange-004",
    saleId: "sale-006",
    offerCardId: "card-018",
    message: "두부 미소는 반칙 아닌가요오~ 저희 집 대추와 친구 카드가 되어 주세요!",
    status: "PENDING",
    createdAt: new Date("2026-09-07T15:00:00.000Z"),
    respondedAt: null,
  },
  {
    id: "exchange-005",
    saleId: "sale-008",
    offerCardId: "card-014",
    message:
      "모찌의 집사 조련 스킬에 마음을 빼앗겼습니다... 후추 카드 들고 조심스럽게 교환 요청드려요!",
    status: "CANCELED",
    createdAt: new Date("2026-09-05T10:00:00.000Z"),
    respondedAt: new Date("2026-09-05T11:00:00.000Z"),
  },
  {
    id: "exchange-006",
    saleId: "sale-009",
    offerCardId: "card-019",
    message: "댕이 에너지 보고만 있어도 기분이 좋아져요! 우다다 대장 라떼와 교환 어떠세요~?",
    status: "ACCEPTED",
    createdAt: new Date("2026-09-04T10:00:00.000Z"),
    respondedAt: new Date("2026-09-04T11:00:00.000Z"),
  },
  {
    id: "exchange-007",
    saleId: "sale-007",
    offerCardId: "card-015",
    message: "까미의 까칠한 표정까지 넘 귀여워요ㅋㅋ 에너자이저 감자와 교환 가능할까요?",
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
    userId: "user-003",
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
    userId: "user-001",
    type: "SALE_SOLDOUT_EXCHANGE",
    content: "판매글의 카드가 품절되어 교환 요청이 처리되었습니다.",
    targetId: "sale-007",
    isRead: true,
    createdAt: new Date("2026-09-03T12:05:00.000Z"),
  },
  {
    id: "noti-008",
    userId: "user-001",
    type: "EXCHANGE_RECEIVED",
    content: "멍멍이님이 교환을 제시했습니다.",
    targetId: "sale-001",
    isRead: false,
    createdAt: new Date("2026-09-07T10:01:00.000Z"),
  },
  {
    id: "noti-009",
    userId: "user-005",
    type: "EXCHANGE_ACCEPTED",
    content: "구름이님과의 교환이 성사되었습니다.",
    targetId: "sale-009",
    isRead: false,
    createdAt: new Date("2026-09-04T11:10:00.000Z"),
  },
];

function validateSeedRelations() {
  const cardsById = new Map(cards.map((card) => [card.id, card]));
  const salesById = new Map(sales.map((sale) => [sale.id, sale]));
  const activeSaleCardIds = new Set(
    sales.filter((sale) => sale.status === "ON_SALE").map((sale) => sale.cardId),
  );
  const pendingOfferCardIds = new Set();

  for (const sale of sales) {
    const card = cardsById.get(sale.cardId);
    if (sale.status === "ON_SALE" && card.ownerId !== sale.sellerId) {
      throw new Error(`${sale.id}: 판매 중인 카드의 소유자와 판매자가 다릅니다.`);
    }
    if (sale.status !== "ON_SALE" && sale.closedAt == null) {
      throw new Error(`${sale.id}: 종료된 판매글에 closedAt이 없습니다.`);
    }
  }

  for (const exchange of exchanges) {
    const sale = salesById.get(exchange.saleId);
    const offerCard = cardsById.get(exchange.offerCardId);

    if (exchange.status === "PENDING") {
      if (sale.status !== "ON_SALE") {
        throw new Error(`${exchange.id}: 대기 중 교환의 판매글이 판매 중이 아닙니다.`);
      }
      if (activeSaleCardIds.has(exchange.offerCardId)) {
        throw new Error(`${exchange.id}: 판매 중인 카드는 교환 제시 카드가 될 수 없습니다.`);
      }
      if (pendingOfferCardIds.has(exchange.offerCardId)) {
        throw new Error(`${exchange.id}: 하나의 카드가 여러 교환에 대기 중입니다.`);
      }
      pendingOfferCardIds.add(exchange.offerCardId);
    }

    if (exchange.status === "ACCEPTED") {
      if (sale.status !== "SOLD_OUT") {
        throw new Error(`${exchange.id}: 수락된 교환의 판매글이 종료되지 않았습니다.`);
      }
      if (offerCard.ownerId !== sale.sellerId) {
        throw new Error(`${exchange.id}: 수락 후 제시 카드가 판매자에게 이전되지 않았습니다.`);
      }
    }
  }
}

validateSeedRelations();

for (const user of users) user.id = toSeedUuid(user.id);
for (const image of images) {
  image.id = toSeedUuid(image.id);
  image.uploaderId = toSeedUuid(image.uploaderId);
}
for (const card of cards) {
  card.id = toSeedUuid(card.id);
  card.ownerId = toSeedUuid(card.ownerId);
  card.createdById = toSeedUuid(card.createdById);
  card.imageId = toSeedUuid(card.imageId);
}
for (const sale of sales) {
  sale.id = toSeedUuid(sale.id);
  sale.cardId = toSeedUuid(sale.cardId);
  sale.sellerId = toSeedUuid(sale.sellerId);
}
for (const exchange of exchanges) {
  exchange.id = toSeedUuid(exchange.id);
  exchange.saleId = toSeedUuid(exchange.saleId);
  exchange.offerCardId = toSeedUuid(exchange.offerCardId);
}
for (const notification of notifications) {
  notification.id = toSeedUuid(notification.id);
  notification.userId = toSeedUuid(notification.userId);
  notification.targetId = toSeedUuid(notification.targetId);
}

export async function seed(database = prisma, { providerUidByEmail = new Map() } = {}) {
  // --------------------------------------------------
  // User
  // --------------------------------------------------

  for (const user of users) {
    const providerUid = providerUidByEmail.get(user.email) ?? user.providerUid;

    await database.user.upsert({
      where: {
        id: user.id,
      },
      update: {
        nickname: user.nickname,
        email: user.email,
        provider: user.provider,
        providerUid,
        point: user.point,
        lastDrawAt: user.lastDrawAt,
      },
      create: { ...user, providerUid },
    });
  }

  // --------------------------------------------------
  // ImageData
  // --------------------------------------------------

  for (const image of images) {
    await database.imageData.upsert({
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
    await database.card.upsert({
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
    await database.sale.upsert({
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
    await database.exchange.upsert({
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
    await database.notification.upsert({
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

const isDirectRun = process.argv[1] && import.meta.url === new URL(process.argv[1], "file:").href;

if (isDirectRun)
  seed()
    .catch((error) => {
      console.error("Seed 실패");
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
