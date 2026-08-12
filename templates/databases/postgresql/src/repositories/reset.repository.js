const { prisma } = require("../config/database");

const create = async (data) => {
  return prisma.passwordResetToken.create({
    data,
  });
};

const findByTokenHash = async (tokenHash) => {
  return prisma.passwordResetToken.findUnique({
    where: {
      tokenHash,
    },
  });
};

const consume = async (id) => {
  return prisma.passwordResetToken.update({
    where: {
      id,
    },
    data: {
      consumedAt: new Date(),
    },
  });
};

const deleteExpired = async () => {
  await prisma.passwordResetToken.deleteMany({
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
  consume,
  deleteExpired,
};
