# 📝 Changelog

Tutte le modifiche significative al Soccer Management System sono documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/it/1.0.0/),
e questo progetto aderisce al [Semantic Versioning](https://semver.org/lang/it/).

## [2.0.3] - 2025-08-05

### 🐛 Risolto
- **Fix TypeError in AthletesView**: Corretto errore "Cannot read properties of undefined"
  - Gestito correttamente campi firstName/lastName separati invece di name
  - Aggiunto controlli null-safe per tutti i campi
  - Fix applicato sia alla vista tabella che schede
  - Migliorata ricerca per gestire tutti i formati nome

## [2.0.2] - 2025-08-05

### 🐛 Risolto
- **Rimosso definitivamente CDN Tailwind**: Configurato build produzione corretto
  - Eliminato completamente CDN da index.html
  - Tailwind ora compilato via PostCSS
  - Nessun warning in console
  - Build produzione ottimizzata

### 🆕 Aggiunto
- Script `reset-app.sh` per reset completo applicazione
- Script `quick-reset.sh` per pulizia veloce browser
- Sezione "Reset & Fix" nel control panel

## [2.0.1] - 2025-08-05

### 🐛 Risolto
- **Fix Tailwind CSS in produzione**: Rimosso CDN e configurato correttamente PostCSS
  - Aggiunto @tailwind directives in index.css
  - Rimosso script CDN da index.html
  - Prevenuto warning in console browser

- **Fix Organization ID mancante**: Risolto errore "Organization ID required" per Super Admin
  - Aggiunto fallback automatico a Demo Soccer Club per Super Admin
  - Migliorata gestione organization ID in api.js
  - Fix errore 400 nelle chiamate API

### 🔧 Modificato
- Migliorata gestione token e organizzazione per utenti Super Admin
- Aggiunto logging per debug organization ID

## [2.0.0] - 2025-08-05

### ✨ Aggiunto

#### Modulo Anagrafica Società Completo
- **API Organizations Enhanced**
  - GET `/organizations/:id/details` - Dettagli completi con tutti i campi anagrafica
  - PUT `/organizations/:id` - Aggiornamento con validazioni complete
  - Conteggi relazioni (_count) per teams, users, athletes, venues, sponsors, staffMembers
  - Gestione permessi multi-tenant migliorata

- **Modulo Sponsor** (Nuovo)
  - CRUD completo per gestione sponsor
  - Tipi sponsor: main, technical, gold, silver, bronze, partner
  - Gestione visibilità: jersey, website, stadium, materials, events
  - Summary automatico con statistiche e valore totale annuale
  - Soft delete per mantenere storico

- **Staff Management Enhanced**
  - Nuovi campi per gestione compensi: salary, contractType, paymentFrequency
  - Tipi contratto: full-time, part-time, volunteer, consultant
  - Frequenze pagamento: monthly, weekly, hourly, per-event
  - Filtro per staff inattivi

- **Team Kits Enhanced**
  - Integrazione e-commerce: shopUrl, merchandiseUrl, price
  - Gestione taglie disponibili (array)
  - Filtri per season, kitType, teamId
  - Pattern maglie: solid, stripes, hoops, checkered, gradient

- **Organization Documents** (Nuovo)
  - Upload documenti societari (max 10MB)
  - Categorie: statuto, bilancio, verbale, certificato, etc.
  - Gestione documenti pubblici/privati
  - Download sicuro con controllo permessi
  - Tags e ricerca avanzata

### 🔧 Modificato

- **Validazioni Server-side**
  - Email validation
  - Colori hex (#RRGGBB)
  - IBAN italiano (IT + 25 caratteri)
  - Codice Fiscale (16 caratteri)
  - P.IVA (11 cifre)
  - URL validation per siti web e social
  - CAP (5 cifre) e Provincia (2 lettere)

- **Database Schema**
  - Aggiunta tabella Sponsor
  - Aggiornata tabella StaffMember con campi compensi
  - Aggiornata tabella TeamKit con campi e-commerce
  - Indici ottimizzati per performance

### 🛠️ Tecnico

- Aggiunto `multer` per gestione upload file
- Aggiunto `express-validator` per validazioni robuste
- Nuova struttura validators per separazione logica
- Migliorata gestione errori con codici specifici
- Implementato pattern di soft delete consistente

### 📚 Documentazione

- Documentazione API completa per tutti i nuovi endpoint
- Esempi dettagliati di request/response
- Guide best practices per ogni modulo
- Use cases e snippets di codice

## [1.5.0] - 2025-07-15

### ✨ Aggiunto
- Sistema di notifiche real-time con Socket.IO
- Dashboard analytics avanzate
- Export dati in Excel/PDF

### 🔧 Modificato
- Migliorata performance query database
- Ottimizzato caricamento immagini
- Aggiornate dipendenze di sicurezza

### 🐛 Risolto
- Fix calcolo statistiche atleti
- Fix permessi multi-tenant
- Fix upload documenti grandi

## [1.4.0] - 2025-06-20

### ✨ Aggiunto
- Gestione trasporti atleti
- Sistema di pagamenti integrato
- Calendario allenamenti

### 🔧 Modificato
- UI/UX dashboard principale
- Sistema di autenticazione JWT
- Gestione sessioni migliorata

## [1.3.0] - 2025-05-10

### ✨ Aggiunto
- Gestione documenti atleti
- Sistema di scadenze automatiche
- Report personalizzabili

### 🐛 Risolto
- Fix validazione documenti
- Fix calcolo scadenze
- Fix permessi documenti

## [1.2.0] - 2025-04-05

### ✨ Aggiunto
- Multi-tenancy completo
- Gestione ruoli personalizzati
- Sistema inviti organizzazione

### 🔧 Modificato
- Architettura database per multi-tenant
- Sistema permessi granulare
- API authentication flow

## [1.1.0] - 2025-03-01

### ✨ Aggiunto
- Gestione partite e risultati
- Statistiche giocatori
- Convocazioni automatiche

### 🔧 Modificato
- Performance lista atleti
- Filtri e ordinamenti
- Export convocazioni

## [1.0.0] - 2025-01-15

### ✨ Release Iniziale
- Gestione organizzazioni
- Gestione squadre
- Gestione atleti
- Sistema autenticazione
- Dashboard base
- Gestione utenti e ruoli

---

## Legenda

- ✨ **Aggiunto** - Nuove funzionalità
- 🔧 **Modificato** - Modifiche a funzionalità esistenti  
- 🐛 **Risolto** - Bug fix
- 🗑️ **Deprecato** - Funzionalità deprecate
- ❌ **Rimosso** - Funzionalità rimosse
- 🔒 **Sicurezza** - Fix di sicurezza
- 🛠️ **Tecnico** - Modifiche tecniche/infrastruttura
- 📚 **Documentazione** - Aggiornamenti documentazione
