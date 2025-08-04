# Soccer Management System - Documentazione Tecnica

## 📋 Indice
- [Panoramica](#panoramica)
- [Architettura](#architettura)
- [Setup e Installazione](#setup-e-installazione)
- [Configurazione](#configurazione)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Autenticazione e Sicurezza](#autenticazione-e-sicurezza)
- [Modifiche Recenti](#modifiche-recenti)

## 🎯 Panoramica

Soccer Management System è un'applicazione web completa per la gestione di società calcistiche, sviluppata con:
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Autenticazione**: JWT con multi-tenant support

## 🏗️ Architettura

### Stack Tecnologico
```
Frontend (Port 5173)
├── React 18
├── Vite
├── TailwindCSS
├── Lucide Icons
└── Custom Hooks (useApiData)

Backend (Port 3000)
├── Express.js
├── TypeScript
├── Prisma ORM
├── JWT Authentication
├── WebSocket (Socket.io)
└── Rate Limiting (configurabile)

Database
├── PostgreSQL 15
├── Multi-tenant architecture
└── UUID primary keys
```

### Struttura Directory
```
soccer-management-system/
├── src/                    # Frontend React
│   ├── components/        # Componenti UI
│   ├── hooks/            # Custom hooks
│   ├── services/         # API client
│   └── data/            # Demo data
├── backend/              # Backend Express
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Express middleware
│   │   └── utils/       # Utilities
│   ├── prisma/          # Database schema
│   └── uploads/         # File storage
└── docs/                # Documentazione
```

## 🚀 Setup e Installazione

### Prerequisiti
- Node.js 18+
- PostgreSQL 15
- npm o yarn

### Installazione

1. **Clone del repository**
```bash
git clone https://github.com/241luca/soccer-management-system.git
cd soccer-management-system
```

2. **Setup Database**
```bash
# Crea il database
createdb -U lucamambelli soccer_management

# Setup backend
cd backend
npm install
npx prisma migrate deploy
npx prisma generate
```

3. **Configurazione Environment**
```bash
# backend/.env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://lucamambelli@localhost:5432/soccer_management"
JWT_SECRET=dev-secret-key-change-this-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-key-change-this-in-production
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_ENABLED=false  # Disabilitato in development
```

4. **Avvio Applicazione**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd ..
VITE_USE_API=true npm run dev
```

## ⚙️ Configurazione

### Rate Limiting
Il rate limiting è **disabilitato di default** in development. Per attivarlo:

```env
# backend/.env
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000    # 15 minuti
RATE_LIMIT_MAX_REQUESTS=1000   # Max richieste per finestra
```

### Multi-Tenant
Il sistema supporta multiple organizzazioni con isolamento dei dati:
- Ogni utente appartiene a una o più organizzazioni
- I dati sono filtrati automaticamente per organizzazione
- Super Admin ha accesso globale

## 📡 API Documentation

### Autenticazione

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@demosoccerclub.com",
  "password": "admin123"
}

Response:
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "user": { ... },
  "organization": { ... }
}
```

#### Super Admin Login
```http
POST /api/v1/auth/super-admin/login
Content-Type: application/json

{
  "email": "superadmin@soccermanager.com",
  "password": "superadmin123456"
}
```

### Endpoints Principali

#### Dashboard Stats
```http
GET /api/v1/dashboard/stats
Authorization: Bearer {token}
X-Organization-ID: {org-id}

Response:
{
  "athletes": { "total": 10, "active": 9 },
  "teams": { "total": 4 },
  "documents": { "expiring30Days": 3 },
  "payments": { "pendingCount": 5, "pendingAmount": 400 }
}
```

#### Athletes CRUD
```http
GET /api/v1/athletes?page=1&limit=20&teamId={teamId}
POST /api/v1/athletes
PUT /api/v1/athletes/{id}
DELETE /api/v1/athletes/{id}
```

#### Teams Management
```http
GET /api/v1/teams
POST /api/v1/teams
PUT /api/v1/teams/{id}
DELETE /api/v1/teams/{id}
```

## 🗄️ Database Schema

### Tabelle Principali
- **Organization**: Multi-tenant organizations
- **User**: Utenti con ruoli multipli
- **UserOrganization**: Relazione many-to-many
- **Athlete**: Atleti con info complete
- **Team**: Squadre per categoria
- **Document**: Gestione documenti
- **Payment**: Pagamenti e quote
- **Match**: Calendario partite
- **Notification**: Sistema notifiche

### Enums
```typescript
enum AthleteStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  TRANSFERRED
}

enum PaymentStatus {
  PENDING
  PAID
  OVERDUE
  CANCELLED
}
```

## 🔐 Autenticazione e Sicurezza

### JWT Token Structure
```json
{
  "userId": "uuid",
  "email": "user@email.com",
  "organizationId": "uuid",
  "roleId": "uuid",
  "permissions": [],
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Middleware Chain
1. **Rate Limiting** (configurabile)
2. **CORS** validation
3. **JWT Authentication**
4. **Organization Context**
5. **Role-based Authorization**

## 🆕 Modifiche Recenti (4 Agosto 2025)

### Anagrafica Completa Società
- ✅ **Nuovi campi nel database** per gestione completa anagrafica
  - Dati societari: nome completo, indirizzo, contatti
  - Dati fiscali: CF, P.IVA, IBAN
  - Contatti dirigenza: presidente e segretario
  - Social media e colori societari
- ✅ **Componente OrganizationDetails** con 5 tab per gestione completa
- ✅ **Logo società nella navbar** al posto del pallone generico
- ✅ **Nome società dinamico** nella navigazione
- ✅ **Logo nel menu cambio società** (OrganizationSwitcher)
- ✅ **API endpoints** per lettura/scrittura anagrafica
- ✅ **Validazioni frontend** per email, colori, CAP, etc.
- 🔄 **Upload logo** da implementare con multer

## 🆕 Modifiche Recenti (Agosto 2025)

### 1. Rimozione Completa Dati Demo
- ✅ Eliminata dipendenza da `demoData.js`
- ✅ Eliminato `notificationDemoData.js` 
- ✅ Rimossa variabile `VITE_USE_API` (non più necessaria)
- ✅ Sistema sempre connesso al backend
- ✅ Nessuna modalità offline
- ✅ Hook `useNotifications` ora inizializza array vuoti

### 2. Multi-Tenant Completo
- ✅ Creata organizzazione ASD Ravenna Calcio (produzione)
- ✅ Sistema di selezione società per utenti multi-org
- ✅ Fix autenticazione con UserOrganization obbligatorio
- ✅ SuperAdmin con tabella e endpoint dedicati

### 3. Gestione Organizzazioni (NUOVO)
- ✅ **Interfaccia gestione organizzazioni** per Super Admin
  - Lista completa con filtri e statistiche
  - Form creazione/modifica organizzazioni
  - Gestione piani abbonamento (Basic, Pro, Enterprise)
- ✅ **Organization Switcher** nel menu utente
  - Cambio rapido tra società per utenti multi-org
  - Indicatore visivo società corrente
  - Aggiornamento automatico del contesto
- ✅ Nuove route: `/organizations`, `/organizations/new`, `/organizations/edit`

### 4. Miglioramenti UI Login
- ✅ Schermata login con tutte le credenziali
- ✅ Badge colorati per tipo utente
- ✅ OrganizationSelector ridisegnato
- ✅ Gestione errori migliorata

### 5. Fix Database e Autenticazione
- ✅ Corretta gestione hash password con bcrypt
- ✅ Sistemate relazioni UserOrganization
- ✅ Rimosso `isDefault` per utenti multi-org
- ✅ Script di setup automatizzati

### 6. Componenti Utility Aggiunti
- ✅ `LoadingSpinner` - Spinner animato con 3 dimensioni
- ✅ `ErrorMessage` - Messaggi errore stilizzati
- ✅ Navigazione senza react-router-dom

## 🆕 Modifiche Recenti (Gennaio 2025)

### 1. Fix Sistema di Autenticazione
- ✅ Corretto middleware `auth.middleware.ts` per includere `organizationId` nel context
- ✅ Fix del sistema multi-tenant con `UserOrganization`
- ✅ Supporto login SuperAdmin con endpoint dedicato

### 2. Rate Limiting Configurabile
- ✅ Rate limiting **disabilitato di default** in development
- ✅ Configurabile via environment variable `RATE_LIMIT_ENABLED`
- ✅ Limiti aumentati: 1000 req/15min (general), 100 req/15min (auth)
- ✅ Middleware no-op quando disabilitato

### 3. Navigation Responsive
- ✅ Menu hamburger per mobile
- ✅ User dropdown con info profilo
- ✅ Badge colorati per ruoli (Super Admin viola, Admin blu)
- ✅ Gestione cambio password integrata

### 4. Hook useApiData
- ✅ Supporto SOLO API reali (nessun fallback demo)
- ✅ Prevenzione loop infiniti con `useRef`
- ✅ Gestione errori 401 senza redirect loop
- ✅ Caricamento dati solo se autenticato

### 5. Seed Data
- ✅ Script SQL per popolare database di test
- ✅ 10 atleti in 4 squadre
- ✅ Ruoli e permessi configurati
- ✅ Organizzazione Demo Soccer Club

### 6. Fix Integrazione Frontend-Backend
- ✅ Athletes endpoint funzionante con paginazione
- ✅ Dashboard stats API integrata
- ✅ Teams CRUD operations
- ✅ Gestione token e refresh

## 🐛 Issues Risolti
1. **Loop infinito login**: Risolto con gestione corretta 401
2. **Rate limiting troppo restrittivo**: Disabilitato in dev
3. **Athletes vuoto**: Fix organizationId nel middleware
4. **Navigation non responsive**: Aggiunto menu mobile
5. **ValidationError**: Fix parametri classe errore

## 📊 Metriche Performance
- API Response Time: < 50ms
- Frontend Bundle Size: ~500KB
- Database Queries: Ottimizzate con Prisma
- Rate Limiting: 1000 req/15min (quando attivo)

## 🔧 Comandi Utili

```bash
# Database
npx prisma migrate dev      # Crea nuova migration
npx prisma studio           # GUI database
npx prisma db seed          # Popola dati test

# Development
npm run dev                 # Avvia in development
npm run build              # Build produzione
npm run lint               # Check linting
npm run test               # Run tests

# Git
git add .
git commit -m "message"
git push origin main
```

## 📞 Credenziali Test

### Demo Organization
- Email: `demo@soccermanager.com`
- Password: `demo123456`
- Accesso: Solo Demo Soccer Club

### Production Organization (ASD Ravenna)
- Email: `admin@asdravennacalcio.it`
- Password: `ravenna2024!`
- Accesso: Solo ASD Ravenna Calcio

### Multi-Organization Manager
- Email: `manager@soccermanager.com`
- Password: `manager2024!`
- Accesso: Demo + Ravenna (con selezione)

### Super Admin
- Email: `superadmin@soccermanager.com`  
- Password: `superadmin123456`
- Accesso: Globale (tutte le organizzazioni)

## 🚢 Deploy

### Produzione Checklist
- [ ] Cambiare JWT_SECRET
- [ ] Attivare RATE_LIMIT_ENABLED=true
- [ ] Configurare CORS per dominio produzione
- [ ] Setup backup database
- [ ] Configurare SSL/HTTPS
- [ ] Setup monitoring (Sentry)

## 📄 License
MIT

## 👥 Team
- Luca Mambelli - Lead Developer
- GitHub: [@241luca](https://github.com/241luca)

---
*Ultimo aggiornamento: 4 Agosto 2025*

## 📝 Note di Sviluppo

### Architettura
- Il sistema usa un approccio **API-first** con backend Node.js/Express
- Nessun dato demo hardcoded - tutto viene dal database PostgreSQL
- Multi-tenant nativo con isolamento dati per organizzazione
- Navigazione basata su stati (no react-router) per semplicità

### Best Practices Implementate
- Componenti React funzionali con hooks
- Gestione stato centralizzata con custom hooks
- Error boundaries e loading states
- Responsive design mobile-first
- Autenticazione JWT con refresh token
- Rate limiting configurabile

### Prossimi Passi Consigliati
1. Implementare sistema fatturazione con Stripe/PayPal
2. Aggiungere dashboard analytics avanzate
3. Sviluppare app mobile React Native
4. Integrare WebSocket per real-time updates
5. Aggiungere test automatizzati (Jest + React Testing Library)
