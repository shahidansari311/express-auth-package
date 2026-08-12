const {
  findById,
  findByEmail,
  createUser,
  updateById,
} = require("../repositories/user.repository");
const refreshRepo = require("../repositories/refresh.repository");
const verificationRepo = require("../repositories/verification.repository");
const resetRepo = require("../repositories/reset.repository");
const { generateAccessToken, generateRefreshToken, hashToken, verifyRefreshToken, generateRandomToken } = require("../utils/token");
const { sendVerificationEmail, sendPasswordResetEmail } = require("./email.service");

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

  const verificationToken = generateRandomToken();
  const tokenHash = hashToken(verificationToken);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await verificationRepo.create({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  await sendVerificationEmail(user.email, verificationToken);

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

const refreshTokenUser = async (token) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    const error = new Error("Invalid refresh token");
    error.statusCode = 401;
    throw error;
  }

  const tokenHash = hashToken(token);
  const session = await refreshRepo.findByTokenHash(tokenHash);

  if (!session) {
    const error = new Error("Invalid refresh session");
    error.statusCode = 401;
    throw error;
  }

  if (session.revokedAt) {
    const error = new Error("Refresh token has been revoked");
    error.statusCode = 401;
    throw error;
  }

  if (new Date() > new Date(session.expiresAt)) {
    const error = new Error("Refresh token expired");
    error.statusCode = 401;
    throw error;
  }

  const user = await findById(session.userId);
  if (!user || !user.isActive) {
    const error = new Error("User account is inactive or not found");
    error.statusCode = 403;
    throw error;
  }

  // Revoke the old session
  await refreshRepo.revoke(session.id);

  // Generate new tokens
  const accessToken = generateAccessToken({ userId: user.id });
  const newRefreshToken = generateRefreshToken({ userId: user.id });
  
  const newTokenHash = hashToken(newRefreshToken);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await refreshRepo.create({
    userId: user.id,
    tokenHash: newTokenHash,
    expiresAt,
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

const logoutUser = async (token) => {
  if (!token) return;

  const tokenHash = hashToken(token);
  const session = await refreshRepo.findByTokenHash(tokenHash);

  if (session && !session.revokedAt) {
    await refreshRepo.revoke(session.id);
  }
};

const verifyEmail = async (token) => {
  const tokenHash = hashToken(token);
  const verificationSession = await verificationRepo.findByTokenHash(tokenHash);

  if (!verificationSession) {
    const error = new Error("Invalid or expired verification token");
    error.statusCode = 400;
    throw error;
  }

  if (verificationSession.consumedAt) {
    const error = new Error("Email already verified");
    error.statusCode = 400;
    throw error;
  }

  if (new Date() > new Date(verificationSession.expiresAt)) {
    const error = new Error("Verification token expired");
    error.statusCode = 400;
    throw error;
  }

  await verificationRepo.consume(verificationSession.id);
  await updateById(verificationSession.userId, { isEmailVerified: true });
};

const resendVerificationEmail = async (email) => {
  const user = await findByEmail(email);

  if (!user) {
    return; // Don't reveal if account exists
  }

  if (user.isEmailVerified) {
    const error = new Error("Email is already verified");
    error.statusCode = 400;
    throw error;
  }

  const verificationToken = generateRandomToken();
  const tokenHash = hashToken(verificationToken);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await verificationRepo.create({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  await sendVerificationEmail(user.email, verificationToken);
};

const forgotPassword = async (email) => {
  const user = await findByEmail(email);

  if (!user) {
    return; // Prevent email enumeration
  }

  const resetToken = generateRandomToken();
  const tokenHash = hashToken(resetToken);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

  await resetRepo.create({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  await sendPasswordResetEmail(user.email, resetToken);
};

const resetPassword = async (token, newPassword) => {
  const tokenHash = hashToken(token);
  const resetSession = await resetRepo.findByTokenHash(tokenHash);

  if (!resetSession) {
    const error = new Error("Invalid or expired reset token");
    error.statusCode = 400;
    throw error;
  }

  if (resetSession.consumedAt) {
    const error = new Error("Reset token already used");
    error.statusCode = 400;
    throw error;
  }

  if (new Date() > new Date(resetSession.expiresAt)) {
    const error = new Error("Reset token expired");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await updateById(resetSession.userId, { password: hashedPassword });

  // Mark token as consumed
  await resetRepo.consume(resetSession.id);

  // Invalidate all active refresh sessions to force re-login everywhere
  await refreshRepo.revokeAllForUser(resetSession.userId);
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  refreshTokenUser,
  logoutUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
};