#!/bin/bash

# Script per resettare completamente l'applicazione Soccer Management System
# Questo script pulisce cache, localStorage e riavvia l'applicazione

echo "🧹 Reset completo Soccer Management System..."
echo "==========================================="

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Ferma il server se è in esecuzione
echo -e "${YELLOW}1. Fermando il server di sviluppo...${NC}"
# Trova e killa i processi node/vite
pkill -f "vite" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
sleep 2

# 2. Pulisce la cache di npm
echo -e "${YELLOW}2. Pulendo cache npm...${NC}"
npm cache clean --force 2>/dev/null || true

# 3. Rimuove node_modules e package-lock
echo -e "${YELLOW}3. Rimuovendo node_modules...${NC}"
rm -rf node_modules
rm -f package-lock.json

# 4. Reinstalla le dipendenze
echo -e "${YELLOW}4. Reinstallando dipendenze...${NC}"
npm install

# 5. Crea script per pulire localStorage nel browser
echo -e "${YELLOW}5. Creando script per pulire il browser...${NC}"
cat > clear-browser-data.js << 'EOF'
// Script per pulire tutti i dati dal browser
console.log('🧹 Pulizia dati browser in corso...');

// Pulisce tutto il localStorage
localStorage.clear();

// Pulisce sessionStorage
sessionStorage.clear();

// Pulisce tutti i cookie per localhost
document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

console.log('✅ Pulizia completata!');
console.log('📝 Ora puoi fare login con:');
console.log('   Email: superadmin@soccermanager.com');
console.log('   Password: superadmin123456');

// Ricarica la pagina
setTimeout(() => {
    window.location.reload();
}, 1000);
EOF

# 6. Avvia il server
echo -e "${YELLOW}6. Avviando il server di sviluppo...${NC}"
npm run dev &

# Aspetta che il server sia pronto
echo -e "${YELLOW}7. Attendendo che il server sia pronto...${NC}"
sleep 5

# 8. Apre il browser e pulisce i dati
echo -e "${YELLOW}8. Aprendo il browser e pulendo i dati...${NC}"
if command -v open &> /dev/null; then
    # macOS
    open "http://localhost:5173"
    
    # Istruzioni per l'utente
    echo -e "${GREEN}==========================================="
    echo -e "✅ Reset completato!"
    echo -e "==========================================="
    echo -e "${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANTE: Segui questi passaggi:${NC}"
    echo -e ""
    echo -e "1. Il browser si è aperto su http://localhost:5173"
    echo -e "2. Apri la Console del browser (F12 o Cmd+Option+I)"
    echo -e "3. Incolla questo comando nella console:"
    echo -e ""
    echo -e "${GREEN}localStorage.clear(); sessionStorage.clear(); location.reload();${NC}"
    echo -e ""
    echo -e "4. Poi fai login con:"
    echo -e "   ${GREEN}Email: superadmin@soccermanager.com${NC}"
    echo -e "   ${GREEN}Password: superadmin123456${NC}"
    echo -e ""
    echo -e "==========================================="
else
    echo -e "${RED}Browser non aperto automaticamente. Apri manualmente: http://localhost:5173${NC}"
fi

# Rimuove il file temporaneo
rm -f clear-browser-data.js

echo -e "${GREEN}🎉 Processo completato!${NC}"
