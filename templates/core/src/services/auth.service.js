const {
  findById,
  findByEmail,
  createUser,
} = require("../repositories/user.repository");
const refreshRepo = require("../repositories/refresh.repository");
const { generateAccessToken, generateRefreshToken, hashToken } = require("../utils/token");

const {
  hashPassword,
  comparePassword,
} = require("../utils/password");

const registerUser = async ({ name, email, password }) => {
  // Check whether the user already exists
  const existingUser = await findByEmail(email);

  if (existingUser) {
    const error = new Error(
      "User with this email already exists"
    );

    error.statusCode = 409;

    throw error;
  }

  // Hash the password before saving it
  const hashedPassword = await hashPassword(password);

  // Create the user
  const user = await createUser({
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

const loginUser = async ({ email, password }) => {
  const user = await findByEmail(email);

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await comparePassword(
    password,
    user.password
  );

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }
  
  if (!user.isActive) {
    const error = new Error("User account is inactive");
    error.statusCode = 403;
    throw error;
  }

  const accessToken = generateAccessToken({
    userId: user.id,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
  });
  
  const tokenHash = hashToken(refreshToken);
  
  // Calculate expiry date (7 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await refreshRepo.create({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    accessToken,
    refreshToken,
  };
};

const getCurrentUser = async (userId) => {
  const user = await findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("User account is inactive");
    error.statusCode = 403;
    throw error;
  }

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
  loginUser,
  getCurrentUser
};