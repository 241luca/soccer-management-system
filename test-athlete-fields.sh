#!/bin/bash

echo "=== TEST CAMPI ATLETA ==="
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

# Test 1: Solo campi obbligatori
echo "Test 1: Solo campi obbligatori (firstName, lastName, birthDate)"
curl -X PUT "http://localhost:3000/api/v1/athletes/9cd49c6b-bb48-4574-bcc3-d07dbecef0e8" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-ID: c84fcaaf-4e94-4f42-b901-a080c1f2280e" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Update",
    "birthDate": "2006-01-01T00:00:00.000Z"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "Test 2: Con teamId"
curl -X PUT "http://localhost:3000/api/v1/athletes/9cd49c6b-bb48-4574-bcc3-d07dbecef0e8" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-ID: c84fcaaf-4e94-4f42-b901-a080c1f2280e" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Update",
    "birthDate": "2006-01-01T00:00:00.000Z",
    "teamId": "1d4b6e10-80a0-407f-8efa-c20acfa73125"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "Test 3: Con tutti i campi dal browser"
curl -X PUT "http://localhost:3000/api/v1/athletes/9cd49c6b-bb48-4574-bcc3-d07dbecef0e8" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-ID: c84fcaaf-4e94-4f42-b901-a080c1f2280e" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Stefano",
    "lastName": "Bianco",
    "teamId": "1d4b6e10-80a0-407f-8efa-c20acfa73125",
    "phone": "335-1234567",
    "email": "stefano.bianco@demo.com",
    "address": "a",
    "birthDate": "2006-01-01T00:00:00.000Z",
    "usesTransport": false
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | head -20
