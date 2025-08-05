# Gestione Organizzazioni - Guida Completa

## Panoramica

Il sistema di gestione delle organizzazioni permette di amministrare completamente tutti i dati societari attraverso un'interfaccia intuitiva e ben organizzata.

## Accesso all'Anagrafica

### Dal Menu Principale
1. Clicca su **"Impostazioni"** nel menu laterale
2. Si aprirà automaticamente l'**Anagrafica della Società** con tutti i dati

### Navigazione
- **Altri Dati**: Accedi alle impostazioni di sistema (notifiche, permessi, etc.)
- **Cambia Società**: Visibile solo per Super Admin e Manager Multi-Società

## Struttura dell'Anagrafica

L'anagrafica è organizzata in tab per una facile navigazione:

### 1. Informazioni Generali 📋
Dati principali della società:
- **Logo**: Carica o aggiorna il logo societario
- **Nome Completo**: Denominazione ufficiale
- **Nome Breve**: Nome abbreviato per visualizzazioni compatte
- **Codice**: Codice identificativo interno
- **Indirizzo Completo**: Via, CAP, Città, Provincia
- **Sito Web**: URL del sito ufficiale
- **Email Generale**: Indirizzo email principale
- **Telefono**: Numero di telefono principale
- **Anno Fondazione**: Anno di costituzione
- **Numero Federazione**: Codice affiliazione federale
- **Descrizione**: Presentazione della società

### 2. Contatti 📞
Gestione dei contatti chiave:
- **Presidente**
  - Nome e Cognome
  - Email diretta
  - Telefono
- **Segretario**
  - Nome e Cognome
  - Email diretta
  - Telefono

### 3. Dati Legali 🛡️
Informazioni fiscali e bancarie:
- **Dati Fiscali**
  - Codice Fiscale
  - Partita IVA
- **Dati Bancari**
  - IBAN
  - Nome Banca

### 4. Aspetto 🎨
Personalizzazione visiva:
- **Colore Primario**: Colore principale della società
- **Colore Secondario**: Colore di supporto
- **Anteprima Colori**: Visualizzazione in tempo reale

### 5. Social Media 🌐
Collegamenti ai profili social:
- Facebook
- Instagram
- Twitter/X
- YouTube

### 6. Strutture 🏟️
Gestione impianti sportivi:
- Lista strutture disponibili
- Aggiunta nuove strutture
- Modifica dettagli (indirizzo, capienza, tipo)

### 7. Maglie 👕
Gestione divise e merchandising:
- **Tipologie**: Prima maglia, seconda maglia, terza maglia, portiere
- **Dettagli**:
  - Colori e pattern
  - Produttore
  - Sponsor
  - Stagione di riferimento
- **E-commerce**:
  - Link shop online per atleti
  - Link merchandising
  - Prezzi
  - Taglie disponibili

### 8. Staff 👥
Gestione del personale:
- **Ruoli**: Allenatore, assistente, preparatore, fisioterapista, dirigente
- **Informazioni**:
  - Dati anagrafici
  - Contatti
  - Qualifiche
  - Date inizio/fine incarico
- **Compensi**:
  - Importo stipendio/compenso
  - Tipo contratto (full-time, part-time, volontario, consulente)
  - Frequenza pagamento (mensile, settimanale, oraria, per evento)

### 9. Sponsor 💰
Gestione partner commerciali:
- **Categorie**:
  - Main Sponsor
  - Technical Sponsor
  - Gold/Silver/Bronze Partner
- **Dettagli Contratto**:
  - Date inizio/fine
  - Importo annuale
  - Visibilità (maglia, sito, stadio, materiali, eventi)
- **Contatti Sponsor**:
  - Nome referente
  - Email e telefono

### 10. Documenti 📄
Archivio documentale:
- Caricamento documenti societari
- Categorizzazione per tipo
- Gestione scadenze

## Permessi e Accesso

### Super Admin
- ✅ Accesso completo a tutte le funzionalità
- ✅ Può cambiare società
- ✅ Modifica tutti i dati
- ✅ Gestisce tutte le organizzazioni

### Manager Multi-Società (Owner)
- ✅ Accesso alle società assegnate
- ✅ Può cambiare tra le sue società
- ✅ Modifica dati delle sue società
- ✅ Visualizza il pulsante "Cambia Società"

### Admin Società
- ✅ Accesso solo alla propria società
- ✅ Modifica dati della propria società
- ❌ Non vede "Cambia Società"
- ✅ Accesso completo all'anagrafica

### Altri Ruoli (Coach, Staff)
- ❌ Accesso limitato o nessun accesso
- ❌ Non possono modificare l'anagrafica
- ✅ Possono visualizzare alcuni dati base

## Navigazione Avanzata

### Flusso di Navigazione
```
Menu Impostazioni
    ↓
Anagrafica Società (dati completi)
    ↓                    ↑
Altri Dati ←→ Impostazioni Sistema
    ↓
Cambia Società (solo Super Admin/Owner)
```

### Collegamenti Rapidi
1. **Da Anagrafica → Altri Dati**: Accedi alle impostazioni di sistema
2. **Da Altri Dati → Anagrafica**: Torna con "Ritorna all'Anagrafica"
3. **Cambia Società**: Disponibile in entrambe le viste per utenti autorizzati

## Salvataggio e Validazione

### Salvataggio Automatico
- I dati vengono salvati quando clicchi "Salva Modifiche"
- Validazione in tempo reale dei campi
- Messaggi di conferma per operazioni completate

### Validazioni
- **Email**: Formato valido richiesto
- **Colori**: Formato esadecimale (#RRGGBB)
- **URL**: Formato valido per siti web e social
- **IBAN**: Validazione formato italiano

## Best Practices

1. **Completezza Dati**: Compila tutti i campi possibili per una gestione ottimale
2. **Logo Società**: Usa immagini quadrate, min 200x200px
3. **Colori**: Scegli colori che rappresentino l'identità della società
4. **Documenti**: Mantieni aggiornati i documenti legali
5. **Staff**: Aggiorna tempestivamente i cambiamenti di personale
6. **Sponsor**: Registra tutti i dettagli contrattuali

## Troubleshooting

### Errore 403 "Super admin access required"
- **Causa**: Permessi insufficienti per l'operazione
- **Soluzione**: Il sistema carica automaticamente i dati dal cache locale

### Il pulsante "Cambia Società" non appare
- **Verifica**: Sei un Admin normale (non Multi-Società)
- **Soluzione**: È normale, solo Owner e Super Admin vedono questo pulsante

### Modifiche non salvate
- **Verifica**: Hai cliccato "Salva Modifiche"?
- **Controlla**: Messaggi di errore nei campi
- **Soluzione**: Correggi eventuali errori di validazione

## Aggiornamenti Recenti

### Versione 2.0 (Gennaio 2025)
- ✨ Nuovo tab Sponsor con gestione completa contratti
- 💰 Aggiunto compensi e tipo contratto per Staff
- 🛍️ Link shop e merchandising per Maglie
- 🔄 Navigazione bidirezionale Anagrafica ↔ Altri Dati
- 👥 Supporto Manager Multi-Società
- 🎨 Interfaccia completamente ridisegnata
