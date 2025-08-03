#!/bin/bash

echo "💾 Salvando progresso Multi-Tenant..."

# Colori
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Aggiungi tutti i file
git add .

# Crea commit
git commit -m "feat(multi-tenant): Implementazione parziale sistema multi-tenant

- Aggiornato schema Prisma con tabelle multi-tenant
- Creato middleware per isolamento dati
- Implementato sistema permessi granulare  
- Aggiornato auth service per multi-organizzazione
- Iniziato organization service (da completare)
- Creata documentazione per continuazione

Work in progress: Multi-tenant implementation (40% complete)

Files principali:
- backend/prisma/schema.prisma
- backend/src/middleware/multiTenant.middleware.ts
- backend/src/types/permissions.ts
- backend/src/services/auth.service.ts
- backend/src/services/organization.service.ts (parziale)
- docs/development/MULTI-TENANT-ANALYSIS.md
- docs/development/MULTI-TENANT-CONTINUATION.md"

# Push
echo -e "${YELLOW}Vuoi fare push su GitHub? (y/n)${NC}"
read -r response

if [[ "$response" == "y" ]]; then
    git push origin main
    echo -e "${GREEN}✅ Push completato!${NC}"
else
    echo -e "${YELLOW}📋 Commit salvato localmente. Puoi fare push più tardi con: git push origin main${NC}"
fi

echo -e "${GREEN}✅ Progresso salvato con successo!${NC}"
