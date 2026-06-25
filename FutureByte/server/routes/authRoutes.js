const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Simple in-memory OTP storage (for development)
const otpStorage = {};

// Generate JWT token
const generateToken = (userData) => {
  const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
  return jwt.sign(
    { id: userData.id, email: userData.email, name: userData.name },
    secret,
    { expiresIn: '7d' }
  );
};

// Send OTP
router.post('/send-otp', (req, res) => {
  try {
    const { phoneNumber } = req.body;
    console.log('📱 Received phone number:', phoneNumber);
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]{10,15}$/;
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (!phoneRegex.test(cleanNumber)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 300000); // 5 minutes

    // Store OTP
    otpStorage[cleanNumber] = {
      otp,
      expiresAt,
      attempts: 0
    };

    console.log(`📱 [DEV] OTP for ${cleanNumber}: ${otp}`);
    console.log(`⏰ Expires: ${expiresAt.toLocaleString()}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      expiresAt: expiresAt,
      // Include OTP in development only
      ...(process.env.NODE_ENV !== 'production' && { otp })
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP: ' + error.message });
  }
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    console.log('🔐 Verifying OTP for:', phoneNumber);
    
    if (!phoneNumber || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const storedData = otpStorage[cleanNumber];

    if (!storedData) {
      return res.status(400).json({ error: 'No OTP found for this number' });
    }

    if (storedData.attempts >= 3) {
      delete otpStorage[cleanNumber];
      return res.status(400).json({ error: 'Too many attempts. Please request a new OTP.' });
    }

    if (new Date() > storedData.expiresAt) {
      delete otpStorage[cleanNumber];
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (storedData.otp !== otp) {
      storedData.attempts += 1;
      return res.status(400).json({ error: `Invalid OTP. ${3 - storedData.attempts} attempts remaining.` });
    }

    // OTP is valid - delete it
    delete otpStorage[cleanNumber];

    // Generate JWT token
    const token = generateToken({
      id: cleanNumber,
      name: `User_${cleanNumber.slice(-4)}`,
      email: `${cleanNumber}@user.temp`,
      phoneNumber: cleanNumber
    });

    res.json({
      success: true,
      message: 'Phone verified successfully',
      token,
      user: {
        id: cleanNumber,
        name: `User_${cleanNumber.slice(-4)}`,
        phoneNumber: cleanNumber,
        isPhoneVerified: true
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP: ' + error.message });
  }
});

// Get current user from token
router.get('/me', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    const decoded = jwt.verify(token, secret);
    
    res.json({ user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Debug route to see stored OTPs (development only)
if (process.env.NODE_ENV !== 'production') {
  router.get('/debug', (req, res) => {
    res.json({ 
      otpStorage: Object.keys(otpStorage).map(key => ({
        phone: key,
        otp: otpStorage[key].otp,
        expiresAt: otpStorage[key].expiresAt
      }))
    });
  });
}

module.exports = router;
