#!/bin/bash

# Demo Start Script for Network Sharing
# This script starts the demo and exposes it to the local network

echo "🎯 Starting Live of Interest Bot - DEMO MODE (Network Sharing)"
echo "This demo will be accessible to anyone on your local network!"
echo ""
echo "⚙️  Setting up demo configuration..."

# Create .env.demo if it doesn't exist
if [ ! -f "frontend/.env.demo" ]; then
  echo "VITE_DEMO_MODE=true" > frontend/.env.demo
fi

echo "✅ Configuration ready"
echo ""
echo "🚀 Starting frontend in network sharing mode..."
echo ""

# Get local IP
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "unknown")

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Demo is ready and SHARED on network!"
echo ""
echo "📍 访问方式："
echo ""
echo "   🖥️  你自己访问:"
echo "      👉 http://localhost:3001"
echo ""
echo "   👥 同事访问（在同一个WiFi/网络下）:"
echo "      👉 http://${LOCAL_IP}:3001"
echo ""
echo "   📋 把这个链接发给同事："
echo "      ✨ http://${LOCAL_IP}:3001 ✨"
echo ""
echo "🎮 Demo Features:"
echo "   ✓ View pre-loaded Live of Interest data"
echo "   ✓ Create new LOIs"
echo "   ✓ Edit existing LOIs"
echo "   ✓ Teams simulator with bot interaction"
echo "   ✓ Real-time synchronization demo"
echo ""
echo "⚠️  注意事项："
echo "   • 你和同事必须连接到同一个WiFi/局域网"
echo "   • 确保防火墙没有阻止3001端口"
echo "   • 这是演示模式，数据不会保存"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 Press Ctrl+C to stop the demo"
echo ""

cd frontend && VITE_DEMO_MODE=true npm run dev -- --host

