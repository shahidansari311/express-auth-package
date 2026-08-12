/**
 * Global Error Handling Middleware.
 * Catches all errors thrown synchronously or passed to `next(err)`.
 * It provides uniform JSON responses and handles specific database errors automatically.
 */
function errorHandler(err, req, res, next) {
  // Log the error stack to the console (useful in development)
  console.error(err);

  // Handle Mongoose (MongoDB) validation errors
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // Handle MongoDB duplicate key errors (e.g., trying to register an existing email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];

    return res.status(409).json({
      success: false,
      message: field
        ? `${field} already exists`
        : "Duplicate value already exists",
    });
  }

  // Handle Prisma (PostgreSQL) unique constraint errors
  if (err.code === "P2002") {
    const field = err.meta && err.meta.target ? err.meta.target[0] : "Field";
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // Handle standard application errors (thrown with a custom statusCode)
  const statusCode = err.statusCode || 500;

  // Mask 500 Internal Server Errors in production to avoid leaking sensitive stack traces
  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal server error"
        : err.message,
  });
}

module.exports = errorHandler;