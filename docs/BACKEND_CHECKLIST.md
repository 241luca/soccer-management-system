# ✅ Backend Implementation Checklist - Anagrafica Società

## 📋 Pre-requisiti
- [ ] PostgreSQL database attivo
- [ ] Prisma configurato e connesso
- [ ] JWT authentication funzionante
- [ ] Rate limiting configurato (opzionale in dev)

## 🗄️ Database Setup
- [ ] Eseguire migration per tabella Sponsor
- [ ] Aggiornare StaffMember con campi compensi
- [ ] Aggiornare TeamKit con campi e-commerce
- [ ] Verificare indici su tutte le foreign key
- [ ] Test connessione database

## 🔐 Middleware
- [ ] `requireOrganizationContext` - Estrae orgId da headers/params
- [ ] `checkSuperAdmin` - Verifica ruolo e header X-Super-Admin
- [ ] `canModifyOrganization` - Controllo permessi per modifica
- [ ] Integrazione middleware in app.js

## 📡 Organizations API
### GET /organizations/:id/details
- [ ] Endpoint implementato
- [ ] Include _count per relazioni
- [ ] Gestione permessi (Admin, Owner, Super Admin)
- [ ] Error handling (403, 404, 500)
- [ ] Test con tutti i ruoli

### PUT /organizations/:id
- [ ] Endpoint implementato
- [ ] Validazione tutti i campi
- [ ] Rimozione campi read-only
- [ ] Gestione errori duplicati
- [ ] Test update parziale e completo

## 💰 Sponsors Module
### GET /organizations/:orgId/sponsors
- [ ] Lista sponsor con filtri
- [ ] Summary con totali e categorie
- [ ] Ordinamento per tipo e importo
- [ ] Calcolo valore totale annuale
- [ ] Test con e senza filtri

### POST /organizations/:orgId/sponsors
- [ ] Creazione nuovo sponsor
- [ ] Validazione campi richiesti
- [ ] Gestione array visibility
- [ ] Response formato corretto
- [ ] Test tutti i tipi sponsor

### PUT /sponsors/:id
- [ ] Update sponsor esistente
- [ ] Verifica appartenenza organizzazione
- [ ] Validazione campi modificabili
- [ ] Mantenimento campi non inviati
- [ ] Test permessi cross-organization

### DELETE /sponsors/:id
- [ ] Soft delete (isActive = false)
- [ ] Verifica permessi
- [ ] Response successo
- [ ] Test riattivazione

## 👥 Staff Enhanced
### GET /organizations/:orgId/staff
- [ ] Include nuovi campi compensi
- [ ] Relazione con team
- [ ] Filtro includeInactive
- [ ] Ordinamento per ruolo
- [ ] Test con staff inattivi

### PUT /staff/:id
- [ ] Update con campi compensi
- [ ] Validazione salary >= 0
- [ ] Validazione contractType enum
- [ ] Validazione paymentFrequency enum
- [ ] Test tutti i tipi contratto

## 👕 Team Kits Enhanced
### GET /organizations/:orgId/kits
- [ ] Include campi e-commerce
- [ ] Filtri season, type, team
- [ ] Ordinamento sensato
- [ ] Array availableSizes
- [ ] Test filtri multipli

### PUT /kits/:id
- [ ] Update campi e-commerce
- [ ] Validazione URL shop/merchandise
- [ ] Gestione decimal price
- [ ] Update array sizes
- [ ] Test prezzi e taglie

## 📄 Documents
### POST /organizations/:orgId/documents
- [ ] Upload con multer
- [ ] Generazione filename univoco
- [ ] Salvataggio metadata
- [ ] Limite dimensione file
- [ ] Test formati multipli

### GET /documents/:id/download
- [ ] Stream file al client
- [ ] Headers corretti (content-type, disposition)
- [ ] Verifica permessi organizzazione
- [ ] Gestione file non trovato
- [ ] Test download grandi file

## ✅ Validazioni
### Organization Validator
- [ ] Email formato valido
- [ ] Colori hex #RRGGBB
- [ ] IBAN italiano (IT + 25 char)
- [ ] Codice Fiscale (16 char)
- [ ] P.IVA (11 cifre)
- [ ] URL validi (website, social)
- [ ] Anno fondazione range valido
- [ ] CAP 5 cifre

### Sponsor Validator
- [ ] Nome obbligatorio
- [ ] Tipo in enum validi
- [ ] Date formato ISO
- [ ] Importo decimal positivo
- [ ] Array visibility valori corretti

### Staff Validator
- [ ] Salary >= 0 o null
- [ ] contractType in enum
- [ ] paymentFrequency in enum
- [ ] Email formato se presente

## 🧪 Testing
### Unit Tests
- [ ] Test validatori con casi edge
- [ ] Test middleware permessi
- [ ] Test calcoli summary sponsor
- [ ] Test conversioni Decimal

### Integration Tests
- [ ] Test flusso completo CRUD sponsor
- [ ] Test update organization tutti campi
- [ ] Test permessi multi-tenant
- [ ] Test upload/download documenti

### E2E con Frontend
- [ ] Login e navigazione anagrafica
- [ ] Modifica tutti i tab
- [ ] Creazione sponsor
- [ ] Update staff con compensi
- [ ] Cambio società (Owner/Super Admin)

## 📊 Performance
- [ ] Query con include ottimizzate
- [ ] Indici su campi di ricerca
- [ ] Paginazione per liste lunghe
- [ ] Cache per dati statici

## 🔒 Security
- [ ] SQL injection prevention (Prisma)
- [ ] File upload validation
- [ ] Path traversal protection
- [ ] Rate limiting attivo
- [ ] CORS configurato

## 📝 Documentazione
- [ ] API endpoints documentati
- [ ] Esempi request/response
- [ ] Error codes documentati
- [ ] Postman collection aggiornata

## 🚀 Deployment Ready
- [ ] Environment variables configurate
- [ ] Migrations pronte per produzione
- [ ] Logging configurato
- [ ] Error tracking setup
- [ ] Backup strategy definita

## 🎯 Acceptance Criteria
- [ ] Tutti i tab anagrafica funzionanti
- [ ] Navigazione fluida senza errori
- [ ] Validazioni user-friendly
- [ ] Performance < 200ms per chiamata
- [ ] Zero errori 500 in produzione

## 📌 Note Finali
1. Il frontend gestisce errori 403 con fallback localStorage
2. Header X-Super-Admin viene inviato automaticamente
3. Decimal fields devono essere convertiti a number per JSON
4. Array fields richiedono default [] se non presenti
5. Soft delete sempre preferito a hard delete

---

**Completamento stimato**: 2-3 giorni con developer esperto
**Priorità**: Organizations API → Sponsors → Staff/Kits → Documents
