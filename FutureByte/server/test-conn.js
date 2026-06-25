const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

async function testConnection() {
    console.log('🔍 Testing MongoDB Connection...');
    console.log('📡 Using URI:', uri.replace(/\/\/.*@/, '//*****@'));
    
    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 10000,
        family: 4,
    });

    try {
        await client.connect();
        console.log('✅ Connected successfully!');
        const db = client.db('admin');
        const result = await db.command({ ping: 1 });
        console.log('✅ Ping successful:', result);
        await client.close();
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('Full error details:', error);
        if (error.message.includes('whitelist')) {
            console.log('\n🔑 IP Whitelist Issue Detected!');
            console.log('Your current IP might not be whitelisted.');
            console.log('Please add this IP to your Atlas whitelist:');
            // Try to get current IP
            try {
                const { execSync } = require('child_process');
                const ip = execSync('curl -s ifconfig.me').toString().trim();
                console.log(`👉 Current IP: ${ip}`);
                console.log(`👉 Current IP (alternative): ${execSync('curl -s ipinfo.io/ip').toString().trim()}`);
            } catch (e) {
                console.log('Could not determine current IP automatically.');
            }
        }
    }
}

testConnection();
