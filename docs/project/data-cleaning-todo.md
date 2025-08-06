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
- [x] Creata `cleanDataForBackend(data, entityType)` in `api.js` che gestisce:
  - Pulizia telefoni (rimuove trattini, spazi, parentesi)
  - Pulizia CAP (solo numeri)
  - Conversione date in ISO 8601
  - Conversioni legacy (age→birthDate, number→jerseyNumber, usesBus→usesTransport)
  - Rimozione campi non accettati dal backend
  - Gestione campi specifici per tipo di entità

### 3. Implementazione per Atleti ✅
- [x] Aggiunto metodo `createAthlete()` con data cleaning
- [x] Aggiornato `updateAthlete()` per usare helper
- [x] Testato e verificato funzionamento

### 4. Implementazione per Autenticazione e Utenti ✅
- [x] `register()` - Registrazione nuovi utenti
- [x] `updateProfile()` - Update profilo utente
- [x] `changePassword()` - Cambio password
- [x] Pulizia automatica campo `phone`

### 5. Implementazione per Organizzazioni ✅
- [x] `createOrganization()` - Creazione nuova società
- [x] `updateOrganization()` - Update dati società
- [x] Pulizia: `phone`, `postalCode`, `fiscalCode`, `vatNumber`, `presidentPhone`, `secretaryPhone`, `iban`

### 6. Implementazione per Staff ✅
- [x] `createStaffMember()` - Aggiungi membro staff
- [x] `updateStaffMember()` - Modifica membro staff
- [x] `deleteStaffMember()` - Elimina membro staff

### 7. Implementazione per Documenti ✅
- [x] `createDocument()` - Nuovo documento
- [x] `updateDocument()` - Modifica documento
- [x] Gestione date scadenza in formato ISO 8601

### 8. Implementazione per Pagamenti ✅
- [x] `createPayment()` - Nuovo pagamento
- [x] `updatePayment()` - Modifica pagamento
- [x] Conversione date pagamento

### 9. Implementazione per Partite ✅
- [x] `createMatch()` - Nuova partita
- [x] `updateMatch()` - Modifica partita
- [x] Gestione date/orari partite

### 10. Metodi Generici ✅
- [x] `patch()` - Determina automaticamente il tipo di entità dal path

### 11. Documentazione ✅
- [x] Creato `docs/development/data-cleaning.md`
- [x] Documentate regex di validazione backend
- [x] Esempi di utilizzo
- [x] Aggiornata scaletta lavori

## 🎯 FUNZIONALITÀ HELPER `cleanDataForBackend()`

### Pulizia Generale (tutti i tipi):
- ✅ Rimozione campi vuoti/null
- ✅ Pulizia telefoni (phone, presidentPhone, secretaryPhone)
- ✅ Pulizia CAP (solo numeri, 5 cifre)
- ✅ Pulizia codice fiscale (uppercase, solo alfanumerici)
- ✅ Pulizia partita IVA (solo numeri)
- ✅ Pulizia IBAN (uppercase, no spazi)
- ✅ Conversione date in ISO 8601
- ✅ Rimozione campo `id` dal body

### Pulizia Specifica per Atleti:
- ✅ Conversione age → birthDate
- ✅ Conversione number → jerseyNumber
- ✅ Conversione usesBus → usesTransport
- ✅ Rimozione campi legacy

## 🚧 LAVORI DA FARE

### 1. Testing Completo
- [ ] Test manuale di ogni funzionalità modificata
- [ ] Verificare che non ci siano regressioni
- [ ] Test con formati di input "sporchi"

### 2. Trasporti
- [ ] `assignTransport()` - Assegnazione trasporto atleta
- [ ] Verificare altri metodi trasporti

### 3. Genitori (se implementato)
- [ ] Verificare se esistono endpoint per genitori
- [ ] Implementare pulizia se necessario

### 4. Miglioramenti Futuri
- [ ] Aggiungere validazione lato client prima dell'invio
- [ ] Messaggi di errore più specifici
- [ ] Unit test per la funzione helper

## 📊 RIEPILOGO MODIFICHE

### Metodi API Aggiornati:
1. **Atleti**: createAthlete, updateAthlete
2. **Auth**: register, updateProfile
3. **Organizzazioni**: createOrganization, updateOrganization
4. **Staff**: createStaffMember, updateStaffMember
5. **Documenti**: createDocument, updateDocument
6. **Pagamenti**: createPayment, updatePayment
7. **Partite**: createMatch, updateMatch
8. **Generico**: patch

### Campi Puliti Automaticamente:
- **Telefoni**: Rimozione di spazi, trattini, parentesi
- **CAP**: Solo 5 cifre numeriche
- **Codice Fiscale**: Uppercase, formato corretto
- **Partita IVA**: Solo numeri
- **IBAN**: Uppercase, no spazi
- **Date**: Conversione in ISO 8601

## ✅ RISULTATO FINALE

Ora il sistema pulisce automaticamente tutti i dati prima di inviarli al backend, garantendo che:
- I formati siano sempre corretti
- Non ci siano errori di validazione
- L'esperienza utente sia migliore (non devono inserire dati in formati specifici)
- Il codice sia più manutenibile (logica centralizzata)
