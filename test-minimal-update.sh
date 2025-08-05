#!/bin/bash

echo "=== TEST MINIMO UPDATE ATHLETE ==="
echo ""

# Login
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

# Prendi un atleta per vedere la struttura
echo "1. Recupera atleta esistente..."
ATHLETE=$(curl -s "http://localhost:3000/api/v1/athletes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-ID: c84fcaaf-4e94-4f42-b901-a080c1f2280e" | python3 -c "import sys, json; data = json.load(sys.stdin); print(json.dumps(data['data'][0], indent=2))")

echo "Atleta attuale:"
echo "$ATHLETE" | head -20
echo ""

# Test con solo campi obbligatori
echo "2. Test update con campi minimi..."
echo "Payload:"
echo '{
  "firstName": "Test",
  "lastName": "Update",
  "birthDate": "2009-01-01T00:00:00.000Z"
}'
echo ""

curl -X PUT "http://localhost:3000/api/v1/athletes/3f76ff9c-4753-4f1e-94ee-6f0a60cbebbd" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-ID: c84fcaaf-4e94-4f42-b901-a080c1f2280e" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Update",
    "birthDate": "2009-01-01T00:00:00.000Z"
  }' \
  -i

echo ""
echo ""
echo "3. Verifica errore specifico nel backend..."
echo "Guarda il terminale del backend per messaggi di errore dettagliati"
