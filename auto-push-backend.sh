#!/bin/bash

# 🚀 Auto Push Script - Backend Implementation
echo "🚀 Soccer Management System - Backend Push"
echo "=========================================="

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Directory di base
BASE_DIR="/Users/lucamambelli/Desktop/soccer-management-system"
cd "$BASE_DIR"

echo -e "\n${YELLOW}📋 Verificando stato repository...${NC}"
git status --short

echo -e "\n${YELLOW}📁 File backend da includere:${NC}"
echo "- backend/ (struttura completa)"
echo "- BACKEND-DOCUMENTATION.md"
echo "- BACKEND-PUSH-INSTRUCTIONS.md"
echo "- Documentazione aggiornata stato backend"

echo -e "\n${YELLOW}🔍 Verificando .env non sia incluso...${NC}"
if git ls-files --error-unmatch backend/.env 2>/dev/null; then
    echo -e "${RED}⚠️  ATTENZIONE: .env è tracciato da git!${NC}"
    echo "Rimuovendo .env dal tracking..."
    git rm --cached backend/.env
fi

echo -e "\n${GREEN}✅ .env.example creato per riferimento${NC}"

echo -e "\n${YELLOW}📦 Aggiungendo file al commit...${NC}"
git add backend/
git add BACKEND-DOCUMENTATION.md
git add BACKEND-PUSH-INSTRUCTIONS.md
git add -u # Aggiungi file modificati

echo -e "\n${YELLOW}💾 Creando commit...${NC}"
git commit -m "feat: Backend implementation with Express, TypeScript, Prisma

🚀 BACKEND IMPLEMENTATION:

✅ Core Architecture:
- Express.js + TypeScript
- PostgreSQL + Prisma ORM  
- JWT Authentication
- WebSocket support ready

✅ Services Implemented (3/10):
- Authentication: Login/logout, JWT tokens, refresh tokens
- Athletes: Full CRUD, validations, statistics
- Notifications: Real-time system, auto-triggers

✅ Infrastructure:
- Error handling middleware
- Rate limiting
- Request validation with Zod
- Logging system
- CORS configured

📁 Structure:
- /routes: All API endpoints defined
- /services: Business logic layer
- /middleware: Auth, errors, rate limit
- /prisma: Database schema complete

🔄 Next Steps:
- Implement remaining services (teams, documents, payments, etc.)
- Connect frontend to API
- Add WebSocket for real-time updates
- Deploy to production

Ready for gradual frontend migration!"

echo -e "\n${YELLOW}🚀 Pushing to GitHub...${NC}"
git push origin main

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Push completato con successo!${NC}"
    echo -e "${GREEN}🎉 Backend implementation pushed to GitHub!${NC}"
    echo -e "\n${YELLOW}📝 Prossimi passi:${NC}"
    echo "1. Implementare services mancanti (teams, documents, etc.)"
    echo "2. Collegare frontend al backend"
    echo "3. Configurare deployment"
    echo "4. Aggiungere test automatici"
else
    echo -e "\n${RED}❌ Errore durante il push${NC}"
    echo "Prova manualmente con:"
    echo "git push -f origin main"
fi

echo -e "\n${GREEN}📚 Documentazione disponibile:${NC}"
echo "- BACKEND-DOCUMENTATION.md"
echo "- backend/SETUP.md"
echo "- BACKEND-PUSH-INSTRUCTIONS.md"

echo -e "\n✨ Backend Push Script Completato!"
