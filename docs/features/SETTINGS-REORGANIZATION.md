# Riorganizzazione Dati Società e Impostazioni

## Panoramica
Abbiamo riorganizzato la gestione dei dati societari per eliminare duplicazioni e creare una struttura più chiara e manutenibile.

## Struttura Precedente (PROBLEMI)
- **Duplicazione dati**: Informazioni società presenti sia in Settings che in OrganizationDetails
- **Dati hardcoded**: Informazioni statiche in SettingsView invece che dal database
- **Confusione**: Non chiaro dove modificare i dati societari
- **Mancanza di sincronizzazione**: Modifiche in un posto non si riflettevano nell'altro

## Nuova Struttura

### 1. Anagrafica Società (OrganizationDetails) ✅
**Percorso**: Impostazioni → Apri Anagrafica
**Scopo**: Fonte unica di verità per TUTTI i dati societari

#### Sezioni:
- **Informazioni Generali**
  - Logo e identità visiva
  - Nome breve e completo
  - Codice società
  - Descrizione
  - Indirizzo sede legale
  - Anno di fondazione

- **Contatti**
  - Telefono, email, sito web società
  - Dati presidente (nome, email, telefono)
  - Dati segretario (nome, email, telefono)

- **Dati Legali**
  - Codice fiscale
  - Partita IVA
  - IBAN e banca
  
- **Aspetto**
  - Colori primario e secondario
  - Anteprima colori
  
- **Social Media**
  - Link profili Facebook, Instagram, Twitter, YouTube

### 2. Impostazioni (SettingsView) ✅
**Percorso**: Menu → Impostazioni
**Scopo**: Solo configurazioni di sistema e preferenze utente

#### Sezioni:
- **Generale**
  - Lingua interfaccia
  - Tema (chiaro/scuro)
  - Vista predefinita
  - Opzioni visualizzazione

- **Notifiche**
  - Canali (email, push, SMS)
  - Tipi di notifica
  - Frequenza

- **Permessi**
  - Vista ospiti
  - Approvazione utenti
  - Backup automatico
  - Conservazione dati

- **Economiche**
  - Valuta
  - Quote standard
  - Promemoria pagamenti
  - Prefissi documenti

- **Categorie**
  - Stagione corrente
  - Categorie attive
  - Fasce d'età

- **Sistema**
  - Moduli attivi/disattivi
  - Funzionalità abilitate

## Vantaggi della Nuova Struttura

1. **Nessuna duplicazione**: Ogni dato ha un solo posto dove essere modificato
2. **Chiara separazione**: Dati società vs configurazioni sistema
3. **Fonte unica di verità**: Database come unica fonte per i dati
4. **Migliore UX**: Utenti sanno esattamente dove trovare/modificare ogni informazione
5. **Manutenibilità**: Codice più pulito e facile da mantenere

## Flusso Utente

### Per modificare dati società:
1. Vai a Impostazioni
2. Clicca "Apri Anagrafica"
3. Modifica i dati necessari
4. Salva

### Per modificare configurazioni:
1. Vai a Impostazioni
2. Seleziona la tab appropriata
3. Modifica le impostazioni
4. Salva

## Permessi

- **Demo User**: Può solo visualizzare anagrafica (read-only)
- **Admin**: Può modificare anagrafica della propria società
- **Super Admin**: Può modificare anagrafica di qualsiasi società

## Note Tecniche

- OrganizationDetails usa l'endpoint `/organizations/{id}/details`
- I dati vengono salvati in tempo reale senza refresh pagina
- Il localStorage viene aggiornato per riflettere i cambiamenti
- Feedback visivo con animazioni per successo/errore
