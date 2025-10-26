#!/bin/bash

# Live of Interest Teams Bot Startup Script

echo "🚀 Starting Live of Interest Teams Bot..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

if ! command_exists psql; then
    echo "⚠️  PostgreSQL client not found. Make sure PostgreSQL is installed and running."
fi

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found. Copying from .env.example..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your credentials before continuing."
    exit 1
fi

if [ ! -f "frontend/.env" ]; then
    echo "ℹ️  Frontend .env not found. Using defaults..."
fi

# Start PostgreSQL check
echo "🔍 Checking PostgreSQL connection..."
if command_exists psql; then
    psql -lqt | cut -d \| -f 1 | grep -qw loi_database
    if [ $? -eq 0 ]; then
        echo "✅ Database 'loi_database' found"
    else
        echo "⚠️  Database 'loi_database' not found"
        echo "   Run: createdb loi_database && psql loi_database < database/schema.sql"
    fi
fi

# Install backend dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Start backend
echo "🔧 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Services started successfully!"
echo ""
echo "📍 Backend (Bot): http://localhost:3978"
echo "📍 Backend (API): http://localhost:3000"
echo "📍 Frontend: http://localhost:3001"
echo ""
echo "💡 Press Ctrl+C to stop all services"
echo ""

# Trap Ctrl+C to cleanup
trap "echo ''; echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✅ Services stopped'; exit" INT

# Wait for processes
wait

