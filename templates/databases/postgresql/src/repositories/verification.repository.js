const { prisma } = require("../config/database");

const create = async (data) => {
  return prisma.verificationToken.create({
    data,
  });
};

const findByTokenHash = async (tokenHash) => {
  return prisma.verificationToken.findUnique({
    where: {
      tokenHash,
    },
  });
};

const consume = async (id) => {
  return prisma.verificationToken.update({
    where: {
      id,
    },
    data: {
      consumedAt: new Date(),
    },
  });
};

const deleteExpired = async () => {
  await prisma.verificationToken.deleteMany({
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
