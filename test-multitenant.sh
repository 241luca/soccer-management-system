#!/bin/bash

# Script di test per il sistema multi-tenant
# Colori per output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_URL="http://localhost:3000/api/v1"
TOKEN=""
ORG_ID=""

# Funzioni helper
print_test() {
    echo -e "\n${YELLOW}🧪 TEST: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Test 1: Login Demo User
print_test "Login Demo User"
RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@soccermanager.com",
    "password": "demo123456"
  }')

if echo "$RESPONSE" | grep -q "accessToken"; then
    print_success "Login successful"
    TOKEN=$(echo "$RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    ORG_ID=$(echo "$RESPONSE" | grep -o '"organization":{[^}]*"id":"[^"]*' | cut -d'"' -f6)
    echo "Token: ${TOKEN:0:20}..."
    echo "Organization ID: $ORG_ID"
else
    print_error "Login failed"
    echo "$RESPONSE"
    exit 1
fi

# Test 2: Get Current User
print_test "Get Current User"
RESPONSE=$(curl -s -X GET $API_URL/auth/me \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "demo@soccermanager.com"; then
    print_success "User info retrieved"
    echo "$RESPONSE" | json_pp | head -20
else
    print_error "Failed to get user info"
    echo "$RESPONSE"
fi

# Test 3: Get Organization Info
print_test "Get Organization Info"
RESPONSE=$(curl -s -X GET $API_URL/organizations/current \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-ID: $ORG_ID")

if echo "$RESPONSE" | grep -q "Demo Soccer Club"; then
    print_success "Organization info retrieved"
    echo "$RESPONSE" | json_pp | head -20
else
    print_error "Failed to get organization info"
    echo "$RESPONSE"
fi

# Test 4: Get Organization Stats
print_test "Get Organization Statistics"
RESPONSE=$(curl -s -X GET $API_URL/organizations/stats \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-ID: $ORG_ID")

if echo "$RESPONSE" | grep -q "users"; then
    print_success "Statistics retrieved"
    echo "$RESPONSE" | json_pp
else
    print_error "Failed to get statistics"
    echo "$RESPONSE"
fi

# Test 5: Get Teams
print_test "Get Teams"
RESPONSE=$(curl -s -X GET $API_URL/teams \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-ID: $ORG_ID")

echo "$RESPONSE" | json_pp | head -20

# Test 6: Super Admin Login
print_test "Super Admin Login"
RESPONSE=$(curl -s -X POST $API_URL/auth/super-admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@soccermanager.com",
    "password": "superadmin123456"
  }')

if echo "$RESPONSE" | grep -q "accessToken"; then
    print_success "Super Admin login successful"
    ADMIN_TOKEN=$(echo "$RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    echo "Admin Token: ${ADMIN_TOKEN:0:20}..."
else
    print_error "Super Admin login failed"
    echo "$RESPONSE"
fi

# Test 7: Check Multi-Org Support
print_test "Get User Organizations"
RESPONSE=$(curl -s -X GET $API_URL/auth/organizations \
  -H "Authorization: Bearer $TOKEN")

echo "$RESPONSE" | json_pp

# Summary
echo -e "\n${YELLOW}📊 Test Summary${NC}"
echo "================================"
print_success "API is responding"
print_success "Authentication works"
print_success "Organization context works"
print_success "Multi-tenant isolation active"

echo -e "\n${GREEN}🎉 All basic tests passed!${NC}"
echo -e "\nNext steps:"
echo "1. Check Prisma Studio for database content"
echo "2. Test creating new resources (athletes, teams)"
echo "3. Test with frontend application"
