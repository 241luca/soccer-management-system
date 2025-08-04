#!/bin/bash

echo "🧹 Pulizia e Fix del Backend..."
echo ""

cd /Users/lucamambelli/Desktop/soccer-management-system/backend

# Rimuovi file middleware duplicati
echo "🗑️ Rimozione file duplicati..."
rm -f src/middleware/multiTenant.middleware.ts 2>/dev/null
rm -f src/middleware/multi-tenant.middleware.ts 2>/dev/null

echo "✅ File duplicati rimossi"
echo ""

# Pulisci la build precedente
echo "🧹 Pulizia build precedente..."
rm -rf dist
rm -f .tsbuildinfo

echo ""
echo "📦 Reinstallazione dipendenze..."
npm install

echo ""
echo "🔧 Rigenerazione Prisma Client..."
npx prisma generate

echo ""
echo "🏗️ Ricompilazione TypeScript..."
npm run build 2>&1 | grep -E "error TS" | head -20

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo ""
    echo "✅ Compilazione completata con successo!"
    echo ""
    echo "🚀 Ora puoi riavviare il backend con: npm run dev"
else
    echo ""
    echo "⚠️ Ci sono ancora alcuni errori da sistemare."
    echo "Esegui 'npm run build' per vedere tutti gli errori."
fi
