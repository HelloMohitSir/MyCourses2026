const twilio = require('twilio');
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const config = require('./config');
const User = require('../models/User');

class PhoneService {
  constructor() {
    this.client = twilio(
      config.twilio.accountSid,
      config.twilio.authToken
    );
  }

  // Validate phone number
  validatePhoneNumber(phoneNumber) {
    try {
      const parsed = parsePhoneNumberFromString(phoneNumber);
      if (!parsed || !parsed.isValid()) {
        return { isValid: false, message: 'Invalid phone number format' };
      }
      return { 
        isValid: true, 
        e164: parsed.format('E.164'),
        country: parsed.country,
        nationalNumber: parsed.nationalNumber
      };
    } catch (error) {
      return { isValid: false, message: 'Invalid phone number' };
    }
  }

  // Generate OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP via Twilio
  async sendOTP(phoneNumber) {
    try {
      // Validate phone number
      const validation = this.validatePhoneNumber(phoneNumber);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // Generate OTP
      const otp = this.generateOTP();
      const expires = new Date(Date.now() + 300000); // 5 minutes

      // Save OTP to user document
      let user = await User.findOne({ phoneNumber: validation.e164 });
      if (!user) {
        user = new User({
          phoneNumber: validation.e164,
          name: `User_${validation.e164.slice(-4)}`,
          email: `${validation.e164}@temp.user`
        });
      }
      user.otp = otp;
      user.otpExpires = expires;
      await user.save();

      // Send SMS via Twilio
      if (process.env.NODE_ENV === 'production') {
        await this.client.messages.create({
          body: `Your FutureByte verification code is: ${otp}. Valid for 5 minutes.`,
          to: validation.e164,
          from: config.twilio.phoneNumber
        });
        console.log(`📱 OTP sent to ${validation.e164}: ${otp}`);
      } else {
        // Development mode - log OTP
        console.log(`📱 [DEV] OTP for ${validation.e164}: ${otp}`);
        console.log(`⏰ Expires: ${expires.toLocaleString()}`);
      }

      return { 
        success: true, 
        message: 'OTP sent successfully',
        expiresAt: expires,
        // Only include for development
        ...(process.env.NODE_ENV !== 'production' && { otp })
      };
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(phoneNumber, otp) {
    try {
      const validation = this.validatePhoneNumber(phoneNumber);
      if (!validation.isValid) {
        throw new Error('Invalid phone number');
      }

      const user = await User.findOne({ 
        phoneNumber: validation.e164,
        otp: otp,
        otpExpires: { $gt: new Date() }
      });

      if (!user) {
        throw new Error('Invalid or expired OTP');
      }

      // Mark phone as verified
      user.isPhoneVerified = true;
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();

      return { 
        success: true, 
        user,
        message: 'Phone verified successfully'
      };
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  }
}

module.exports = new PhoneService();
