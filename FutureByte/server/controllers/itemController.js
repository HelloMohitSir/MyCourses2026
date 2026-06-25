// controllers/itemController.js
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const Item = require('../models/Item');

const collection = () => getDB().collection('items');

// Get all items
const getAllItems = async (req, res) => {
    try {
        const items = await collection().find().toArray();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single item
const getItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await collection().findOne({ _id: new ObjectId(id) });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create item
const createItem = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        // Validate
        Item.validate({ name, description });
        
        const newItem = new Item({ name, description });
        const result = await collection().insertOne(newItem);
        
        res.status(201).json({
            message: 'Item created successfully',
            id: result.insertedId,
            item: newItem
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update item
const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        
        // Validate
        Item.validate({ name, description });
        
        const result = await collection().updateOne(
            { _id: new ObjectId(id) },
            { $set: { name, description, updatedAt: new Date() } }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        
        res.json({ message: 'Item updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete item
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await collection().deleteOne({ _id: new ObjectId(id) });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem
};
