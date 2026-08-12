const { 
  registerUser,
  loginUser ,
  getCurrentUser,
  refreshTokenUser,
  logoutUser,
  verifyEmail: verifyEmailService,
  resendVerificationEmail,
  forgotPassword: forgotPasswordService,
  resetPassword: resetPasswordService,
} = require("../services/auth.service");
const { cookieConfig } = require("../config/cookie");

const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please check your email to verify your account.",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    const { refreshToken, accessToken, user } = result;

    res.cookie("refreshToken", refreshToken, cookieConfig);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user.userId);

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      const error = new Error("Refresh token missing");
      error.statusCode = 401;
      throw error;
    }

    const { accessToken, refreshToken } = await refreshTokenUser(oldRefreshToken);

    res.cookie("refreshToken", refreshToken, cookieConfig);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    await logoutUser(refreshToken);

    res.clearCookie("refreshToken", cookieConfig);

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    await verifyEmailService(token);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    await resendVerificationEmail(email);

    res.status(200).json({
      success: true,
      message: "If your account exists and is not verified, a verification email has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    await forgotPasswordService(email);

    res.status(200).json({
      success: true,
      message: "If an account exists for this email, a password reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    await resetPasswordService(token, newPassword);

    res.status(200).json({
      success: true,
      message: "Password reset successful. All previous sessions have been invalidated.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  me,
  refresh,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
};