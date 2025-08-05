#!/bin/bash

# Script veloce per pulire solo i dati del browser
# Utile quando vuoi solo fare un logout completo senza reinstallare

echo "🧹 Pulizia veloce dati browser..."
echo "================================="

# Colori
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Crea uno script JavaScript per pulire localStorage
cat > /tmp/clear-browser.js << 'EOF'
// Pulisce tutti i dati salvati
localStorage.clear();
sessionStorage.clear();

// Pulisce i cookie
document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

console.log('✅ Dati puliti! La pagina si ricaricherà...');

// Ricarica dopo 1 secondo
setTimeout(() => location.reload(), 1000);
EOF

# Apre il browser con istruzioni
echo -e "${YELLOW}Istruzioni:${NC}"
echo ""
echo "1. Apri il browser su: http://localhost:5173"
echo "2. Apri la Console (F12 o Cmd+Option+I)"
echo "3. Copia e incolla questo comando:"
echo ""
echo -e "${GREEN}localStorage.clear(); sessionStorage.clear(); document.cookie.split(';').forEach(c => document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')); location.reload();${NC}"
echo ""
echo "4. Premi Invio"
echo ""
echo "5. Fai login con:"
echo -e "   ${GREEN}Email: superadmin@soccermanager.com${NC}"
echo -e "   ${GREEN}Password: superadmin123456${NC}"
echo ""
echo "================================="

# Se il server non è attivo, lo avvia
if ! pgrep -f "vite" > /dev/null; then
    echo -e "${YELLOW}Server non attivo, lo avvio...${NC}"
    cd /Users/lucamambelli/Desktop/soccer-management-system
    npm run dev &
    sleep 3
fi

# Apre il browser
open "http://localhost:5173" 2>/dev/null || echo "Apri manualmente: http://localhost:5173"

# Pulisce file temporaneo
rm -f /tmp/clear-browser.js

echo -e "${GREEN}✅ Fatto!${NC}"
