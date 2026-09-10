import { prisma } from "../lib/prisma.js";

export function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

export function findUserByNickname(nickname) {
  return prisma.user.findUnique({ where: { nickname } });
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
