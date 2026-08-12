const { 
  registerUser,
  loginUser ,
  getCurrentUser,
  refreshTokenUser
} = require("../services/auth.service");
const { cookieConfig } = require("../config/cookie");

const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
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

module.exports = {
  register,
  login,
  me,
  refresh
};