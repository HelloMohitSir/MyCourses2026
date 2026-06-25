const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Google OAuth fields
  googleId: { type: String, sparse: true },
  email: { type: String, required: true },
  name: { type: String },
  avatar: { type: String },
  
  // Phone verification fields
  phoneNumber: { type: String, sparse: true },
  isPhoneVerified: { type: Boolean, default: false },
  
  // OTP fields
  otp: { type: String },
  otpExpires: { type: Date },
  
  // Common fields
  password: { type: String },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

module.exports = mongoose.model('User', userSchema);
