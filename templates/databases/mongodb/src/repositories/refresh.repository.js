const RefreshSession = require("../models/refresh-session.model");

const mapSession = (session) => {
  if (!session) return null;
  const { _id, __v, ...rest } = session;
  return { id: _id.toString(), userId: rest.userId.toString(), ...rest };
};

const create = async (data) => {
  const session = await RefreshSession.create(data);
  return mapSession(session.toObject());
};

const findByTokenHash = async (tokenHash) => {
  const session = await RefreshSession.findOne({ tokenHash }).lean();
  return mapSession(session);
};

const revoke = async (id) => {
  const session = await RefreshSession.findByIdAndUpdate(
    id,
    { revokedAt: new Date() },
    { new: true }
  ).lean();
  return mapSession(session);
};

const revokeAllForUser = async (userId) => {
  await RefreshSession.updateMany(
    { userId, revokedAt: null },
    { revokedAt: new Date() }
  );
};

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
