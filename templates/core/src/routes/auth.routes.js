const express = require("express");

const { register, login, me, refresh, logout, verifyEmail, resendVerification } = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");
const { 
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema
} = require("../validators/auth.validator");
const authenticate = require("../middleware/auth.middleware");
const authRateLimiter = require("../middleware/rate-limiter.middleware");

const router = express.Router();

router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  register
);

router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  login
);

router.post(
  "/refresh",
  authRateLimiter,
  refresh
);

router.post(
  "/logout",
  logout
);

router.post(
  "/verify-email",
  authRateLimiter,
  validate(verifyEmailSchema),
  verifyEmail
);

router.post(
  "/resend-verification",
  authRateLimiter,
  validate(resendVerificationSchema),
  resendVerification
);

router.get(
  "/me",
  authenticate,
  me
);

module.exports = router;