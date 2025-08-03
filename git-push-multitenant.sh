#!/bin/bash

# Script per commit e push del progetto multi-tenant
# Autore: Luca Mambelli
# Data: Agosto 2025

echo "🚀 Preparazione push del sistema multi-tenant..."

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funzione per stampare con colore
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Verifica se siamo nella directory giusta
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    print_error "Devi eseguire questo script dalla root del progetto!"
    exit 1
fi

# Verifica se git è inizializzato
if [ ! -d ".git" ]; then
    print_warning "Git non inizializzato. Inizializzazione in corso..."
    git init
    git remote add origin https://github.com/241luca/soccer-management-system.git
fi

# Aggiungi tutti i file
print_status "Aggiunta di tutti i file al repository..."
git add .

# Mostra lo stato
echo ""
echo "📊 Status del repository:"
git status --short

# Chiedi conferma
echo ""
read -p "Vuoi procedere con il commit? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Commit con messaggio dettagliato
    print_status "Creazione commit..."
    git commit -m "feat: Implementazione completa sistema multi-tenant

- Aggiunto supporto multi-tenant con isolamento dati per organizzazione
- Implementato sistema di autenticazione con JWT e refresh tokens
- Creato middleware per gestione contesto organizzazione
- Aggiunto sistema di ruoli e permessi personalizzabili
- Implementati piani di abbonamento (Basic, Pro, Enterprise)
- Creato script di setup automatico multi-tenant
- Aggiornata documentazione con guide multi-tenant
- Implementate API REST complete per gestione organizzazioni
- Aggiunto supporto per inviti utenti e gestione team
- Creato sistema di limiti per piano di abbonamento
- Implementato Super Admin per gestione globale

BREAKING CHANGE: Il sistema ora richiede organizationId per tutte le operazioni"

    # Push al repository
    print_status "Push al repository remoto..."
    git push -u origin main

    print_status "Push completato con successo! 🎉"
    
    echo ""
    echo "📋 Prossimi passi:"
    echo "1. Verifica il deploy su GitHub: https://github.com/241luca/soccer-management-system"
    echo "2. Controlla GitHub Actions per eventuali CI/CD"
    echo "3. Aggiorna le GitHub Pages con la documentazione"
    echo "4. Crea una release con tag v2.0.0-multitenant"
else
    print_warning "Commit annullato."
fi
