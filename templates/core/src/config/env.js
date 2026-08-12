const validateEnv = () => {
  const required = [
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "CORS_ORIGIN",
  ];

  const missing = required.filter((key) => !process.env[key]);

  // Database URL check
  if (!process.env.MONGO_URI && !process.env.DATABASE_URL) {
    missing.push("MONGO_URI or DATABASE_URL");
  }

  if (missing.length > 0) {
    console.error(
      "❌ FATAL ERROR: Missing required environment variables:"
    );
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error("Please check your .env file.");
    process.exit(1);
  }
};

module.exports = { validateEnv };
