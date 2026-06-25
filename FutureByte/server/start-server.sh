#!/bin/bash
cd /workspaces/MyCourses2026/FutureByte/server

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file..."
  cat > .env << 'ENV'
MONGODB_URI=mongodb+srv://mohitsingh12425_db_user:QtsCFdEJWNrG7jzH@mynotes.vhlc0wl.mongodb.net/?appName=MyNotes
PORT=5000
DB_NAME=mynotes
ENV
fi

# Kill existing processes
pkill -f node || true
sleep 2

# Start server
echo "🚀 Starting server..."
node server.js
