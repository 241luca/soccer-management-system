# Data Cleaning e Validazione Backend

## Problema Risolto

Il backend utilizza Zod per la validazione dei dati con requisiti specifici su formato dei campi:
- **Telefono**: deve contenere solo numeri (10-15 cifre) e opzionalmente iniziare con +
- **CAP**: deve essere esattamente 5 cifre numeriche
- **Date**: devono essere in formato ISO 8601 completo (`YYYY-MM-DDTHH:mm:ss.sssZ`)

## Soluzione Implementata

### 1. Funzione Helper `cleanDataForBackend`

Creata una funzione centralizzata in `api.js` che:

```javascript
cleanDataForBackend(data) {
  // Rimuove campi vuoti/null
  // Pulisce formato telefono (335-1234567 → 3351234567)
  // Pulisce formato CAP (solo numeri)
  // Converte age → birthDate
  // Converte birthDate in formato ISO 8601
  // Converte campi legacy (number → jerseyNumber, usesBus → usesTransport)
  // Rimuove campi non accettati dal backend
}
```

### 2. Campi Gestiti

#### Pulizia Automatica:
- `phone`: rimuove trattini, spazi, parentesi (mantiene solo numeri e +)
- `postalCode`: rimuove tutto tranne i numeri
- `birthDate`: converte in formato datetime ISO 8601

#### Conversioni Legacy:
- `age` → `birthDate` (calcola anno di nascita)
- `number` → `jerseyNumber`
- `usesBus` → `usesTransport`

#### Campi Rimossi:
- `id`, `name`, `assignedBus`, `zone` (oggetti completi)
- `membershipFee`, `feeStatus`, `medicalExpiry`, `insuranceExpiry`
- `busFee`, `busFeeStatus`
- `gamesPlayed`, `goals`, `yellowCards`, `redCards`
- `position` (stringa, dovrebbe essere `positionId`)

### 3. Metodi Aggiornati

- `createAthlete(data)` - nuovo metodo per creare atleti
- `updateAthlete(id, data)` - usa la funzione helper

### 4. TODO: Altri Metodi da Aggiornare

Occorre applicare la stessa logica di pulizia a:
- Creazione/update di utenti (hanno campo `phone`)
- Creazione/update di organizzazioni (hanno `phone`, `postalCode`, etc.)
- Altri modelli che hanno campi simili

## Funzione Helper Migliorata

La funzione `cleanDataForBackend(data, entityType)` ora accetta un parametro `entityType` per gestire pulizie specifiche:

```javascript
cleanDataForBackend(data, entityType = 'general') {
  // Pulizia generale per tutti i tipi
  // ...
  
  // Pulizia specifica per tipo di entità
  if (entityType === 'athlete') {
    // Logica specifica per atleti
  }
  // Altri tipi: 'organization', 'staff', 'document', 'payment', 'match', 'user'
}
```

### Tipi di Entità Supportati:

- `'general'` - Pulizia di base (default)
- `'athlete'` - Include conversioni legacy (age→birthDate, etc.)
- `'organization'` - Pulisce campi societari
- `'staff'` - Per membri dello staff
- `'document'` - Gestisce date scadenza
- `'payment'` - Date pagamenti
- `'match'` - Date e orari partite
- `'user'` - Dati utente

### Metodi API Aggiornati:

Tutti i metodi che inviano dati al backend ora usano la funzione helper:

```javascript
// Atleti
api.createAthlete(data)     // usa entityType: 'athlete'
api.updateAthlete(id, data) // usa entityType: 'athlete'

// Organizzazioni
api.createOrganization(data)     // usa entityType: 'organization'
api.updateOrganization(id, data) // usa entityType: 'organization'

// Staff
api.createStaffMember(data)     // usa entityType: 'staff'
api.updateStaffMember(id, data) // usa entityType: 'staff'

// E così via per tutti gli altri metodi...
```

## Note per gli Sviluppatori

1. **Sempre usare i metodi API** che includono la pulizia automatica
2. **Non inviare direttamente** al backend senza pulire i dati
3. **Aggiungere nuove conversioni** nella funzione `cleanDataForBackend` se necessario
4. **Testare con diversi formati** di input per verificare la robustezza

## Validazioni Backend (Zod)

Riferimento delle regex utilizzate dal backend:
- Telefono: `/^\+?\d{10,15}$/`
- CAP: `/^\d{5}$/`
- Codice Fiscale: `/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/`
- Data: formato ISO 8601 datetime
