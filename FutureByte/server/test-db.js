// test-db.js - Test MongoDB Connection
require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function testConnection() {
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db(process.env.DB_NAME || 'mynotes');
        const collections = await db.listCollections().toArray();
        console.log('📚 Collections:', collections.map(c => c.name));
        
        // Test insert
        const collection = db.collection('items');
        const testItem = await collection.findOne();
        console.log('📝 Sample item:', testItem);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
    }
}

testConnection();
