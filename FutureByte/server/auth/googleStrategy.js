const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('./config');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'dummy_client_id') {
  passport.use(new GoogleStrategy({
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL
    },
    async function(accessToken, refreshToken, profile, done) {
      try {
        // Find or create user
        let user = await User.findOne({ googleId: profile.id });
        
        if (!user) {
          // Check if user exists with same email
          user = await User.findOne({ email: profile.emails[0].value });
          
          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.avatar = user.avatar || profile.photos[0]?.value;
            await user.save();
          } else {
            // Create new user
            user = new User({
              googleId: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
              avatar: profile.photos[0]?.value,
              isPhoneVerified: false
            });
            await user.save();
          }
        }

        // Generate JWT
        const token = jwt.sign(
          { id: user._id, email: user.email, name: user.name },
          config.jwt.secret,
          { expiresIn: config.jwt.expiresIn }
        );

        return done(null, { user, token });
      } catch (error) {
        return done(error, null);
      }
    }
  ));
} else {
  console.log('⚠️ Google OAuth not configured. Skipping strategy setup.');
}

module.exports = passport;
