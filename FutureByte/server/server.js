const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Simple middleware
app.use(cors());
app.use(express.json());

// Health check
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

// Items API - direct implementation
app.get('/api/items', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const db = mongoose.connection.db;
    const items = await db.collection('items').find().toArray();
    res.json(items);
  } catch (error) {
    console.error('Error getting items:', error);
    res.json([]);
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description required' });
    }
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
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
    console.error('Error creating item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Simple auth endpoint
app.post('/auth/send-otp', (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number required' });
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`📱 OTP for ${phoneNumber}: ${otp}`);
  res.json({ success: true, otp });
});

app.post('/auth/verify-otp', (req, res) => {
  const { phoneNumber, otp } = req.body;
  if (!phoneNumber || !otp) {
    return res.status(400).json({ error: 'Phone and OTP required' });
  }
  const token = Buffer.from(JSON.stringify({
    id: phoneNumber,
    name: `User_${phoneNumber.slice(-4)}`
  })).toString('base64');
  res.json({
    success: true,
    message: 'Verified',
    token,
    user: { id: phoneNumber, name: `User_${phoneNumber.slice(-4)}` }
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.log('⚠️ MongoDB not connected:', err.message));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.path });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
