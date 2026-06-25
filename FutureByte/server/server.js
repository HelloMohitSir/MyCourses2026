require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;

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

// Import routes
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const studentRoutes = require('./routes/studentRoutes');

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'FutureByte Server is Running!',
    status: 'Connected to MongoDB',
    timestamp: new Date().toISOString(),
    routes: {
      auth: '/auth',
      items: '/api/items',
      students: '/students'
    }
  });
});

// Mount routes
app.use('/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/students', studentRoutes);

// MongoDB Connection - Async with error handling
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4
    });
    console.log('✅ Connected to MongoDB');
    
    // Create items collection if it doesn't exist
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (!collectionNames.includes('items')) {
      console.log('📝 Creating items collection...');
      await db.createCollection('items');
      console.log('✅ Items collection created');
    }
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
}

// Start server
async function startServer() {
  // Connect to database first
  const dbConnected = await connectDB();
  
  if (!dbConnected) {
    console.log('⚠️ Running without database connection');
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api/items`);
    console.log(`🔐 Auth: http://localhost:${PORT}/auth`);
    console.log(`👥 Students: http://localhost:${PORT}/students`);
    console.log(`📊 DB Status: ${dbConnected ? 'Connected ✅' : 'Not Connected ⚠️'}`);
  });
}

startServer();

// 404 handler - MUST be last
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.path}`);
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ 
    message: 'Internal server error',
    error: err.message 
  });
});
