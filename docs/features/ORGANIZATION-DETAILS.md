# Anagrafica Completa Società - Documentazione

## Panoramica
È stata implementata l'anagrafica completa per la gestione dettagliata delle società di calcio nel sistema Soccer Management.

## Modifiche al Database

### Nuovi campi nella tabella Organization:
- **Dati societari completi**:
  - `fullName` - Nome completo della società
  - `address`, `city`, `province`, `postalCode`, `country` - Indirizzo completo
  - `phone`, `email`, `website` - Contatti
  - `fiscalCode`, `vatNumber` - Dati fiscali
  - `foundedYear` - Anno di fondazione
  - `federationNumber` - Numero federazione
  - `iban`, `bankName` - Dati bancari

- **Personalizzazione visiva**:
  - `primaryColor`, `secondaryColor` - Colori societari
  - `description` - Descrizione della società

- **Contatti dirigenza**:
  - `presidentName`, `presidentEmail`, `presidentPhone` - Dati presidente
  - `secretaryName`, `secretaryEmail`, `secretaryPhone` - Dati segretario

- **Social media**:
  - `socialFacebook`, `socialInstagram`, `socialTwitter`, `socialYoutube`

## API Endpoints

### GET `/api/v1/organizations/current/details`
Recupera tutti i dettagli dell'organizzazione corrente.

### PATCH `/api/v1/organizations/current/details`
Aggiorna i dettagli dell'organizzazione. Richiede permessi `ORGANIZATION_UPDATE`.

### POST `/api/v1/organizations/current/logo`
Upload del logo della società (da implementare con multer).

## Componenti Frontend

### OrganizationDetails.jsx
Componente principale per la gestione dell'anagrafica con 5 tab:
1. **Informazioni Generali** - Logo, nome, descrizione, indirizzo
2. **Contatti** - Telefono, email, sito web, contatti dirigenza
3. **Dati Legali** - Codice fiscale, P.IVA, dati bancari
4. **Aspetto** - Colori societari con preview
5. **Social Media** - Link ai profili social

### Modifiche alla Navigation
- Mostra il logo della società (se presente) al posto del pallone generico
- Mostra il nome della società al posto di "Soccer Manager"
- Su mobile mostra il codice società

### Modifiche all'OrganizationSwitcher
- Mostra il logo di ogni società nel menu a tendina
- Evidenzia con un anello blu la società attualmente selezionata

## Utilizzo

### Accesso all'anagrafica
1. Vai su **Impostazioni** dal menu principale
2. Nella tab **Società**, clicca su **"Apri Anagrafica"**
3. Modifica i dati desiderati
4. Clicca **"Salva Modifiche"**

### Permessi
- Solo utenti con ruolo `ADMIN` o `SUPER_ADMIN` possono modificare l'anagrafica
- Tutti gli utenti possono visualizzare i dati

### Validazioni
- Email: formato valido richiesto
- Colori: formato esadecimale (#RRGGBB)
- CAP: 5 cifre
- Provincia: 2 caratteri
- Anno di fondazione: tra 1900 e anno corrente

## Logo e Colori

### Logo
- Il logo viene mostrato nella navbar principale
- Nel menu di selezione società
- Nell'anagrafica società
- Formato supportato: immagini (JPG, PNG, etc.)
- Dimensione massima: 5MB

### Colori Societari
- I colori possono essere personalizzati per ogni società
- Verranno utilizzati per personalizzare l'interfaccia (futura implementazione)
- Preview in tempo reale durante la modifica

## Prossimi Sviluppi
1. Implementare l'upload del logo con multer
2. Applicare i colori societari all'interfaccia
3. Aggiungere validazione lato server per tutti i campi
4. Implementare la cronologia delle modifiche
5. Aggiungere campi personalizzati per società

## Note Tecniche
- La migrazione SQL è non distruttiva (usa IF NOT EXISTS)
- Gli indici sono stati aggiunti per fiscalCode, vatNumber e federationNumber
- Tutti i nuovi campi sono opzionali per retrocompatibilità
