const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { oauthLoginUser } = require("../services/auth.service");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "PLACEHOLDER",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "PLACEHOLDER",
      callbackURL: "/api/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const result = await oauthLoginUser(profile);
        return done(null, result);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

module.exports = passport;
