#!/bin/bash

echo "Testing Athletes API..."

# Get token for super admin
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/super-admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@soccermanager.com","password":"superadmin123456"}' | \
  grep -o '"accessToken":"[^"]*' | grep -o '[^"]*$')

echo "Token: $TOKEN"

# Test athletes endpoint
echo -e "\n\nTesting /api/v1/athletes..."
curl -s http://localhost:3000/api/v1/athletes \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-ID: c84fcaaf-4e94-4f42-b901-a080c1f2280e" \
  -H "X-Super-Admin: true" | \
  python3 -m json.tool

echo -e "\n\nTesting /api/v1/teams..."
curl -s http://localhost:3000/api/v1/teams \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-ID: c84fcaaf-4e94-4f42-b901-a080c1f2280e" \
  -H "X-Super-Admin: true" | \
  python3 -m json.tool
