import { defineConfig } from "prisma/config";

try {
  process.loadEnvFile();
} catch {
  // .env is optional locally (e.g. CI supplies DATABASE_URL directly)
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // 마이그레이션은 트랜잭션 풀러(6543)를 거치면 멈추므로 직접 연결(DIRECT_URL, 5432)을 쓴다.
    // 앱(src/lib/prisma.js)은 그대로 DATABASE_URL(풀러)을 쓴다
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
