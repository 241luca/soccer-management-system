#!/bin/bash

echo "🚀 Creazione utente demo nel database..."
echo ""

cd /Users/lucamambelli/Desktop/soccer-management-system/backend

# Esegui lo script di setup
npx ts-node src/scripts/setup-demo.ts

echo ""
echo "✅ Setup completato!"
echo ""
echo "🔄 Ora riavvia il frontend:"
echo "1. Ferma il frontend con Ctrl+C"
echo "2. Riavvialo con: npm run dev"
echo "3. Vai su http://localhost:5173"
echo "4. Login con: demo@soccermanager.com / demo123456"
