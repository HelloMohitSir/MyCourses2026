const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// In-memory OTP store (use Redis in production)
const otpStore = {};

// Send OTP
router.post('/send-otp', (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number required' });
    }

    // Clean phone number (remove non-digits)
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with the specific phone number
    otpStore[cleanNumber] = { 
      otp, 
      expires: Date.now() + 300000,
      phoneNumber: cleanNumber
    };
    
    console.log(`📱 OTP generated for ${cleanNumber}: ${otp}`);
    console.log(`📦 Current OTP Store:`, Object.keys(otpStore));
    
    res.json({
      success: true,
      message: 'OTP sent successfully',
      otp: otp, // In development only
      phoneNumber: cleanNumber
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP and login/register
router.post('/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    
    if (!phoneNumber || !otp) {
      return res.status(400).json({ error: 'Phone and OTP required' });
    }

    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const stored = otpStore[cleanNumber];
    
    console.log(`🔍 Verifying OTP for: ${cleanNumber}`);
    console.log(`🔍 Stored OTP:`, stored);
    
    if (!stored) {
      return res.status(400).json({ error: 'No OTP found for this number' });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (Date.now() > stored.expires) {
      delete otpStore[cleanNumber];
      return res.status(400).json({ error: 'OTP expired' });
    }

    // Clear OTP after successful verification
    delete otpStore[cleanNumber];
    
    // IMPORTANT: Find or create user by phone number
    // This ensures each phone number gets a unique user
    let user = await User.findOne({ phoneNumber: cleanNumber });
    
    if (!user) {
      console.log(`🆕 Creating new student for: ${cleanNumber}`);
      // Create new student with unique ID
      const year = new Date().getFullYear();
      const count = await User.countDocuments({ role: 'student' });
      const studentId = `STU${year}${String(count + 1).padStart(4, '0')}`;
      
      user = new User({
        phoneNumber: cleanNumber,
        name: `Student_${cleanNumber.slice(-4)}`,
        email: `${cleanNumber}@student.temp`,
        role: 'student',
        isPhoneVerified: true,
        studentId: studentId,
        // Generate a random avatar color
        avatar: `https://ui-avatars.com/api/?name=Student+${cleanNumber.slice(-4)}&background=random`
      });
      
      await user.save();
      console.log(`✅ New student created: ${user.studentId} (${user.name})`);
    } else {
      console.log(`♻️ Existing student found: ${user.studentId} (${user.name})`);
      // Update existing user
      user.isPhoneVerified = true;
      user.lastLogin = new Date();
      await user.save();
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role,
        studentId: user.studentId,
        phoneNumber: user.phoneNumber
      },
      process.env.JWT_SECRET || 'your-secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Phone verified successfully',
      token,
      user: {
        id: user._id,
        studentId: user.studentId,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isPhoneVerified: user.isPhoneVerified,
        grade: user.grade,
        major: user.major,
        university: user.university
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret');
    const user = await User.findById(decoded.id)
      .select('-otp -otpExpires -__v');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get user by phone number (for debugging)
router.get('/user/:phoneNumber', async (req, res) => {
  try {
    const cleanNumber = req.params.phoneNumber.replace(/[^0-9]/g, '');
    const user = await User.findOne({ phoneNumber: cleanNumber })
      .select('-otp -otpExpires -__v');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all students (for debugging)
router.get('/all-students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('studentId name phoneNumber email grade major createdAt')
      .sort({ createdAt: -1 });
    res.json({ 
      count: students.length,
      students 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
