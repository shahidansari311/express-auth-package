/**
 * A generic middleware wrapper for Zod schemas.
 * Validates the incoming request body against the provided schema.
 * If validation fails, it intercepts the request and sends a 400 Bad Request
 * with a structured list of field errors.
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Map Zod errors into a cleaner format for the frontend
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // Replace req.body with the sanitized and parsed data
    req.body = result.data;

    next();
  };
}

module.exports = validate;