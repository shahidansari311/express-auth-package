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

/**
 * Registers a new user.
 * 1. Checks if the email is already in use.
 * 2. Hashes the password using bcrypt.
 * 3. Saves the user to the database.
 * 4. Generates a verification token and sends an email.
 */
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

/**
 * Authenticates a user and generates JWT tokens.
 * 1. Finds the user by email.
 * 2. Verifies the password using bcrypt.
 * 3. Ensures the account is active.
 * 4. Generates short-lived Access Token and long-lived Refresh Token.
 * 5. Saves the Refresh Token hash in the database.
 */
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

/**
 * Retrieves the current user's details by ID.
 * Ensures the account is still active before returning data.
 */
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

/**
 * Refreshes an access token using a valid refresh token.
 * 1. Verifies the refresh token JWT signature.
 * 2. Checks the database to ensure the token isn't revoked or expired.
 * 3. Revokes the old token (token rotation).
 * 4. Generates and saves a new pair of tokens.
 */
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

/**
 * Logs a user out by revoking their refresh token in the database.
 */
const logoutUser = async (token) => {
  if (!token) return;

  const tokenHash = hashToken(token);
  const session = await refreshRepo.findByTokenHash(tokenHash);

  if (session && !session.revokedAt) {
    await refreshRepo.revoke(session.id);
  }
};

/**
 * Verifies a user's email address using a token sent to them.
 * Validates token existence, expiration, and ensures it hasn't been used already.
 */
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

/**
 * Resends the email verification OTP.
 * Quietly returns if the user doesn't exist to prevent email enumeration.
 */
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

/**
 * Initiates the forgot password flow.
 * Generates a 1-hour expiration token, saves its hash in the DB, and emails the user.
 */
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

/**
 * Resets a user's password using the token sent to their email.
 * 1. Validates the token's expiry and consumption status.
 * 2. Hashes the new password and updates the database.
 * 3. Revokes ALL active refresh sessions for this user so they must log in again everywhere.
 */
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