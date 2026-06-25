const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Helper function to get database
const getDb = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database not connected');
  }
  return mongoose.connection.db;
};

// Get all items
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const items = await db.collection('items').find().toArray();
    res.json(items);
  } catch (error) {
    console.error('Error getting items:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create item
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    console.log('📝 Creating item:', { name, description });
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!description || description.trim() === '') {
      return res.status(400).json({ error: 'Description is required' });
    }
    
    const db = getDb();
    const result = await db.collection('items').insertOne({
      name: name.trim(),
      description: description.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Item created:', result.insertedId);
    
    res.status(201).json({
      message: 'Item created successfully',
      id: result.insertedId,
      item: {
        _id: result.insertedId,
        name: name.trim(),
        description: description.trim(),
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single item
router.get('/:id', async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const db = getDb();
    const item = await db.collection('items').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update item
router.put('/:id', async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const { name, description } = req.body;
    const db = getDb();
    
    const result = await db.collection('items').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { 
        name: name.trim(), 
        description: description.trim(), 
        updatedAt: new Date() 
      }}
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({ message: 'Item updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete item
router.delete('/:id', async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const db = getDb();
    
    const result = await db.collection('items').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
