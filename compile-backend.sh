#!/bin/bash

echo "🔨 Compilazione Backend con i nuovi Services..."
echo ""

cd /Users/lucamambelli/Desktop/soccer-management-system/backend

echo "📦 Installazione dipendenze mancanti..."
npm install

echo ""
echo "🔧 Generazione Prisma Client..."
npx prisma generate

echo ""
echo "🏗️ Compilazione TypeScript..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Compilazione completata con successo!"
    echo ""
    echo "📋 Services implementati:"
    echo "  ✅ Team Service - Gestione squadre"
    echo "  ✅ Document Service - Upload e gestione documenti"
    echo "  ✅ Payment Service - Gestione pagamenti"
    echo "  ✅ Match Service - Calendario partite"
    echo "  ✅ Transport Service - Zone e trasporti"
    echo ""
    echo "🚀 Ora puoi riavviare il backend con: npm run dev"
else
    echo ""
    echo "❌ Errori durante la compilazione. Controlla i messaggi sopra."
fi
