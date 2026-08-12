const {
  verifyAccessToken,
} = require("../utils/token");

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      const error = new Error("Authentication required");
      error.statusCode = 401;
      throw error;
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      const error = new Error("Invalid authorization format");
      error.statusCode = 401;
      throw error;
    }

    const decoded = verifyAccessToken(token);

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