# ⚽ Soccer Management System

Sistema completo per la gestione di società calcistiche - Multi-tenant, responsive, con gestione atleti, squadre, documenti e pagamenti.

![Version](https://img.shields.io/badge/version-2.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![PostgreSQL](https://img.shields.io/badge/postgresql-15-blue)

## ✨ Features

- 🏃 **Gestione Atleti** - Anagrafica completa, documenti, stato medico
- 👥 **Gestione Squadre** - Organizzazione per categorie e fasce d'età
- 📄 **Documenti** - Upload, tracking scadenze, notifiche automatiche
- 💰 **Pagamenti** - Quote, tracking pagamenti, report economici
- 📅 **Calendario Partite** - Gestione match e convocazioni
- 🚌 **Trasporti** - Organizzazione trasporti per zone
- 🔔 **Notifiche** - Sistema real-time per scadenze e promemoria
- 🏢 **Multi-tenant** - Supporto per multiple organizzazioni con piani abbonamento
- 🔄 **Organization Switcher** - Cambio rapido tra società per utenti multi-org
- 📱 **Responsive** - Ottimizzato per mobile, tablet e desktop
- 🔐 **Sicurezza** - JWT auth, rate limiting, RBAC
- 🤖 **AI Assistant** - Assistente intelligente integrato
- 📈 **Dashboard Analytics** - Statistiche e grafici real-time

## 🚀 Quick Start

### Prerequisiti
- Node.js 18+
- PostgreSQL 15
- Git

### Installazione

```bash
# Clone repository
git clone https://github.com/241luca/soccer-management-system.git
cd soccer-management-system

# Setup database
createdb soccer_management

# Install dependencies
npm install
cd backend && npm install

# Setup environment
cp backend/.env.example backend/.env
# Modifica .env con le tue configurazioni

# Run migrations
cd backend
npx prisma migrate deploy
npx prisma generate

# Seed database (opzionale)
psql -U tuousername -d soccer_management -f backend/seed-athletes.sql

# Start development
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd .. && VITE_USE_API=true npm run dev
```

Apri http://localhost:5173

## 🔑 Credenziali Demo

### Admin
- Email: `admin@demosoccerclub.com`
- Password: `admin123`

### Super Admin
- Email: `superadmin@soccermanager.com`
- Password: `superadmin123456`

## 📁 Struttura Progetto

```
soccer-management-system/
├── src/                # Frontend React
│   ├── components/    # UI Components
│   ├── hooks/        # Custom React hooks
│   ├── services/     # API services
│   └── data/         # Demo data
├── backend/          # Backend Express
│   ├── src/
│   │   ├── routes/   # API routes
│   │   ├── services/ # Business logic
│   │   └── middleware/
│   ├── prisma/       # Database schema
│   └── uploads/      # File storage
└── docs/             # Documentation
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI Library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Lucide Icons** - Icon library
- **Recharts** - Grafici e statistiche

### Backend
- **Node.js + Express** - Server
- **TypeScript** - Type safety
- **Prisma ORM** - Database
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Socket.io** - Real-time

## 📡 API Endpoints

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/v1/auth/login` | POST | User login |
| `/api/v1/athletes` | GET | Lista atleti |
| `/api/v1/athletes` | POST | Crea atleta |
| `/api/v1/teams` | GET | Lista squadre |
| `/api/v1/documents` | GET | Lista documenti |
| `/api/v1/payments` | GET | Lista pagamenti |
| `/api/v1/dashboard/stats` | GET | Statistiche |

[Documentazione API completa](./docs/TECHNICAL.md#api-documentation)

## 🔧 Configurazione

### Environment Variables

```env
# Backend
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user@localhost:5432/soccer_management
JWT_SECRET=your-secret-key
RATE_LIMIT_ENABLED=false  # true in produzione

# Frontend  
VITE_USE_API=true         # usa backend reale
VITE_API_URL=http://localhost:3000/api/v1
```

### Rate Limiting

Disabilitato di default in development. Per attivare:

```env
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100
```

## 📊 Database Schema

Schema multi-tenant con isolamento dati per organizzazione:

- **Organizations** - Società sportive
- **Users** - Utenti con ruoli multipli
- **Athletes** - Atleti con anagrafica completa
- **Teams** - Squadre per categoria
- **Documents** - Gestione documenti
- **Payments** - Pagamenti e quote

[Schema completo](./docs/TECHNICAL.md#database-schema)

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 📦 Build & Deploy

```bash
# Build frontend
npm run build

# Build backend
cd backend && npm run build

# Docker
docker-compose up -d
```

## 🐛 Troubleshooting

### Problema: "Too many requests"
**Soluzione**: Rate limiting attivo. Imposta `RATE_LIMIT_ENABLED=false` in `.env`

### Problema: "Cannot connect to database"
**Soluzione**: Verifica che PostgreSQL sia attivo e le credenziali in `.env` siano corrette

### Problema: Athletes list vuota
**Soluzione**: Esegui seed script: `psql -d soccer_management -f backend/seed-athletes.sql`

## 🤝 Contributing

1. Fork il progetto
2. Crea feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri Pull Request

## 📄 License

Distribuito sotto MIT License. Vedi `LICENSE` per maggiori informazioni.

## 👥 Contatti

**Luca Mambelli**
- GitHub: [@241luca](https://github.com/241luca)
- Email: lucamambelli@lmtecnologie.it

## 🙏 Acknowledgments

- React Team
- Prisma Team
- TailwindCSS
- PostgreSQL Community

---

⭐ Star il progetto se ti è utile!

[Documentazione Tecnica Completa](./docs/TECHNICAL.md) | [Guida Utente](./docs/guides/USER_GUIDE.md) | [API Docs](./docs/api/README.md)
