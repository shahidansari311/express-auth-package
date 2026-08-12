const { prisma } = require("../config/database");

const create = async (data) => {
  return prisma.refreshSession.create({
    data,
  });
};

const findByTokenHash = async (tokenHash) => {
  return prisma.refreshSession.findUnique({
    where: {
      tokenHash,
    },
  });
};

const revoke = async (id) => {
  return prisma.refreshSession.update({
    where: {
      id,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};

const revokeAllForUser = async (userId) => {
  await prisma.refreshSession.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};

const deleteExpired = async () => {
  await prisma.refreshSession.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
};

module.exports = {
  create,
  findByTokenHash,
  revoke,
  revokeAllForUser,
  deleteExpired,
};
