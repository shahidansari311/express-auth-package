const { prisma } = require("../config/database");

/**
 * Creates a new refresh token session in the database.
 */
const create = async (data) => {
  return prisma.refreshSession.create({
    data,
  });
};

/**
 * Finds a refresh session using the hashed token.
 */
const findByTokenHash = async (tokenHash) => {
  return prisma.refreshSession.findUnique({
    where: {
      tokenHash,
    },
  });
};

/**
 * Marks a specific refresh session as revoked (e.g., during logout or token rotation).
 */
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

/**
 * Revokes all active refresh sessions for a user (e.g., after a password reset).
 */
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

/**
 * Deletes expired refresh sessions to keep the database clean.
 */
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
