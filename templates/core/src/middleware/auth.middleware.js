const {
  verifyAccessToken,
} = require("../utils/token");

/**
 * Middleware to protect routes.
 * 1. Extracts the JWT access token from the Authorization header (Bearer token).
 * 2. Verifies the signature and expiration.
 * 3. Attaches the decoded user payload to `req.user` for use in controllers.
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      const error = new Error("Authentication required");
      error.statusCode = 401;
      throw error;
    }

    // Expected format: "Bearer <token>"
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      const error = new Error("Invalid authorization format");
      error.statusCode = 401;
      throw error;
    }

    // Verify token using secret
    const decoded = verifyAccessToken(token);

    // Make user info accessible in subsequent route handlers
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      error.statusCode = 401;
      error.message = "Access token expired";
    }

    if (error.name === "JsonWebTokenError") {
      error.statusCode = 401;
      error.message = "Invalid access token";
    }

    next(error);
  }
};

module.exports = authenticate;