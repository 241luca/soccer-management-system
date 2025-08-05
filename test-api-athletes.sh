#!/bin/bash

echo "=== TEST API ATLETI ==="
echo ""

# Prima facciamo login come super admin per ottenere un token valido
echo "1. Login Super Admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/super-admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@soccermanager.com","password":"superadmin123456"}')

# Estrai il token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "ERRORE: Impossibile ottenere token"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "Token ottenuto: ${TOKEN:0:20}..."
echo ""

# Test chiamata atleti per Demo org
echo "2. Test API Atleti per Demo Soccer Club..."
echo "URL: http://localhost:3000/api/v1/athletes"
echo "Headers:"
echo "  - Authorization: Bearer $TOKEN"
echo "  - X-Organization-ID: c84fcaaf-4e94-4f42-b901-a080c1f2280e"
echo ""

ATHLETES_RESPONSE=$(curl -s http://localhost:3000/api/v1/athletes \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-ID: c84fcaaf-4e94-4f42-b901-a080c1f2280e")

echo "Risposta API:"
echo "$ATHLETES_RESPONSE" | python3 -m json.tool

# Conta atleti
ATHLETE_COUNT=$(echo "$ATHLETES_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data.get('data', [])))")
echo ""
echo "Numero atleti trovati: $ATHLETE_COUNT"

# Verifica direttamente nel database
echo ""
echo "3. Verifica diretta database..."
psql -U lucamambelli -d soccer_management -t -c "SELECT COUNT(*) as total FROM \"Athlete\" WHERE \"organizationId\" = 'c84fcaaf-4e94-4f42-b901-a080c1f2280e';"
