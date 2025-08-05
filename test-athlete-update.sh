#!/bin/bash

echo "=== TEST UPDATE ATHLETE API ==="
echo ""

# Prima facciamo login come super admin
echo "1. Login Super Admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/super-admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@soccermanager.com","password":"superadmin123456"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "ERRORE: Impossibile ottenere token"
    exit 1
fi

echo "Token ottenuto!"
echo ""

# Prendi il primo atleta
echo "2. Prendi primo atleta..."
ATHLETE_RESPONSE=$(curl -s http://localhost:3000/api/v1/athletes \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-ID: c84fcaaf-4e94-4f42-b901-a080c1f2280e")

FIRST_ATHLETE_ID=$(echo "$ATHLETE_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['data'][0]['id'] if data.get('data') else 'ERROR')")

echo "ID primo atleta: $FIRST_ATHLETE_ID"
echo ""

# Test update con diversi payload
echo "3. Test update con payload minimo..."

# Test 1: Solo firstName e lastName
curl -X PUT "http://localhost:3000/api/v1/athletes/$FIRST_ATHLETE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-ID: c84fcaaf-4e94-4f42-b901-a080c1f2280e" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Update"
  }' \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "4. Verifica campi richiesti..."

# Test con campi che potrebbero essere problematici
curl -X PUT "http://localhost:3000/api/v1/athletes/$FIRST_ATHLETE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-ID: c84fcaaf-4e94-4f42-b901-a080c1f2280e" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Lorenzo",
    "lastName": "Arancio",
    "birthDate": "2007-01-01",
    "teamId": "523aaf89-63f2-410e-a293-0dfc6acaee7b"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -v 2>&1 | grep -E "(HTTP|<|>|{|})""
