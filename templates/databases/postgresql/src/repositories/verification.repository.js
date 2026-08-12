const { prisma } = require("../config/database");

/**
 * Creates a new email verification token in the database.
 */
const create = async (data) => {
  return prisma.verificationToken.create({
    data,
  });
};

/**
 * Finds a verification token by its hash.
 */
const findByTokenHash = async (tokenHash) => {
  return prisma.verificationToken.findUnique({
    where: {
      tokenHash,
    },
  });
};

/**
 * Marks a verification token as consumed (used).
 */
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

/**
 * Manually deletes expired tokens.
 */
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
