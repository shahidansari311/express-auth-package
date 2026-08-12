const { prisma } = require("../config/database");

/**
 * Creates a new password reset token in the database.
 */
const create = async (data) => {
  return prisma.passwordResetToken.create({
    data,
  });
};

/**
 * Finds a reset token by its hash.
 */
const findByTokenHash = async (tokenHash) => {
  return prisma.passwordResetToken.findUnique({
    where: {
      tokenHash,
    },
  });
};

/**
 * Marks a reset token as consumed (used).
 */
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

/**
 * Manually deletes expired reset tokens.
 */
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
