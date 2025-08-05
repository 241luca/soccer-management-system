# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- 🐛 Aggiunte dipendenze mancanti al backend
  - Il modulo compression era importato in server.ts ma non presente in package.json
  - Il modulo uuid era importato in auth.service.ts ma non presente in package.json
  - Aggiunti `compression`, `@types/compression`, `uuid` e `@types/uuid` come dipendenze
- 🐛 Corretti errori TypeScript nei file del backend
  - Risolti errori TS7030 in organization.routes.ts dove non tutti i percorsi del codice restituivano un valore
  - Corretto stesso errore in organization.validator.ts nella funzione handleValidationErrors
  - Corretto stesso errore in sponsors.routes.ts nelle funzioni PUT e DELETE
  - Corretto stesso errore in sponsor.validator.ts nella funzione handleValidationErrors
  - Corretto stesso errore in staff.routes.ts nelle funzioni GET, PUT e DELETE
  - Corretto stesso errore in teamKits.routes.ts nelle funzioni GET, POST, PUT e DELETE
  - Corretto stesso errore in organizationDocuments.routes.ts nelle funzioni POST, GET (download), PUT e DELETE
  - Modificati i return nelle funzioni per essere compatibili con TypeScript
- ✅ Backend ora si avvia correttamente
  - Risolti tutti gli errori di compilazione TypeScript
  - Il server ora parte sulla porta 3000 (o su altra porta se specificata in .env)
- 🔧 Aggiunta route mancante per aggiornare i dettagli dell'organizzazione
  - Aggiunta route PATCH /api/v1/organizations/:id/details per permettere l'aggiornamento dei dettagli dell'organizzazione dal frontend
- 📝 Creata guida completa per implementazione notifiche
  - Salvata in docs/guides/NOTIFICATIONS_IMPLEMENTATION_GUIDE.md
  - Include codice completo per tutti i componenti necessari
  - Istruzioni step-by-step per future implementazioni

## [2.1.0] - 2025-08-04

### Added
- 🏢 **Interfaccia gestione organizzazioni** per Super Admin
  - Lista completa delle organizzazioni con filtri e statistiche
  - Form creazione/modifica organizzazioni
  - Gestione piani di abbonamento (Basic, Pro, Enterprise)
- 🔄 **Organization Switcher** nel menu utente
  - Cambio rapido tra società per utenti multi-organizzazione
  - Indicatore visivo della società attualmente selezionata
  - Aggiornamento automatico del contesto
- 📋 Nuove routes nell'app per gestione organizzazioni
  - `/organizations` - Lista organizzazioni
  - `/organizations/new` - Crea nuova organizzazione
  - `/organizations/:id/edit` - Modifica organizzazione

### Changed
- 🔧 Navigation aggiornata per includere Organization Switcher
- 🔧 App.jsx ora gestisce stato dell'organizzazione corrente
- 🔧 LoginPage modificato per passare dati completi (user + organization)
- 📦 Menu Organizzazioni visibile solo per Super Admin

### Removed
- 🗑️ **File demoData.js completamente rimossi**
  - `src/data/demoData.js` spostato in archivio
  - `src/data/notificationDemoData.js` spostato in archivio
  - Sistema ora completamente basato su API reali

## [1.0.0] - 2025-01-03

### Added
- 🎉 Initial release of Soccer Management System
- ✅ Complete multi-tenant architecture
- ✅ JWT authentication with refresh tokens
- ✅ Athletes management (CRUD operations)
- ✅ Teams management with categories
- ✅ Documents tracking with expiry notifications
- ✅ Payments management system
- ✅ Dashboard with real-time statistics
- ✅ Responsive UI with mobile support
- ✅ Role-based access control (RBAC)
- ✅ WebSocket support for real-time updates

### Fixed
- 🐛 Authentication middleware now correctly includes organizationId
- 🐛 Rate limiting causing "Too many requests" errors - now configurable
- 🐛 Athletes API returning empty array - fixed organization filtering
- 🐛 Navigation not responsive on mobile - added hamburger menu
- 🐛 Login loop with expired tokens - improved 401 handling
- 🐛 ValidationError class constructor parameters
- 🐛 useApiData hook causing infinite re-renders

### Changed
- 🔧 Rate limiting disabled by default in development
- 🔧 Rate limits increased (1000 req/15min general, 100 auth)
- 🔧 Improved error handling in API client
- 🔧 Better TypeScript types throughout

### Security
- 🔐 JWT secrets configurable via environment
- 🔐 CORS properly configured
- 🔐 Rate limiting available for production
- 🔐 SQL injection prevention with Prisma ORM

### Database
- 📊 PostgreSQL 15 with UUID primary keys
- 📊 Multi-tenant schema with organization isolation
- 📊 Seed scripts for demo data
- 📊 Optimized indexes for common queries

### Documentation
- 📚 Complete technical documentation
- 📚 API endpoint documentation
- 📚 Setup and installation guide
- 📚 Troubleshooting section

## [0.9.0] - 2024-12-20 (Beta)

### Added
- Initial beta release for testing
- Basic CRUD operations
- Simple authentication
- Demo data generation

## Roadmap

### [1.1.0] - Planned
- [ ] Email notifications
- [ ] SMS integration
- [ ] Advanced reporting
- [ ] Mobile app (React Native)
- [ ] Calendar integration
- [ ] Video analysis tools

### [1.2.0] - Future
- [ ] AI-powered player recommendations
- [ ] Financial forecasting
- [ ] Multi-language support
- [ ] Advanced statistics
- [ ] Training session planning

---

For detailed information about each release, see the [GitHub Releases](https://github.com/241luca/soccer-management-system/releases) page.
