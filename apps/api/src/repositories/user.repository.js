import { prisma } from "../lib/prisma.js";

export function findUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

export function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

export function findUserByNickname(nickname) {
  return prisma.user.findUnique({ where: { nickname } });
}

export function findUserByProviderUid(providerUid) {
  return prisma.user.findFirst({ where: { providerUid } });
}

export function createUser({ email, nickname, provider, providerUid }) {
  return prisma.user.create({ data: { email, nickname, provider, providerUid } });
}

export function updateProviderUid(id, providerUid) {
  return prisma.user.update({ where: { id }, data: { providerUid } });
}

export function deleteUser(id) {
  return prisma.user.delete({ where: { id } });
}

//유저 포인트 감소 트랜잭션
export function deductPointIfEnough(tx, userId, amount) {
  return tx.user.updateMany({
    where: { id: userId, point: { gte: amount } },
    data: { point: { decrement: amount } },
  });
}
//유저 포인트 증가 트랜잭션
export function increasePoint(tx, userId, amount) {
  return tx.user.updateMany({
    where: { id: userId },
    data: { point: { increment: amount } },
  });
}

// 당일 추첨 이력이 없을 때만 포인트와 마지막 추첨 시각을 함께 갱신
export function grantRandomPointIfAvailable(tx, userId, amount, todayStart, drawnAt) {
  return tx.user.updateMany({
    where: {
      id: userId,
      OR: [{ lastDrawAt: null }, { lastDrawAt: { lt: todayStart } }],
    },
    data: {
      point: { increment: BigInt(amount) },
      lastDrawAt: drawnAt,
    },
  });
}
