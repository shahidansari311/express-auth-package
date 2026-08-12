const VerificationToken = require("../models/verification-token.model");

// Helper to normalize the _id to id
const mapToken = (token) => {
  if (!token) return null;
  const { _id, __v, ...rest } = token;
  return { id: _id.toString(), userId: rest.userId.toString(), ...rest };
};

/**
 * Creates a new email verification token in the database.
 */
const create = async (data) => {
  const token = await VerificationToken.create(data);
  return mapToken(token.toObject());
};

/**
 * Finds a verification token by its hash.
 */
const findByTokenHash = async (tokenHash) => {
  const token = await VerificationToken.findOne({ tokenHash }).lean();
  return mapToken(token);
};

/**
 * Marks a verification token as consumed (used).
 */
const consume = async (id) => {
  const token = await VerificationToken.findByIdAndUpdate(
    id,
    { consumedAt: new Date() },
    { new: true }
  ).lean();
  return mapToken(token);
};

/**
 * Manually deletes expired tokens.
 */
const deleteExpired = async () => {
  await VerificationToken.deleteMany({ expiresAt: { $lt: new Date() } });
};

module.exports = {
  create,
  findByTokenHash,
  consume,
  deleteExpired,
};
