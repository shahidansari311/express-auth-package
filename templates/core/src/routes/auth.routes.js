const express = require("express");

const { register,login, me } = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");
const { 
  registerSchema,
  loginSchema 
} = require("../validators/auth.validator");
const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

router.post(
  "/register",
  validate(registerSchema),
  register
);

router.post(
  "/login",
  validate(loginSchema),
  login
);

router.get(
  "/me",
  authenticate,
  me
);

module.exports = router;