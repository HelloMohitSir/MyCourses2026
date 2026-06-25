require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB Connection with Mongoose
const uri = process.env.MONGODB_URI;

// Define Item Schema
const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Item = mongoose.model('Item', itemSchema);

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'FutureByte Server is Running!',
        status: 'Connected to MongoDB via Mongoose',
        timestamp: new Date().toISOString(),
        endpoints: {
            items: 'http://localhost:5000/api/items'
        }
    });
});

// Get all items
app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (error) {
        console.error('Error in GET /api/items:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create item
app.post('/api/items', async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Name is required' });
        }
        if (!description || description.trim() === '') {
            return res.status(400).json({ error: 'Description is required' });
        }
        
        const item = new Item({ 
            name: name.trim(), 
            description: description.trim() 
        });
        await item.save();
        
        res.status(201).json({
            message: 'Item created successfully',
            id: item._id,
            item: item
        });
    } catch (error) {
        console.error('Error in POST /api/items:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get single item
app.get('/api/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (error) {
        console.error('Error in GET /api/items/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update item
app.put('/api/items/:id', async (req, res) => {
    try {
        const { name, description } = req.body;
        const item = await Item.findByIdAndUpdate(
            req.params.id,
            { name, description, updatedAt: new Date() },
            { new: true, runValidators: true }
        );
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item updated successfully', item });
    } catch (error) {
        console.error('Error in PUT /api/items/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete item
app.delete('/api/items/:id', async (req, res) => {
    try {
        const item = await Item.findByIdAndDelete(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error in DELETE /api/items/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// Start server with Mongoose connection
async function startServer() {
    try {
        // Mongoose connection options for Node.js 24
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4,
            // These options help with SSL compatibility
            tls: true,
            tlsAllowInvalidCertificates: true,
            tlsAllowInvalidHostnames: true,
            retryWrites: true,
            w: 'majority'
        });
        
        console.log('✅ Connected to MongoDB via Mongoose');
        console.log(`✅ Database: ${mongoose.connection.name}`);
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📡 API: http://localhost:${PORT}/api/items`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();
