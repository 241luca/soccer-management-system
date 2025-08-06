# 📋 SCALETTA LAVORI - Data Cleaning & Validation

## ✅ LAVORI COMPLETATI

### 1. Analisi del Problema
- [x] Identificato errore 400 Bad Request su update atleti
- [x] Scoperto che il backend usa Zod per validazione con requisiti specifici:
  - Telefono: solo numeri (regex: `/^\+?\d{10,15}$/`)
  - CAP: 5 cifre numeriche (regex: `/^\d{5}$/`)
  - Date: formato ISO 8601 completo
  - Codice Fiscale: formato specifico italiano

### 2. Creazione Funzione Helper
- [x] Creata `cleanDataForBackend()` in `api.js` che gestisce:
  - Pulizia telefoni (rimuove trattini, spazi, parentesi)
  - Pulizia CAP (solo numeri)
  - Conversione date in ISO 8601
  - Conversioni legacy (age→birthDate, number→jerseyNumber, usesBus→usesTransport)
  - Rimozione campi non accettati dal backend

### 3. Implementazione per Atleti
- [x] Aggiunto metodo `createAthlete()` con data cleaning
- [x] Aggiornato `updateAthlete()` per usare helper
- [x] Testato e verificato funzionamento

### 4. Documentazione
- [x] Creato `docs/development/data-cleaning.md`
- [x] Documentate regex di validazione backend
- [x] Esempi di utilizzo

## 🚧 LAVORI DA FARE

### 1. Autenticazione e Utenti
- [ ] `register()` - Registrazione nuovi utenti
- [ ] `updateUser()` - Update profilo utente
- [ ] `createUser()` - Creazione utenti da admin
- [ ] Campi da pulire: `phone`, `firstName`, `lastName`

### 2. Organizzazioni
- [ ] `updateOrganization()` - Update dati società
- [ ] `createOrganization()` - Creazione nuova società (multi-tenant)
- [ ] Campi da pulire: `phone`, `postalCode`, `fiscalCode`, `vatNumber`, `presidentPhone`, `secretaryPhone`

### 3. Staff
- [ ] `createStaffMember()` - Aggiungi membro staff
- [ ] `updateStaffMember()` - Modifica membro staff
- [ ] Campi da pulire: `phone`, `fiscalCode`

### 4. Genitori (Parents)
- [ ] Verificare se esistono endpoint per genitori
- [ ] Campi probabili: `phone`, `fiscalCode`, `address`

### 5. Documenti
- [ ] Verificare validazioni per upload documenti
- [ ] Gestione date scadenza in formato ISO 8601

### 6. Pagamenti
- [ ] `createPayment()` - Nuovo pagamento
- [ ] `updatePayment()` - Modifica pagamento
- [ ] Verificare formato date pagamento

### 7. Partite
- [ ] `createMatch()` - Nuova partita
- [ ] `updateMatch()` - Modifica partita
- [ ] Gestione date/orari partite

### 8. Trasporti
- [ ] `createBus()` - Nuovo autobus
- [ ] `updateBus()` - Modifica autobus
- [ ] `assignTransport()` - Assegnazione trasporto atleta

## 📊 PRIORITÀ

### 🔴 Alta Priorità (Da fare subito)
1. **Utenti/Auth** - Impatta login e registrazione
2. **Organizzazioni** - Dati societari fondamentali

### 🟡 Media Priorità
3. **Staff** - Gestione personale
4. **Documenti** - Scadenze importanti
5. **Pagamenti** - Gestione quote

### 🟢 Bassa Priorità
6. **Partite** - Calendario
7. **Trasporti** - Funzionalità accessoria
8. **Genitori** - Se implementato

## 🛠️ PIANO DI LAVORO

### Fase 1: Identificazione Endpoints
1. Cercare tutti i metodi create/update in `api.js`
2. Verificare quali hanno campi che necessitano pulizia
3. Controllare schema Prisma per validazioni

### Fase 2: Implementazione
1. Applicare `cleanDataForBackend()` a ogni metodo identificato
2. Testare con dati reali
3. Aggiornare documentazione

### Fase 3: Testing
1. Test manuale di ogni funzionalità
2. Verificare che non ci siano regressioni
3. Test con formati di input "sporchi"

### Fase 4: Documentazione Finale
1. Aggiornare data-cleaning.md con tutti i casi
2. Aggiungere esempi per ogni modulo
3. Note per futuri sviluppatori

## 📝 NOTE

- La funzione helper è già predisposta per gestire la maggior parte dei casi
- Potrebbe essere necessario aggiungere logica specifica per alcuni campi
- Verificare sempre le validazioni Zod nel backend prima di implementare
