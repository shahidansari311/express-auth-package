const cookieConfig = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: process.env.COOKIE_SAME_SITE || "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

if (process.env.COOKIE_DOMAIN) {
  cookieConfig.domain = process.env.COOKIE_DOMAIN;
}

module.exports = {
  cookieConfig,
};
