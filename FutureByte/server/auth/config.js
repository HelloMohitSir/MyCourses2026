require('dotenv').config();

module.exports = {
  // Google OAuth
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/auth/google/callback'
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this',
    expiresIn: '7d'
  },
  
  // OTP settings
  otp: {
    length: 6,
    expiresIn: 300000 // 5 minutes in milliseconds
  }
};
