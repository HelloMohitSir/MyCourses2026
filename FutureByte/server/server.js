require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', '*'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path}`);
  next();
});

// Simple test routes first
app.get('/test', (req, res) => {
  res.json({ message: 'Test route working!' });
});

app.post('/test-post', (req, res) => {
  res.json({ message: 'Test POST working!', data: req.body });
});

// Auth routes directly in server.js for testing
// Send OTP
app.post('/auth/send-otp', (req, res) => {
  try {
    const { phoneNumber } = req.body;
    console.log('📱 Received phone number:', phoneNumber);
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 300000);

    console.log(`📱 [DEV] OTP for ${phoneNumber}: ${otp}`);
    console.log(`⏰ Expires: ${expiresAt.toLocaleString()}`);

    // Store in memory (for development)
    if (!global.otpStore) global.otpStore = {};
    global.otpStore[phoneNumber] = { otp, expiresAt };

    res.json({
      success: true,
      message: 'OTP sent successfully',
      expiresAt: expiresAt,
      otp: otp // Include OTP in response for development
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP: ' + error.message });
  }
});

// Verify OTP
app.post('/auth/verify-otp', (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    console.log('🔐 Verifying OTP for:', phoneNumber);
    
    if (!phoneNumber || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    const storedData = global.otpStore?.[phoneNumber];

    if (!storedData) {
      return res.status(400).json({ error: 'No OTP found for this number' });
    }

    if (new Date() > storedData.expiresAt) {
      delete global.otpStore[phoneNumber];
      return res.status(400).json({ error: 'OTP has expired' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // OTP is valid - delete it
    delete global.otpStore[phoneNumber];

    // Generate a simple token
    const token = Buffer.from(JSON.stringify({
      id: phoneNumber,
      name: `User_${phoneNumber.slice(-4)}`,
      phoneNumber: phoneNumber,
      isPhoneVerified: true
    })).toString('base64');

    res.json({
      success: true,
      message: 'Phone verified successfully',
      token: token,
      user: {
        id: phoneNumber,
        name: `User_${phoneNumber.slice(-4)}`,
        phoneNumber: phoneNumber,
        isPhoneVerified: true
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP: ' + error.message });
  }
});

// Debug route to see stored OTPs
app.get('/auth/debug', (req, res) => {
  res.json({ 
    otpStore: global.otpStore || {},
    routes: ['/test', '/test-post', '/auth/send-otp', '/auth/verify-otp', '/auth/debug']
  });
});

// Get current user from token
app.get('/auth/me', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      res.json({ user: decoded });
    } catch (e) {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Items routes
app.get('/api/items', async (req, res) => {
  try {
    // Check if mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const db = mongoose.connection.db;
    const items = await db.collection('items').find().toArray();
    res.json(items);
  } catch (error) {
    console.error('Error getting items:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const { name, description } = req.body;
    const db = mongoose.connection.db;
    const result = await db.collection('items').insertOne({
      name,
      description,
      createdAt: new Date()
    });
    res.status(201).json({
      message: 'Item created',
      id: result.insertedId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'FutureByte Server is Running!',
    status: 'Connected to MongoDB',
    timestamp: new Date().toISOString(),
    routes: {
      test: 'http://localhost:5000/test',
      auth: {
        sendOTP: 'http://localhost:5000/auth/send-otp',
        verifyOTP: 'http://localhost:5000/auth/verify-otp',
        debug: 'http://localhost:5000/auth/debug'
      },
      items: 'http://localhost:5000/api/items'
    }
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err.message));

// 404 Handler - This must be LAST
app.use((req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ 
    message: 'Internal server error',
    error: err.message 
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/items`);
  console.log(`📱 Auth: http://localhost:${PORT}/auth/send-otp`);
  console.log(`🔍 Debug: http://localhost:${PORT}/auth/debug`);
  console.log(`🧪 Test: http://localhost:${PORT}/test`);
});
