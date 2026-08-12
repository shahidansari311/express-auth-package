const { z } = require("zod");

const registerSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
    })
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name cannot exceed 50 characters"),

  email: z
    .string({
      required_error: "Email is required",
    })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),

  password: z
    .string({
      required_error: "Password is required",
    })
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password cannot exceed 128 characters"),
});

const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),

  password: z
    .string({
      required_error: "Password is required",
    })
    .min(1, "Password is required"),
});

const verifyEmailSchema = z.object({
  token: z.string({
    required_error: "Token is required",
  }).min(1, "Token is required"),
});

const resendVerificationSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),
});

module.exports = {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
};