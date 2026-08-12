const RefreshSession = require("../models/refresh-session.model");

// Helper to normalize the _id to id
const mapSession = (session) => {
  if (!session) return null;
  const { _id, __v, ...rest } = session;
  return { id: _id.toString(), userId: rest.userId.toString(), ...rest };
};

/**
 * Creates a new refresh token session in the database.
 */
const create = async (data) => {
  const session = await RefreshSession.create(data);
  return mapSession(session.toObject());
};

/**
 * Finds a refresh session using the hashed token.
 */
const findByTokenHash = async (tokenHash) => {
  const session = await RefreshSession.findOne({ tokenHash }).lean();
  return mapSession(session);
};

/**
 * Marks a specific refresh session as revoked (e.g., during logout or token rotation).
 */
const revoke = async (id) => {
  const session = await RefreshSession.findByIdAndUpdate(
    id,
    { revokedAt: new Date() },
    { new: true }
  ).lean();
  return mapSession(session);
};

/**
 * Revokes all active refresh sessions for a user (e.g., after a password reset).
 */
const revokeAllForUser = async (userId) => {
  await RefreshSession.updateMany(
    { userId, revokedAt: null },
    { revokedAt: new Date() }
  );
};

/**
 * Deletes expired refresh sessions to keep the database clean.
 */
const deleteExpired = async () => {
  // MongoDB TTL index handles deletion automatically, 
  // but we can also manually expose this if needed by other logic.
  await RefreshSession.deleteMany({ expiresAt: { $lt: new Date() } });
};

module.exports = {
  create,
  findByTokenHash,
  revoke,
  revokeAllForUser,
  deleteExpired,
};
