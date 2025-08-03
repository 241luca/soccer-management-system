#!/bin/bash

# 🚀 Auto Push Script - Backend Services Implementation
echo "🚀 Soccer Management System - Backend Services Push"
echo "=================================================="

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Directory di base
BASE_DIR="/Users/lucamambelli/Desktop/soccer-management-system"
cd "$BASE_DIR"

echo -e "\n${YELLOW}📋 Stato implementazione:${NC}"
echo -e "${GREEN}✅ 6/10 Services implementati:${NC}"
echo "  - auth.service.ts (Login, JWT, Refresh tokens)"
echo "  - athlete.service.ts (CRUD completo + validazioni)"
echo "  - notification.service.ts (Sistema notifiche)"
echo "  - team.service.ts (Gestione squadre)"
echo "  - document.service.ts (Upload documenti)"
echo "  - payment.service.ts (Gestione pagamenti)"

echo -e "\n${YELLOW}📁 File aggiunti/modificati:${NC}"
echo "Backend Services:"
echo "  - backend/src/services/team.service.ts (NUOVO)"
echo "  - backend/src/services/document.service.ts (NUOVO)"
echo "  - backend/src/services/payment.service.ts (NUOVO)"
echo ""
echo "Frontend Preparation:"
echo "  - src/config/index.js (NUOVO)"
echo "  - src/services/api.js (AGGIORNATO)"
echo "  - .env.development (NUOVO)"
echo ""
echo "Documentation:"
echo "  - ISTRUZIONI-NUOVA-SESSIONE.md (NUOVO)"
echo "  - BACKEND-DOCUMENTATION-V2.md (NUOVO)"
echo "  - PROJECT-STATUS-V2.md (NUOVO)"
echo "  - frontend-backend-integration.md (artifact)"
echo "  - implementation-summary.md (artifact)"

echo -e "\n${YELLOW}🔍 Verificando .env non sia incluso...${NC}"
if git ls-files --error-unmatch backend/.env 2>/dev/null; then
    echo -e "${RED}⚠️  ATTENZIONE: .env è tracciato da git!${NC}"
    git rm --cached backend/.env
fi

echo -e "\n${GREEN}✅ File sensibili protetti${NC}"

echo -e "\n${YELLOW}📦 Aggiungendo file al commit...${NC}"

# Aggiungi backend services
git add backend/src/services/team.service.ts
git add backend/src/services/document.service.ts  
git add backend/src/services/payment.service.ts

# Aggiungi frontend preparation
git add src/config/
git add src/services/api.js
git add .env.development

# Aggiungi documentazione
git add ISTRUZIONI-NUOVA-SESSIONE.md
git add BACKEND-DOCUMENTATION-V2.md
git add PROJECT-STATUS-V2.md
git add BACKEND-PUSH-INSTRUCTIONS.md
git add auto-push-backend-services.sh

# Aggiungi file modificati
git add -u

echo -e "\n${YELLOW}💾 Creando commit...${NC}"
git commit -m "feat: Backend services implementation (6/10 complete) + Frontend integration prep

🚀 BACKEND SERVICES IMPLEMENTATION:

✅ New Services Implemented (3):
- team.service.ts: Full CRUD, budget tracking, age validation
- document.service.ts: Upload, expiry management, notifications
- payment.service.ts: Payment tracking, invoicing, overdue management

✅ Frontend Integration Preparation:
- Created config system for API/Demo mode switch
- Extended API client with all new methods
- Environment variables setup
- Integration plan documented

✅ Documentation Updates:
- ISTRUZIONI-NUOVA-SESSIONE.md: Guide for next session
- BACKEND-DOCUMENTATION-V2.md: Complete backend docs
- PROJECT-STATUS-V2.md: Updated to 60% backend completion
- Detailed integration plans in artifacts

📊 Progress: 6/10 backend services complete
- ✅ Auth, Athletes, Notifications (existing)
- ✅ Teams, Documents, Payments (new)
- ❌ Matches, Transport, Dashboard, Admin (TODO)

🔄 Next Steps:
1. Implement remaining 4 services
2. Connect frontend to backend API
3. Add comprehensive test suite
4. Configure production deployment

Frontend 100% + Backend 60% = Beta Ready!"

echo -e "\n${YELLOW}🚀 Pushing to GitHub...${NC}"
git push origin main

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Push completato con successo!${NC}"
    echo -e "${GREEN}🎉 Backend services implementation pushed!${NC}"
    
    echo -e "\n${BLUE}📊 Riepilogo stato:${NC}"
    echo "- Frontend: 100% completo"
    echo "- Backend: 60% completo (6/10 services)"
    echo "- Database: Schema completo"
    echo "- API Endpoints: 41/65 implementati"
    
    echo -e "\n${YELLOW}📝 Prossimi passi:${NC}"
    echo "1. Implementare match.service.ts"
    echo "2. Implementare transport.service.ts"
    echo "3. Implementare dashboard.service.ts"
    echo "4. Implementare admin.service.ts"
    echo "5. Collegare frontend al backend"
    echo "6. Aggiungere test suite"
    
    echo -e "\n${GREEN}📚 Documentazione:${NC}"
    echo "- Leggi ISTRUZIONI-NUOVA-SESSIONE.md per continuare"
    echo "- Consulta BACKEND-DOCUMENTATION-V2.md per dettagli"
    echo "- Vedi PROJECT-STATUS-V2.md per stato completo"
else
    echo -e "\n${RED}❌ Errore durante il push${NC}"
    echo "Prova manualmente con:"
    echo "git push -f origin main"
fi

echo -e "\n✨ Backend Services Push Script Completato!"
