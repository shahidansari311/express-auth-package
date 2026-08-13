const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const errorHandler = require("./middleware/error.middleware");

// Try loading passport if the oauth feature is enabled
let passport;
try {
  passport = require("./config/passport");
} catch (e) {
  // Passport not installed
}

const authRoutes = require("./routes/auth.routes");
const app = express();

// ==========================================
// 1. Security Middleware
// ==========================================
// Helmet helps secure Express apps by setting HTTP response headers.
app.use(helmet());

// CORS configuration ensures your backend only accepts requests from allowed domains.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true, // Allows sending cookies over CORS
  })
);

// ==========================================
// 2. Request Parsers
// ==========================================
// Parse incoming JSON payloads. Limit set to 10kb to prevent large payload attacks.
app.use(express.json({ limit: "10kb" }));
// Parse Cookie header and populate req.cookies with an object keyed by the cookie names.
app.use(cookieParser());

// ==========================================
// 3. Health Check
// ==========================================
// A simple endpoint to verify the server is running.
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
  });
});

// ==========================================
// 4. Authentication Middleware
// ==========================================
if (passport) {
  app.use(passport.initialize());
}

// ==========================================
// 4. API Routes
// ==========================================
// Mount the authentication routes at /api/auth
app.use("/api/auth", authRoutes);

// ==========================================
// 5. Global Error Handling
// ==========================================
// Any errors thrown in routes/controllers will be caught here and formatted consistently.
app.use(errorHandler);

module.exports = app;