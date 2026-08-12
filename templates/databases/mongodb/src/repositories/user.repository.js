const User = require("../models/user.model");

/**
 * Repository Pattern:
 * The repository layer abstracts the underlying database (Mongoose in this case).
 * This means the Service layer doesn't need to know about Mongoose specific
 * methods like .findOne(), .findById(), or how we handle _id vs id.
 */

// Helper to normalize the _id to id for the service layer
const mapUser = (user) => {
  if (!user) return null;
  const { _id, __v, ...rest } = user;
  return { id: _id.toString(), ...rest };
};

/**
 * Finds a user by their email address.
 * Uses .select("+password") because the password field is excluded by default in the schema.
 */
const findByEmail = async (email) => {
  const user = await User.findOne({ email }).select("+password").lean();
  return mapUser(user);
};

/**
 * Finds a user by their ID.
 */
const findById = async (id) => {
  const user = await User.findById(id).select("-password").lean();
  return mapUser(user);
};

/**
 * Creates a new user record in the database.
 */
const createUser = async (data) => {
  const user = await User.create(data);
  return mapUser(user.toObject());
};

/**
 * Updates a user's details by their ID.
 */
const updateById = async (id, data) => {
  const user = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .select("-password")
    .lean();
  return mapUser(user);
};

/**
 * Deletes a user by their ID.
 */
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