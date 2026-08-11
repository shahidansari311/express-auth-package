const express = require("express");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
  });
});

module.exports = app;