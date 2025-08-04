#!/bin/bash

echo "🚀 Setup Multi-Società per Soccer Management System"
echo "===================================================="
echo ""

# Vai nella directory backend
cd backend

# Installa le dipendenze se necessario
if [ ! -d "node_modules" ]; then
    echo "📦 Installazione dipendenze backend..."
    npm install
fi

# Genera il client Prisma
echo "🔧 Generazione client Prisma..."
npx prisma generate

# Esegui lo script per creare la società di produzione
echo ""
echo "🏢 Creazione società di produzione..."
echo ""
node scripts/create-production-organization.js

echo ""
echo "✅ Setup completato!"
echo ""
echo "📝 Per avviare il sistema:"
echo "   1. Terminal 1: cd backend && npm run dev"
echo "   2. Terminal 2: npm run dev"
echo ""
