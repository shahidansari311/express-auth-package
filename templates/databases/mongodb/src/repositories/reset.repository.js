const PasswordResetToken = require("../models/reset-token.model");

const mapToken = (token) => {
  if (!token) return null;
  const { _id, __v, ...rest } = token;
  return { id: _id.toString(), userId: rest.userId.toString(), ...rest };
};

const create = async (data) => {
  const token = await PasswordResetToken.create(data);
  return mapToken(token.toObject());
};

const findByTokenHash = async (tokenHash) => {
  const token = await PasswordResetToken.findOne({ tokenHash }).lean();
  return mapToken(token);
};

const consume = async (id) => {
  const token = await PasswordResetToken.findByIdAndUpdate(
    id,
    { consumedAt: new Date() },
    { new: true }
  ).lean();
  return mapToken(token);
};

const deleteExpired = async () => {
  await PasswordResetToken.deleteMany({ expiresAt: { $lt: new Date() } });
};

module.exports = {
  create,
  findByTokenHash,
  consume,
  deleteExpired,
};
