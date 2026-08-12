const User = require("../models/user.model");

const mapUser = (user) => {
  if (!user) return null;
  const { _id, __v, ...rest } = user;
  return { id: _id.toString(), ...rest };
};

const findByEmail = async (email) => {
  const user = await User.findOne({ email }).select("+password").lean();
  return mapUser(user);
};

const findById = async (id) => {
  const user = await User.findById(id).select("-password").lean();
  return mapUser(user);
};

const createUser = async (data) => {
  const user = await User.create(data);
  return mapUser(user.toObject());
};

const updateById = async (id, data) => {
  const user = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .select("-password")
    .lean();
  return mapUser(user);
};

const deleteById = async (id) => {
  const user = await User.findByIdAndDelete(id)
    .select("-password")
    .lean();
  return mapUser(user);
};

module.exports = {
  findByEmail,
  findById,
  createUser,
  updateById,
  deleteById,
};