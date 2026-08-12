function errorHandler(err, req, res, next) {
  console.error(err);

  // Mongoose validation error
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

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];

    return res.status(409).json({
      success: false,
      message: field
        ? `${field} already exists`
        : "Duplicate value already exists",
    });
  }

  // Prisma unique constraint error
  if (err.code === "P2002") {
    const field = err.meta && err.meta.target ? err.meta.target[0] : "Field";
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // Default application error
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal server error"
        : err.message,
  });
}

module.exports = errorHandler;