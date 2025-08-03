# 🏢 Multi-Tenant Setup Guide

## Panoramica

Il Soccer Management System è progettato come applicazione multi-tenant, permettendo a multiple organizzazioni (società calcistiche) di utilizzare la stessa installazione mantenendo i dati completamente isolati.

## 🚀 Setup Iniziale

### 1. Prerequisiti

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### 2. Installazione e Configurazione

```bash
# Clone del repository
git clone https://github.com/241luca/soccer-management-system.git
cd soccer-management-system

# Setup backend
cd backend
npm install
cp .env.example .env

# Configurare il database in .env
DATABASE_URL="postgresql://user:password@localhost:5432/soccer_management"
JWT_SECRET="your-super-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
```

### 3. Inizializzazione Database

```bash
# Creare le tabelle
npm run prisma:migrate

# Generare il client Prisma
npm run prisma:generate

# Eseguire il setup multi-tenant
npm run setup:multi-tenant
```

## 📋 Cosa Viene Creato

Il comando `setup:multi-tenant` crea automaticamente:

### Piani di Abbonamento

1. **Basic Plan** - €29.99/mese
   - 5 utenti max
   - 50 atleti max
   - 3 squadre max
   - Funzionalità base

2. **Pro Plan** - €79.99/mese
   - 20 utenti max
   - 200 atleti max
   - 10 squadre max
   - Tutte le funzionalità

3. **Enterprise Plan** - €199.99/mese
   - Utenti illimitati
   - Atleti illimitati
   - Squadre illimitate
   - API access
   - Custom domain
   - Supporto prioritario

### Organizzazione Demo

- **Nome**: Demo Soccer Club
- **Codice**: DEMO
- **Subdomain**: demo
- **Piano**: Pro

### Utenti di Default

1. **Demo Owner**
   - Email: demo@soccermanager.com
   - Password: demo123456
   - Ruolo: Owner (tutti i permessi)

2. **Super Admin**
   - Email: superadmin@soccermanager.com
   - Password: superadmin123456
   - Accesso globale al sistema

## 🔧 Gestione Organizzazioni

### Creare Nuova Organizzazione

Come Super Admin, puoi creare nuove organizzazioni:

```javascript
POST /api/v1/organizations/create
{
  "name": "AC Milano Youth",
  "code": "ACMY",
  "subdomain": "acmilano",
  "plan": "Pro",
  "ownerEmail": "admin@acmilano.it",
  "ownerFirstName": "Mario",
  "ownerLastName": "Rossi",
  "ownerPassword": "securepassword123"
}
```

### Invitare Utenti

Gli owner e admin possono invitare nuovi utenti:

```javascript
POST /api/v1/organizations/invite
{
  "email": "coach@example.com",
  "roleId": "role-uuid-here"
}
```

### Switch tra Organizzazioni

Per utenti che appartengono a multiple organizzazioni:

```javascript
POST /api/v1/auth/switch-organization
{
  "organizationId": "org-uuid-here"
}
```

## 🔐 Sistema di Permessi

### Ruoli Predefiniti

1. **Owner**
   - Accesso completo all'organizzazione
   - Gestione billing e abbonamenti
   - Transfer ownership

2. **Admin**
   - Gestione utenti e ruoli
   - Tutte le funzionalità operative
   - No accesso billing

3. **Coach**
   - Gestione squadre e atleti
   - Creazione partite e eventi
   - Visualizzazione documenti

4. **Staff**
   - Visualizzazione dati
   - Supporto operativo limitato

### Permessi Disponibili

```javascript
// Organization
ORGANIZATION_VIEW, ORGANIZATION_UPDATE, ORGANIZATION_DELETE

// Users
USER_VIEW, USER_CREATE, USER_UPDATE, USER_DELETE

// Roles
ROLE_VIEW, ROLE_CREATE, ROLE_UPDATE, ROLE_DELETE

// Athletes
ATHLETE_VIEW, ATHLETE_CREATE, ATHLETE_UPDATE, ATHLETE_DELETE

// Teams
TEAM_VIEW, TEAM_CREATE, TEAM_UPDATE, TEAM_DELETE

// Matches
MATCH_VIEW, MATCH_CREATE, MATCH_UPDATE, MATCH_DELETE

// Documents
DOCUMENT_VIEW, DOCUMENT_CREATE, DOCUMENT_UPDATE, DOCUMENT_DELETE

// Payments
PAYMENT_VIEW, PAYMENT_CREATE, PAYMENT_UPDATE, PAYMENT_DELETE

// Notifications
NOTIFICATION_VIEW, NOTIFICATION_CREATE, NOTIFICATION_UPDATE, NOTIFICATION_DELETE

// Transport
TRANSPORT_VIEW, TRANSPORT_CREATE, TRANSPORT_UPDATE, TRANSPORT_DELETE

// Reports
REPORT_VIEW, REPORT_CREATE

// Billing
BILLING_VIEW, BILLING_UPDATE
```

## 🌐 Accesso Multi-Tenant

### Via Subdomain

Ogni organizzazione può accedere tramite il proprio subdomain:

- https://demo.soccermanager.com
- https://acmilano.soccermanager.com
- https://juventus.soccermanager.com

### Via Header

Per accesso API, usare l'header `X-Organization-ID`:

```bash
curl -H "X-Organization-ID: org-uuid-here" \
     -H "Authorization: Bearer token" \
     https://api.soccermanager.com/api/v1/athletes
```

## 📊 Monitoraggio e Limiti

### Verificare i Limiti

```javascript
GET /api/v1/organizations/current
// Ritorna info su limiti e utilizzo attuale
```

### Statistiche Organizzazione

```javascript
GET /api/v1/organizations/stats
{
  "users": 15,
  "teams": 8,
  "athletes": 150,
  "matches": 45,
  "documents": 320,
  "pendingPayments": 12
}
```

## 🛠️ Troubleshooting

### Errori Comuni

1. **"Organization context required"**
   - Assicurarsi di essere autenticati
   - Verificare subdomain o header X-Organization-ID

2. **"User limit reached"**
   - Upgrade del piano necessario
   - Contattare super admin

3. **"Permission denied"**
   - Verificare i permessi del ruolo
   - Contattare admin organizzazione

### Debug Mode

Per debug dettagliato:

```bash
# Nel file .env
LOG_LEVEL=debug
```

## 🚀 Best Practices

1. **Sicurezza**
   - Cambiare password di default immediatamente
   - Usare password complesse
   - Rotazione regolare dei JWT secrets

2. **Performance**
   - Indicizzare correttamente organizationId
   - Monitorare query N+1
   - Usare pagination per liste lunghe

3. **Backup**
   - Backup giornalieri del database
   - Test di restore periodici
   - Backup separati per organizzazione

## 📞 Supporto

Per assistenza con il setup multi-tenant:

- 📧 Email: support@soccermanager.com
- 📚 Docs: https://docs.soccermanager.com
- 💬 Discord: https://discord.gg/soccermanager

---

Ultimo aggiornamento: Agosto 2025
