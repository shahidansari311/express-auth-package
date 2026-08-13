const express = require("express");

const { register, login, me, refresh, logout, verifyEmail, resendVerification, forgotPassword, resetPassword, googleOAuthCallback } = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");

let passport;
try {
  passport = require("passport");
} catch(e) {}
const { 
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} = require("../validators/auth.validator");
const authenticate = require("../middleware/auth.middleware");
const authRateLimiter = require("../middleware/rate-limiter.middleware");

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 * @middleware rateLimiter (prevents spam), validate (checks req.body against Zod schema)
 */
router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  register
);

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and issue JWTs in cookies
 * @access Public
 */
router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  login
);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token using the refresh token cookie
 * @access Public (Requires valid refresh token cookie)
 */
router.post(
  "/refresh",
  authRateLimiter,
  refresh
);

/**
 * @route POST /api/auth/logout
 * @desc Clear authentication cookies to log the user out
 * @access Public
 */
router.post(
  "/logout",
  logout
);

/**
 * @route POST /api/auth/verify-email
 * @desc Verify a user's email using an OTP token
 * @access Public
 */
router.post(
  "/verify-email",
  authRateLimiter,
  validate(verifyEmailSchema),
  verifyEmail
);

/**
 * @route POST /api/auth/resend-verification
 * @desc Resend the email verification OTP
 * @access Public
 */
router.post(
  "/resend-verification",
  authRateLimiter,
  validate(resendVerificationSchema),
  resendVerification
);

/**
 * @route POST /api/auth/forgot-password
 * @desc Request a password reset token via email
 * @access Public
 */
router.post(
  "/forgot-password",
  authRateLimiter,
  validate(forgotPasswordSchema),
  forgotPassword
);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password using the token sent to email
 * @access Public
 */
router.post(
  "/reset-password",
  authRateLimiter,
  validate(resetPasswordSchema),
  resetPassword
);

/**
 * @route GET /api/auth/me
 * @desc Get the currently authenticated user's profile
 * @access Private (Requires valid access token cookie)
 */
router.get(
  "/me",
  authenticate,
  me
);

if (passport) {
  /**
   * @route GET /api/auth/google
   * @desc Initiate Google OAuth flow
   * @access Public
   */
  router.get(
    "/google",
    authRateLimiter,
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  /**
   * @route GET /api/auth/google/callback
   * @desc Google OAuth callback
   * @access Public
   */
  router.get(
    "/google/callback",
    authRateLimiter,
    passport.authenticate("google", { session: false, failureRedirect: "/login" }),
    googleOAuthCallback
  );
}

module.exports = router;