#!/bin/bash

echo "=== TEST DETTAGLIATO UPDATE ATHLETE ==="
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

# Test con curl verbose per vedere esattamente cosa succede
echo "Test update con birthDate..."
echo ""

curl -X PUT "http://localhost:3000/api/v1/athletes/3f76ff9c-4753-4f1e-94ee-6f0a60cbebbd" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-ID: c84fcaaf-4e94-4f42-b901-a080c1f2280e" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Luca",
    "lastName": "Bianchi",
    "birthDate": "2009-01-01",
    "teamId": "01730518-3fec-4e7d-9b41-d1b59c5e212e"
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -v 2>&1 | grep -A 20 -E "(< HTTP|< |Invalid|error|message)"

echo ""
echo "Verifica struttura atleta nel DB..."
psql -U lucamambelli -d soccer_management -c "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'Athlete' ORDER BY ordinal_position;" | head -30
