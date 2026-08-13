const { 
  registerUser,
  loginUser ,
  getCurrentUser,
  refreshTokenUser,
  logoutUser,
  verifyEmail: verifyEmailService,
  resendVerificationEmail,
  forgotPassword: forgotPasswordService,
  resetPassword: resetPasswordService,
} = require("../services/auth.service");
const { cookieConfig } = require("../config/cookie");

/**
 * Handles user registration.
 * Extracts user details from req.body and passes them to the service layer.
 */
const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please check your email to verify your account.",
      data: { user },
    });
  } catch (error) {
    // Passes error to the global error handler middleware
    next(error);
  }
};

/**
 * Handles user login.
 * On success, attaches a secure HttpOnly cookie for the refresh token,
 * and sends back the access token in the JSON response.
 */
const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    const { refreshToken, accessToken, user } = result;

    // Set HttpOnly cookie for refresh token to prevent XSS
    res.cookie("refreshToken", refreshToken, cookieConfig);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { accessToken, user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves the currently authenticated user's profile.
 * `req.user.userId` is populated by the authenticate middleware.
 */
const me = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user.userId);

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refreshes the short-lived access token using the long-lived refresh token cookie.
 */
const refresh = async (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      const error = new Error("Refresh token missing");
      error.statusCode = 401;
      throw error;
    }

    const { accessToken, refreshToken } = await refreshTokenUser(oldRefreshToken);

    // Rotate refresh token securely
    res.cookie("refreshToken", refreshToken, cookieConfig);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logs the user out by clearing the refresh token cookie and invalidating it in the DB.
 */
const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    await logoutUser(refreshToken);

    // Clear the cookie from the browser
    res.clearCookie("refreshToken", cookieConfig);

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verifies a user's email using the token provided in the request body.
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    await verifyEmailService(token);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resends the email verification OTP to the user's email if the account exists and is not verified.
 */
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    await resendVerificationEmail(email);

    res.status(200).json({
      success: true,
      message: "If your account exists and is not verified, a verification email has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Initiates the forgot password flow by generating a reset token and emailing it.
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    await forgotPasswordService(email);

    // Always return success even if user doesn't exist to prevent email enumeration attacks
    res.status(200).json({
      success: true,
      message: "If an account exists for this email, a password reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resets the user's password using the provided reset token.
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    await resetPasswordService(token, newPassword);

    res.status(200).json({
      success: true,
      message: "Password reset successful. All previous sessions have been invalidated.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Google OAuth callback
 * Uses the user object appended to req by passport.
 */
const googleOAuthCallback = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = req.user; // req.user populated by passport done()

    res.cookie("refreshToken", refreshToken, cookieConfig);

    // Redirect to frontend with access token
    // In production, you might want to use a more secure method to transfer the access token to the client
    const redirectUrl = new URL(process.env.CORS_ORIGIN || "http://localhost:3000");
    redirectUrl.pathname = "/oauth/callback";
    redirectUrl.searchParams.set("accessToken", accessToken);

    res.redirect(redirectUrl.toString());
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  me,
  refresh,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  googleOAuthCallback,
};