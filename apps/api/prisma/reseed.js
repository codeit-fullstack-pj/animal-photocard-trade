import { createClient } from "@supabase/supabase-js";

import { prisma } from "../src/lib/prisma.js";
import { seed } from "./seed.js";

const CONFIRMATION = "DELETE_ALL_DATA_AND_RESEED";
const SEED_USERS = [
  { email: "nyangnyang@example.com", nickname: "냥냥이" },
  { email: "meongmeong@example.com", nickname: "멍멍이" },
  { email: "choco@example.com", nickname: "초코집사" },
  { email: "cloud@example.com", nickname: "구름이" },
  { email: "boksil@example.com", nickname: "복실이" },
];

function createAdminClient() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가 필요합니다.");
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function listAllAuthUsers(supabase) {
  let page = 1;
  let all = [];
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    all = all.concat(data.users);
    if (data.users.length < 1000) break;
    page += 1;
  }
  return all;
}

async function ensureSeedAuthUsers(supabase, password) {
  const authUsers = await listAllAuthUsers(supabase);
  const authUsersByEmail = new Map(authUsers.map((user) => [user.email, user]));
  const providerUidByEmail = new Map();

  for (const seedUser of SEED_USERS) {
    const existing = authUsersByEmail.get(seedUser.email);
    const result = existing
      ? await supabase.auth.admin.updateUserById(existing.id, {
          password,
          email_confirm: true,
          user_metadata: { name: seedUser.nickname, seedUser: true },
        })
      : await supabase.auth.admin.createUser({
          email: seedUser.email,
          password,
          email_confirm: true,
          user_metadata: { name: seedUser.nickname, seedUser: true },
        });

    if (result.error) throw result.error;
    providerUidByEmail.set(seedUser.email, result.data.user.id);
  }

  return providerUidByEmail;
}

// 데모 5명 외의 Auth 계정을 전부 지운다 (DB의 User row는 트랜잭션에서 따로 지움 — 둘 다 지워야 고아 계정이 안 남는다)
async function deleteNonSeedAuthUsers(supabase) {
  const seedEmails = new Set(SEED_USERS.map((user) => user.email));
  const authUsers = await listAllAuthUsers(supabase);

  let deleted = 0;
  for (const user of authUsers) {
    if (seedEmails.has(user.email)) continue;

    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) throw error;
    deleted += 1;
  }
  return deleted;
}

// Storage 버킷에서 이번에 새로 올린 seed/ 이미지를 제외한 전부(과거 실사용 업로드 등)를 지운다
async function deleteNonSeedStorageObjects(supabase) {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "card-images";

  async function listAll(prefix) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000 });
    if (error) throw error;

    let paths = [];
    for (const item of data) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) {
        paths = paths.concat(await listAll(fullPath));
      } else {
        paths.push(fullPath);
      }
    }
    return paths;
  }

  const allPaths = await listAll("");
  const toDelete = allPaths.filter((objectPath) => !objectPath.startsWith("seed/"));
  if (toDelete.length === 0) return 0;

  const { error } = await supabase.storage.from(bucket).remove(toDelete);
  if (error) throw error;
  return toDelete.length;
}

async function main() {
  if (process.env.LIVE_RESEED_CONFIRM !== CONFIRMATION) {
    throw new Error(`라이브 재시딩을 실행하려면 LIVE_RESEED_CONFIRM=${CONFIRMATION}가 필요합니다.`);
  }

  const password = process.env.SEED_USER_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error("SEED_USER_PASSWORD는 8자 이상이어야 합니다.");
  }

  const supabase = createAdminClient();

  // 데모 5명 계정부터 먼저 확실히 만들어두고, 그다음에 나머지 Auth 계정/Storage 파일을 정리한다
  const providerUidByEmail = await ensureSeedAuthUsers(supabase, password);
  const deletedAuthCount = await deleteNonSeedAuthUsers(supabase);
  const deletedStorageCount = await deleteNonSeedStorageObjects(supabase);
  console.log(
    `Auth 계정 정리: ${deletedAuthCount}개 삭제 / Storage 파일 정리: ${deletedStorageCount}개 삭제`,
  );

  await prisma.$transaction(
    async (tx) => {
      // FK 자식 → 부모 순서. 스키마가 바뀌면 이 목록도 함께 갱신해야 한다.
      await tx.notification.deleteMany();
      await tx.exchange.deleteMany();
      await tx.sale.deleteMany();
      await tx.card.deleteMany();
      await tx.imageData.deleteMany();
      await tx.user.deleteMany();

      // 삭제와 생성을 한 트랜잭션으로 묶어 seed 실패 시 기존 데이터를 복구한다.
      await seed(tx, { providerUidByEmail });
    },
    { timeout: 60_000 },
  );
}

main()
  .catch((error) => {
    console.error("Live reseed 실패");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
