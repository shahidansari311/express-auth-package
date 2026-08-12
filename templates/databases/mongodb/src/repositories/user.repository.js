const User = require("../models/user.model");

const findByEmail = async (email) => {
  return User.findOne({ email })
    .select("+password")
    .lean();
};

const findById = async (id) => {
  return User.findById(id)
    .select("-password")
    .lean();
};

const createUser = async (data) => {
  const user = await User.create(data);

  return user.toObject();
};

const updateById = async (id, data) => {
  return User.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  )
    .select("-password")
    .lean();
};

const deleteById = async (id) => {
  return User.findByIdAndDelete(id)
    .select("-password")
    .lean();
};

module.exports = {
  findByEmail,
  findById,
  createUser,
  updateById,
  deleteById
};