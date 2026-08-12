const VerificationToken = require("../models/verification-token.model");

const mapToken = (token) => {
  if (!token) return null;
  const { _id, __v, ...rest } = token;
  return { id: _id.toString(), userId: rest.userId.toString(), ...rest };
};

const create = async (data) => {
  const token = await VerificationToken.create(data);
  return mapToken(token.toObject());
};

const findByTokenHash = async (tokenHash) => {
  const token = await VerificationToken.findOne({ tokenHash }).lean();
  return mapToken(token);
};

const consume = async (id) => {
  const token = await VerificationToken.findByIdAndUpdate(
    id,
    { consumedAt: new Date() },
    { new: true }
  ).lean();
  return mapToken(token);
};

const deleteExpired = async () => {
  await VerificationToken.deleteMany({ expiresAt: { $lt: new Date() } });
};

module.exports = {
  create,
  findByTokenHash,
  consume,
  deleteExpired,
};
