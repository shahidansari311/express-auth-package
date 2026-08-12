const express = require("express");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/error.middleware");

const authRoutes = require("./routes/auth.routes");
const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
  });
});

app.use("/api/auth", authRoutes);

app.use(errorHandler);

module.exports = app;