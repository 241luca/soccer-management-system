# Frontend-Backend Integration Guide

## 🎯 Overview

Il sistema Soccer Management è ora completamente integrato con il backend. Questa guida spiega come configurare e utilizzare l'integrazione.

## 🚀 Quick Start

### 1. Avviare il Backend

```bash
cd backend
npm install
npm run dev
```

Il backend sarà disponibile su `http://localhost:3000`

### 2. Avviare il Frontend con API Mode

```bash
# Dalla root del progetto
npm install
VITE_USE_API=true npm run dev
```

Il frontend sarà disponibile su `http://localhost:5173`

## 📋 Configurazione

### Backend Configuration (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/soccer_management"
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
PORT=3000
```

### Frontend Configuration (.env.development)

```env
VITE_USE_API=true
VITE_API_URL=http://localhost:3000/api/v1
```

## 🔄 Modalità di Funzionamento

Il sistema può funzionare in due modalità:

### 1. Demo Mode (Default)
- Usa dati generati localmente
- Non richiede backend
- Perfetto per testing e sviluppo UI
- I dati non sono persistenti

### 2. API Mode
- Si connette al backend reale
- Dati persistenti nel database
- Richiede autenticazione
- Supporta tutte le funzionalità enterprise

## 🔌 API Integration Details

### Hook useData Aggiornato

Il nuovo hook `useData` gestisce automaticamente:

1. **Rilevamento modalità**: Controlla `VITE_USE_API` per decidere se usare API o demo data
2. **Autenticazione**: Gestisce automaticamente i token JWT
3. **Error handling**: Fallback automatico a demo mode in caso di errori
4. **CRUD operations**: Metodi unificati che funzionano in entrambe le modalità

### Metodi Disponibili

```javascript
const {
  // Data
  data,           // { teams, athletes, zones, buses, matches, etc. }
  loading,        // boolean
  error,          // error message if any
  stats,          // calculated statistics
  
  // CRUD Operations
  createAthlete,
  updateAthlete,
  deleteAthlete,
  createTeam,
  updateTeam,
  deleteTeam,
  createMatch,
  updateMatch,
  deleteMatch,
  updateMatchRoster,
  createTransportZone,
  updateTransportZone,
  deleteTransportZone,
  uploadDocument,
  recordPayment,
  
  // Utilities
  refetch,        // Ricarica i dati
  isApiMode,      // true se connesso al backend
  api             // Client API per operazioni avanzate
} = useData();
```

## 📡 API Endpoints

### Athletes
- `GET /api/v1/athletes` - Lista atleti
- `GET /api/v1/athletes/:id` - Dettaglio atleta
- `POST /api/v1/athletes` - Crea atleta
- `PUT /api/v1/athletes/:id` - Aggiorna atleta
- `DELETE /api/v1/athletes/:id` - Elimina atleta

### Teams
- `GET /api/v1/teams` - Lista squadre
- `GET /api/v1/teams/:id` - Dettaglio squadra
- `POST /api/v1/teams` - Crea squadra
- `PUT /api/v1/teams/:id` - Aggiorna squadra
- `DELETE /api/v1/teams/:id` - Elimina squadra

### Matches
- `GET /api/v1/matches` - Lista partite
- `GET /api/v1/matches/:id` - Dettaglio partita
- `POST /api/v1/matches` - Crea partita
- `PUT /api/v1/matches/:id` - Aggiorna partita
- `DELETE /api/v1/matches/:id` - Elimina partita
- `PUT /api/v1/matches/:id/roster` - Aggiorna convocazioni
- `PUT /api/v1/matches/:id/stats` - Aggiorna statistiche

### Transport
- `GET /api/v1/transport/zones` - Lista zone
- `POST /api/v1/transport/zones` - Crea zona
- `PUT /api/v1/transport/zones/:id` - Aggiorna zona
- `DELETE /api/v1/transport/zones/:id` - Elimina zona
- `GET /api/v1/transport/buses` - Lista pulmini
- `POST /api/v1/transport/buses` - Crea pulmino
- `PUT /api/v1/transport/buses/:id` - Aggiorna pulmino
- `DELETE /api/v1/transport/buses/:id` - Elimina pulmino

### Dashboard
- `GET /api/v1/dashboard/stats` - Statistiche generali
- `GET /api/v1/dashboard/activity` - Activity feed

## 🔐 Autenticazione

### Login
```javascript
// Il componente Login gestisce automaticamente l'autenticazione
// I token sono salvati in localStorage e gestiti dall'hook useAuth
```

### Token Management
- Access token: JWT con durata 1 ora
- Refresh token: JWT con durata 7 giorni
- Auto-refresh prima della scadenza

## 🐛 Troubleshooting

### CORS Errors
```bash
# Verifica che CORS_ORIGIN nel backend .env corrisponda all'URL del frontend
CORS_ORIGIN=http://localhost:5173
```

### 401 Unauthorized
- Verifica che il JWT_SECRET sia configurato
- Controlla che il token sia presente in localStorage
- Prova a fare logout e login di nuovo

### Database Connection Errors
```bash
# Assicurati che PostgreSQL sia in esecuzione
# Esegui le migrations
cd backend
npm run prisma:migrate
npm run prisma:seed  # Per dati demo
```

## 📊 Testing

### Test in Demo Mode
```bash
npm run dev
# Naviga normalmente, tutti i dati sono simulati
```

### Test con Backend
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
VITE_USE_API=true npm run dev
```

### Test delle API con Postman
1. Importa la collection da `docs/postman/soccer-management.json`
2. Configura l'environment con `baseUrl: http://localhost:3000/api/v1`
3. Fai login per ottenere il token
4. Il token viene automaticamente usato per le richieste successive

## 🚀 Deployment

### Backend Deployment
```bash
cd backend
npm run build
npm start
```

### Frontend Deployment
```bash
npm run build
# I file statici saranno in dist/
```

### Environment Variables in Production
- Backend: Usa un servizio come Heroku, Railway, o DigitalOcean
- Frontend: Configura le variabili in Vercel, Netlify, o simili

## 📝 Note Importanti

1. **Compatibilità**: Il frontend è retrocompatibile - funziona sia con che senza backend
2. **Performance**: Le chiamate API sono ottimizzate con loading parallelo
3. **Error Handling**: Fallback automatico a demo mode in caso di problemi
4. **Caching**: I dati sono cachati localmente per migliorare le performance
5. **Real-time**: WebSocket supportato per notifiche in tempo reale

## 🔄 Migrazione da Demo a Production

1. Esporta i dati demo se necessario
2. Configura il database PostgreSQL
3. Esegui le migrations
4. Importa i dati (opzionale)
5. Cambia `VITE_USE_API=true`
6. Deploy!

---

Per ulteriori informazioni, consulta:
- [Backend Documentation](./BACKEND-DOCUMENTATION.md)
- [API Reference](./docs/api/README.md)
- [Database Schema](./backend/prisma/schema.prisma)
