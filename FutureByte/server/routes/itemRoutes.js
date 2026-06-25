const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

// Get all items
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const items = await db.collection('items').find().toArray();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create item
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const db = getDB();
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

// Get single item
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const item = await db.collection('items').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update item
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const db = getDB();
    const result = await db.collection('items').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { name, description, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete item
router.delete('/:id', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('items').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
