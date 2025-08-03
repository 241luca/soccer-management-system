#!/bin/bash

echo "🔍 Checking Soccer Management System Status..."
echo "============================================"

# Check if backend is running
echo -n "Backend API: "
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Running"
else
    echo "❌ Not responding"
fi

# Check if frontend is running
echo -n "Frontend: "
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Running"
else
    echo "❌ Not responding"
fi

# Check if Prisma Studio is running
echo -n "Prisma Studio: "
if curl -s http://localhost:5555 > /dev/null; then
    echo "✅ Running"
else
    echo "❌ Not responding"
fi

echo ""
echo "Testing login endpoint..."
echo "------------------------"
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@soccermanager.com", "password": "demo123456"}' \
  2>/dev/null | python3 -m json.tool || echo "Failed to parse JSON response"
