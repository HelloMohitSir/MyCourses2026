require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory OTP store (for phone auth)
const otpStore = {};

// --- Routes (self-contained for deployment) ---

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'FutureByte API is running!',
    status: 'Connected to MongoDB',
    timestamp: new Date().toISOString(),
    endpoints: {
      items: '/api/items',
      auth: '/auth'
    }
  });
});

// Items API
app.get('/api/items', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const db = mongoose.connection.db;
    const items = await db.collection('items').find().toArray();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description required' });
    }
    const db = mongoose.connection.db;
    const result = await db.collection('items').insertOne({
      name,
      description,
      createdAt: new Date()
    });
    res.status(201).json({ message: 'Item created', id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auth API - Send OTP
app.post('/auth/send-otp', (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number required' });
  }
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[cleanNumber] = { otp, expires: Date.now() + 300000 };
  console.log(`📱 OTP for ${cleanNumber}: ${otp}`);
  res.json({ success: true, message: 'OTP sent', otp: otp });
});

// Auth API - Verify OTP
app.post('/auth/verify-otp', (req, res) => {
  const { phoneNumber, otp } = req.body;
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const stored = otpStore[cleanNumber];
  if (!stored || stored.otp !== otp) {
    return res.status(400).json({ error: 'Invalid OTP' });
  }
  if (Date.now() > stored.expires) {
    delete otpStore[cleanNumber];
    return res.status(400).json({ error: 'OTP expired' });
  }
  delete otpStore[cleanNumber];
  const token = Buffer.from(JSON.stringify({
    id: cleanNumber,
    name: `User_${cleanNumber.slice(-4)}`
  })).toString('base64');
  res.json({ success: true, message: 'Verified', token });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.log('⚠️ MongoDB not connected:', err.message));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.path });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
