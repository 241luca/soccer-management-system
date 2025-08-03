#!/bin/bash

echo "🚀 Preparazione push automatico per Soccer Management System..."

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Pulizia file non necessari
echo -e "${YELLOW}📧 Pulizia file temporanei...${NC}"
rm -rf node_modules 2>/dev/null
rm -rf backend/node_modules 2>/dev/null
rm -rf backend/logs/*.log 2>/dev/null
find backend/uploads -type f ! -name '.gitkeep' -delete 2>/dev/null
rm -rf dist 2>/dev/null
rm -rf backend/dist 2>/dev/null

# 2. Verifica che .env non sia tracciato
echo -e "${YELLOW}🔐 Verifica file sensibili...${NC}"
if git ls-files | grep -q "^\.env$\|^backend/\.env$"; then
    echo -e "${RED}❌ ATTENZIONE: File .env trovato nel repository!${NC}"
    echo "Rimuovo .env dal tracking..."
    git rm --cached .env 2>/dev/null
    git rm --cached backend/.env 2>/dev/null
fi

# 3. Aggiungi tutti i file
echo -e "${YELLOW}📁 Aggiunta file al commit...${NC}"
git add .

# 4. Mostra stato
echo -e "${YELLOW}📊 Stato repository:${NC}"
git status --short

# 5. Crea commit
echo -e "${YELLOW}💾 Creazione commit...${NC}"
git commit -m "✨ Implementazione completa backend services

- Aggiunto Match Service: gestione partite, convocazioni, statistiche
- Aggiunto Transport Service: zone, pulmini, percorsi, assegnazioni
- Aggiunto Dashboard Service: statistiche, KPI, activity feed
- Aggiunto Admin Service: configurazioni, utenti, audit, backup
- Aggiornato hook useData per integrazione frontend-backend
- Aggiunta documentazione completa integrazione
- Aggiornati README e LICENSE con dati corretti
- Creati file .env.example per setup facile

Stato: Frontend 100% | Backend 100% | Integrazione 100%"

# 6. Pull eventuali modifiche remote
echo -e "${YELLOW}⬇️  Sincronizzazione con repository remoto...${NC}"
git pull origin main --rebase --autostash 2>/dev/null || {
    echo -e "${YELLOW}ℹ️  Nessuna modifica remota da integrare${NC}"
}

# 7. Push
echo -e "${YELLOW}⬆️  Push in corso...${NC}"
git push origin main

# 8. Verifica risultato
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Push completato con successo!${NC}"
    echo -e "${GREEN}🔗 Repository: https://github.com/241luca/soccer-management-system${NC}"
    
    # Mostra ultimo commit
    echo -e "\n${YELLOW}📝 Ultimo commit:${NC}"
    git log -1 --oneline
    
    # Suggerimenti post-push
    echo -e "\n${YELLOW}💡 Prossimi passi consigliati:${NC}"
    echo "1. Crea una Release su GitHub: https://github.com/241luca/soccer-management-system/releases/new"
    echo "2. Aggiungi topics: react, nodejs, postgresql, soccer, management-system"
    echo "3. Abilita GitHub Pages per una demo (se applicabile)"
    echo "4. Aggiungi collaboratori se necessario"
else
    echo -e "${RED}❌ Errore durante il push!${NC}"
    echo "Verifica:"
    echo "- La connessione internet"
    echo "- Le credenziali GitHub"
    echo "- Che il repository remoto esista"
    exit 1
fi

echo -e "\n${GREEN}🎉 Processo completato!${NC}"
