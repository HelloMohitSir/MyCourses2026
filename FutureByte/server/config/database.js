// config/database.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
let client;
let db;

async function connectDB() {
    try {
        if (!uri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        
        console.log('⏳ Connecting to MongoDB Atlas...');
        console.log('📝 Using URI:', uri.replace(/\/\/.*@/, '//*****@')); // Hide credentials
        
        // Connection options for Node.js 24
        const options = {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4,
            retryWrites: true,
            w: 'majority',
            // Force TLS 1.2
            tls: true,
            tlsAllowInvalidCertificates: true,
            tlsAllowInvalidHostnames: true,
            // Use the MongoDB driver's connection string options
            useUnifiedTopology: true,
            useNewUrlParser: true
        };
        
        client = new MongoClient(uri, options);
        await client.connect();
        console.log('✅ MongoDB Connected Successfully');
        
        db = client.db(process.env.DB_NAME || 'mynotes');
        console.log(`✅ Using database: ${process.env.DB_NAME || 'mynotes'}`);
        
        // Test the connection
        const result = await client.db('admin').command({ ping: 1 });
        console.log('✅ Database Ping Successful');
        
        return db;
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        console.error('Error details:', error);
        throw error;
    }
}

function getDB() {
    if (!db) {
        throw new Error('Database not initialized. Call connectDB() first.');
    }
    return db;
}

function getClient() {
    return client;
}

module.exports = { connectDB, getDB, getClient };
