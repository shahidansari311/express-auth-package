const User = require("../models/user.model");
const { hashPassword } = require("../utils/password");

const registerUser = async ({ name, email, password }) => {
  // Check whether the user already exists
  const existingUser = await User.findByEmail(email);

  if (existingUser) {
    const error = new Error("User with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  // Hash the password before saving it
  const hashedPassword = await hashPassword(password);

  // Create the user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // Never return the password
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

module.exports = {
  registerUser,
};