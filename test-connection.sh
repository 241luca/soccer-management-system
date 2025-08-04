#!/bin/bash

echo "🔍 TEST CONNESSIONE BACKEND"
echo "=========================="
echo ""

# 1. Test if backend is running
echo "1️⃣ Test Backend disponibile..."
curl -s http://localhost:3000/api/v1/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Backend raggiungibile"
else
    echo "❌ Backend NON raggiungibile su http://localhost:3000"
    echo "   Assicurati che il backend sia in esecuzione: cd backend && npm run dev"
    exit 1
fi

# 2. Test login endpoint
echo ""
echo "2️⃣ Test endpoint login..."
response=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@soccermanager.com","password":"demo123456"}' 2>&1)

if echo "$response" | grep -q "accessToken\|token"; then
    echo "✅ Login funziona! Token ricevuto"
    echo "   Response: ${response:0:100}..."
elif echo "$response" | grep -q "Invalid credentials\|User not found"; then
    echo "⚠️ Backend funziona ma utente demo non esiste"
    echo "   Creando utente demo..."
    
    # Create demo user
    cd /Users/lucamambelli/Desktop/soccer-management-system/backend
    cat > create-user.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.upsert({
    where: { code: 'DEMO' },
    update: {},
    create: {
      name: 'Demo Soccer Club',
      code: 'DEMO',
      plan: 'basic',
      maxUsers: 10,
      maxAthletes: 100,
      maxTeams: 10,
      isActive: true,
      isTrial: false
    }
  });
  
  const hash = bcrypt.hashSync('demo123456', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@soccermanager.com' },
    update: { passwordHash: hash },
    create: {
      email: 'demo@soccermanager.com',
      passwordHash: hash,
      firstName: 'Demo',
      lastName: 'User',
      role: 'ADMIN',
      organizationId: org.id,
      isActive: true
    }
  });
  
  console.log('✅ User created:', user.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
EOF
    
    node create-user.js
    rm create-user.js
    
    echo ""
    echo "✅ Utente demo creato! Riprova il login"
else
    echo "❌ Errore nella risposta del backend:"
    echo "   $response"
fi

# 3. Check frontend configuration
echo ""
echo "3️⃣ Configurazione Frontend..."
if [ -f "/Users/lucamambelli/Desktop/soccer-management-system/.env.development" ]; then
    if grep -q "VITE_USE_API=true" /Users/lucamambelli/Desktop/soccer-management-system/.env.development; then
        echo "✅ Frontend configurato per usare API backend"
    else
        echo "❌ Frontend NON configurato per usare API"
        echo "   Modifica .env.development e imposta VITE_USE_API=true"
    fi
else
    echo "⚠️ File .env.development non trovato"
fi

echo ""
echo "=========================="
echo "📋 ISTRUZIONI:"
echo "1. Assicurati che il backend sia in esecuzione: cd backend && npm run dev"
echo "2. Riavvia il frontend: npm run dev"
echo "3. Prova a fare login con: demo@soccermanager.com / demo123456"
echo "4. Apri la console del browser (F12) per vedere eventuali errori"
