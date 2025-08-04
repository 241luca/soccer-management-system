#!/bin/bash

echo "⏳ Waiting for backend to start..."
sleep 5

echo ""
echo "🔍 Testing API Health Check..."
curl -s http://localhost:3000/health | python3 -m json.tool

echo ""
echo "🔐 Testing Login Endpoint with admin@demosoccerclub.com..."
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@demosoccerclub.com", "password": "admin123"}' \
  2>/dev/null | python3 -m json.tool | head -20

echo ""
echo "If you see JSON responses above, the API is working! ✅"
echo "If not, check the backend terminal for errors. ❌"
