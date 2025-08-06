#!/bin/bash

echo "=== ANALISI METODI API CHE NECESSITANO DATA CLEANING ==="
echo ""
echo "Cercando tutti i metodi create/update in api.js..."
echo ""

cd /Users/lucamambelli/Desktop/soccer-management-system/src/services

echo "1. METODI CREATE:"
grep -n "async create" api.js | grep -v "createAthlete"
echo ""

echo "2. METODI UPDATE:"
grep -n "async update" api.js | grep -v "updateAthlete"
echo ""

echo "3. METODI REGISTER/LOGIN:"
grep -n "async register\|async login" api.js
echo ""

echo "4. ALTRI METODI POST/PUT:"
grep -n "method: 'POST'\|method: 'PUT'" api.js | head -20
echo ""

echo "5. METODI CON 'add' NEL NOME:"
grep -n "async add" api.js
echo ""

echo "6. METODI PATCH:"
grep -n "async patch\|method: 'PATCH'" api.js
