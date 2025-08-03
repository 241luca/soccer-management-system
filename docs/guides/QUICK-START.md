# 🚀 Quick Start Guide

Inizia subito con Soccer Management System in meno di 5 minuti!

## 📋 Prerequisiti

- **Node.js** 18 o superiore
- **npm** o **yarn**
- **PostgreSQL** 14+ (solo per modalità completa)

## 🎯 Modalità Demo (Consigliata per iniziare)

La modalità demo ti permette di esplorare tutte le funzionalità senza configurare un database.

```bash
# 1. Clona il repository
git clone https://github.com/241luca/soccer-management-system.git
cd soccer-management-system

# 2. Installa le dipendenze
npm install

# 3. Avvia l'applicazione
npm run dev
```

✅ **Fatto!** Apri [http://localhost:5173](http://localhost:5173) nel browser.

### 🔐 Credenziali Demo

```
Email: admin@demo.com
Password: admin123
```

## 💾 Modalità Completa (Con Database)

Per un'esperienza completa con dati persistenti:

### 1. Setup Database

```bash
cd backend
cp .env.example .env
# Modifica .env con le tue credenziali PostgreSQL
```

### 2. Inizializza Database

```bash
npm install
npm run prisma:migrate
npm run prisma:seed  # Carica dati demo
```

### 3. Avvia Backend

```bash
npm run dev
# Backend attivo su http://localhost:3000
```

### 4. Avvia Frontend (nuovo terminale)

```bash
cd ..
VITE_USE_API=true npm run dev
# Frontend attivo su http://localhost:5173
```

## 🎮 Primi Passi

1. **Accedi** con le credenziali demo
2. **Esplora la Dashboard** per una panoramica del sistema
3. **Aggiungi un Atleta** dal menu Atleti
4. **Crea una Squadra** e assegna gli atleti
5. **Programma una Partita** dal calendario
6. **Genera Report** dalla sezione export

## 🔧 Comandi Utili

```bash
# Development
npm run dev              # Avvia in modalità demo
npm run build           # Build per produzione
npm run preview         # Preview build

# Backend only
cd backend
npm run dev             # Avvia backend
npm run prisma:studio   # GUI database
npm run test           # Esegui test
```

## 📱 Funzionalità Principali

- **👥 Gestione Atleti** - Anagrafica completa con documenti
- **🏆 Gestione Squadre** - Organizzazione per categorie
- **📅 Calendario Partite** - Convocazioni e risultati
- **🚌 Sistema Trasporti** - Zone e percorsi
- **💰 Pagamenti** - Tracking quote e scadenze
- **📊 Dashboard** - KPI e statistiche real-time
- **📤 Export** - Excel e PDF

## ❓ Problemi Comuni

### CORS Error
```bash
# Verifica che il backend sia in esecuzione
# Controlla CORS_ORIGIN in backend/.env
```

### Database Connection Failed
```bash
# Verifica che PostgreSQL sia attivo
# Controlla DATABASE_URL in backend/.env
```

### Port Already in Use
```bash
# Cambia porta nel .env
PORT=3001  # backend
# O per il frontend
vite --port 5174
```

## 📚 Prossimi Passi

- 📖 [Manuale Utente Completo](./USER-MANUAL.md)
- 🔌 [API Documentation](../api/REST-API.md)
- 🛠️ [Development Guide](../development/SETUP.md)
- 🚀 [Deployment Guide](../deployment/DEPLOY-GUIDE.md)

## 🆘 Supporto

- 📧 Email: lucamambelli@lmtecnologie.it
- 🐛 Issues: [GitHub Issues](https://github.com/241luca/soccer-management-system/issues)
- 💬 Discussioni: [GitHub Discussions](https://github.com/241luca/soccer-management-system/discussions)

---

Buon lavoro con Soccer Management System! ⚽