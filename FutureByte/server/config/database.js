// config/database.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db(process.env.DB_NAME || 'mynotes');
        console.log('✅ MongoDB Connected Successfully');
        
        await client.db('admin').command({ ping: 1 });
        console.log('✅ Database Ping Successful');
        
        return db;
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        process.exit(1);
    }
}

function getDB() {
    return db;
}

module.exports = { connectDB, getDB };
