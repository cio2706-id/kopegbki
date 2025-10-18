#!/bin/bash

# Koperasi Pegawai Development Startup Script

echo "🚀 Starting Koperasi Pegawai Web Application..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env file with your configuration before running again."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd client && npm install && cd ..
fi

echo "🔧 Starting development servers..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""

# Start both servers concurrently
npm run dev