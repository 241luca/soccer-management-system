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

## Esempio di Utilizzo

```javascript
// Prima (errore 400)
api.updateAthlete(id, {
  phone: "335-123 4567",  // Formato non valido
  birthDate: "2010-01-01" // Manca orario
});

// Dopo (funziona)
api.updateAthlete(id, {
  phone: "335-123 4567",  // Verrà pulito automaticamente
  birthDate: "2010-01-01" // Verrà convertito in ISO 8601
});
// Invia: { phone: "3351234567", birthDate: "2010-01-01T00:00:00.000Z" }
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
