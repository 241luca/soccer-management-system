# 🚀 ISTRUZIONI COMPLETE - SETUP MULTI-SOCIETÀ

## ✅ Cosa Abbiamo Fatto

### 1. **Eliminato Completamente i Dati Demo Finti**
- ❌ Rimosso dipendenza da `demoData.js`
- ❌ Eliminato variabile `VITE_USE_API` (non serve più)
- ✅ Il sistema usa **SEMPRE** il backend reale
- ✅ Nessun dato finto - tutto dal database

### 2. **Creato Due Società nel Database**
- **Demo Soccer Club** (DEMO) - Per test e dimostrazioni
- **ASD Ravenna Calcio** (RAVENNA) - Per produzione reale

### 3. **Migliorato il Sistema di Login**
- Schermata di selezione società più bella
- Badge colorati (DEMO = verde, PRODUZIONE = blu)
- Possibilità di cambiare società dal menu utente

## 📋 Come Configurare il Sistema

### Passo 1: Esegui lo Script di Setup
```bash
# Dalla cartella principale del progetto
./setup-production.sh
```

Questo script:
- Crea la società "ASD Ravenna Calcio" nel database
- Configura i ruoli e permessi
- Crea le squadre di esempio
- Genera gli utenti di accesso

### Passo 2: Avvia il Sistema
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
npm run dev
```

## 👤 Credenziali di Accesso

### 1. **Manager Multi-Società** (accesso a ENTRAMBE)
- **Email:** `manager@soccermanager.com`
- **Password:** `manager2024!`
- **Accesso a:** Demo + Produzione
- **Ruolo:** Amministratore

### 2. **Admin Produzione** (solo ASD Ravenna)
- **Email:** `admin@asdravennacalcio.it`
- **Password:** `ravenna2024!`
- **Accesso a:** Solo produzione
- **Ruolo:** Proprietario (tutti i permessi)

### 3. **Admin Demo** (solo Demo Soccer Club)
- **Email:** `demo@soccermanager.com`
- **Password:** `demo123456`
- **Accesso a:** Solo demo
- **Ruolo:** Owner

### 4. **Super Admin** (accesso globale)
- **Email:** `superadmin@soccermanager.com`
- **Password:** `superadmin123456`
- **Accesso a:** Tutto il sistema

## 🎯 Come Funziona Ora

1. **Login**: L'utente inserisce email e password
2. **Selezione Società**: Se ha accesso a più società, appare la schermata di selezione
3. **Dashboard**: Una volta scelta la società, vede solo i dati di quella società
4. **Cambio Società**: Può cambiare società dal menu utente in alto a destra

## 🔧 Personalizzazione

### Cambiare Nome/Dati della Società

Per modificare i dati della società di produzione, puoi:

1. **Via Database** (usando Prisma Studio):
```bash
cd backend
npx prisma studio
```
Poi modifica la tabella `Organization`

2. **Via API** (come Super Admin):
- Login come superadmin
- Usa gli endpoint `/api/v1/organizations/:id` per modificare

### Aggiungere Nuove Società

Per aggiungere altre società oltre a Demo e Ravenna:

1. Copia lo script `create-production-organization.js`
2. Modifica i dati (nome, code, subdomain, ecc.)
3. Esegui il nuovo script

## 🛠️ Troubleshooting

### Problema: "Cannot find organization"
**Soluzione:** Esegui `./setup-production.sh` per creare le società

### Problema: "Token not valid"
**Soluzione:** Fai logout e login di nuovo

### Problema: Vedo ancora dati demo finti
**Soluzione:** 
1. Svuota la cache del browser
2. Assicurati che il backend sia avviato
3. Controlla che non ci siano errori nella console

## 📊 Struttura Database

### Tabella Organizations
- `id`: UUID univoco
- `name`: Nome società (es. "ASD Ravenna Calcio")
- `code`: Codice breve (es. "RAVENNA")
- `subdomain`: Per accesso via URL (es. ravenna.soccermanager.com)
- `plan`: Piano abbonamento (Basic/Pro/Enterprise)
- `settings`: Configurazioni personalizzate (JSON)

### Tabella UserOrganization
Collega utenti a società con ruoli specifici:
- `userId`: ID utente
- `organizationId`: ID società
- `roleId`: ID ruolo
- `isDefault`: Società predefinita per l'utente

## 🎨 Prossimi Passi

### Area Amministrazione Società
Dovrai creare una sezione dove l'admin può:
- ✏️ Modificare nome e logo società
- 👥 Gestire utenti e ruoli
- ⚙️ Configurare impostazioni
- 📊 Vedere statistiche
- 💳 Gestire abbonamento

### Suggerimenti per l'Implementazione
1. Crea un nuovo componente `OrganizationSettings.jsx`
2. Aggiungi route `/settings/organization`
3. Usa l'endpoint `/api/v1/organizations/current` per i dati
4. Implementa form per modifiche

## ✨ Vantaggi del Nuovo Sistema

1. **Dati Reali**: Nessun dato finto, tutto dal database
2. **Multi-Tenant**: Supporto per infinite società
3. **Isolamento**: Ogni società vede solo i suoi dati
4. **Scalabilità**: Facile aggiungere nuove società
5. **Sicurezza**: Permessi e ruoli per ogni società

## 📞 Supporto

Se hai problemi o domande:
- Controlla i log del backend: `cd backend && npm run dev`
- Verifica la console del browser per errori JavaScript
- Assicurati che PostgreSQL sia avviato
- Controlla che le porte 3000 e 5173 siano libere

---

**Ultimo aggiornamento:** Agosto 2025
**Versione:** 2.0 Multi-Tenant (No Demo Data)
