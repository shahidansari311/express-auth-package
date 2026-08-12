const PasswordResetToken = require("../models/reset-token.model");

// Helper to normalize the _id to id
const mapToken = (token) => {
  if (!token) return null;
  const { _id, __v, ...rest } = token;
  return { id: _id.toString(), userId: rest.userId.toString(), ...rest };
};

/**
 * Creates a new password reset token in the database.
 */
const create = async (data) => {
  const token = await PasswordResetToken.create(data);
  return mapToken(token.toObject());
};

/**
 * Finds a reset token by its hash.
 */
const findByTokenHash = async (tokenHash) => {
  const token = await PasswordResetToken.findOne({ tokenHash }).lean();
  return mapToken(token);
};

/**
 * Marks a reset token as consumed (used).
 */
const consume = async (id) => {
  const token = await PasswordResetToken.findByIdAndUpdate(
    id,
    { consumedAt: new Date() },
    { new: true }
  ).lean();
  return mapToken(token);
};

/**
 * Manually deletes expired reset tokens.
 */
const deleteExpired = async () => {
  await PasswordResetToken.deleteMany({ expiresAt: { $lt: new Date() } });
};

module.exports = {
  create,
  findByTokenHash,
  consume,
  deleteExpired,
};
