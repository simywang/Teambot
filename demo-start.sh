#!/bin/bash

echo "🎯 Starting Live of Interest Bot - DEMO MODE"
echo ""
echo "This is a demo version with mock data."
echo "No backend or database required!"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo "✅ Dependencies installed"
    echo ""
fi

# Copy demo environment file
echo "⚙️  Setting up demo configuration..."
cp frontend/.env.demo frontend/.env
echo "✅ Configuration ready"
echo ""

# Start frontend
echo "🚀 Starting frontend in demo mode..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Demo is ready!"
echo ""
echo "📍 Open your browser and visit:"
echo "   👉 http://localhost:3001"
echo ""
echo "🎮 Demo Features:"
echo "   ✓ View pre-loaded Live of Interest data"
echo "   ✓ Create new LOIs"
echo "   ✓ Edit existing LOIs"
echo "   ✓ Delete LOIs"
echo "   ✓ Search and filter"
echo "   ✓ Microsoft Teams-style UI"
echo ""
echo "ℹ️  Note: This is demo mode with mock data"
echo "   No Teams integration or real AI processing"
echo "   All changes are temporary (page reload resets data)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Press Ctrl+C to stop the demo"
echo ""

# Trap Ctrl+C to cleanup
trap "echo ''; echo '🛑 Stopping demo...'; kill $FRONTEND_PID 2>/dev/null; echo '✅ Demo stopped'; exit" INT

# Wait for process
wait

