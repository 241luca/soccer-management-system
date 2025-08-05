# 📊 Documentazione Database - Soccer Management System

## Panoramica
Il database utilizza PostgreSQL con Prisma ORM per la gestione dello schema e delle migrazioni.

## 🗄️ Struttura Database

### Tabelle Principali

#### 1. **Organization** - Organizzazioni/Società
- `id` (UUID): Identificativo univoco
- `name`: Nome breve società
- `code`: Codice identificativo (es. DEMO, RAVC)
- `fullName`: Nome completo
- Dati fiscali: `fiscalCode`, `vatNumber`, `iban`, `bankName`
- Contatti: `email`, `phone`, `website`
- Indirizzo: `address`, `city`, `province`, `postalCode`, `country`
- Social: `socialFacebook`, `socialInstagram`, `socialTwitter`, `socialYoutube`
- Personalizzazione: `logoUrl`, `primaryColor`, `secondaryColor`
- Piano: `plan`, `maxUsers`, `maxAthletes`, `maxTeams`
- Stato: `isActive`, `isTrial`, `trialEndsAt`

#### 2. **User** - Utenti del sistema
- `id` (UUID): Identificativo univoco
- `email`: Email di login (univoca)
- `passwordHash`: Password criptata
- `role`: Ruolo (ADMIN, COACH, STAFF, PARENT, ATHLETE)
- `firstName`, `lastName`: Nome e cognome
- `organizationId`: Organizzazione di appartenenza
- `isActive`: Stato attivo/inattivo
- `lastLogin`: Ultimo accesso
- `failedLoginAttempts`, `lockedUntil`: Sicurezza login

#### 3. **Team** - Squadre
- `id` (UUID): Identificativo univoco
- `organizationId`: Organizzazione di appartenenza
- `name`: Nome squadra (es. "Under 15")
- `category`: Categoria (es. "Giovanissimi")
- `season`: Stagione (es. "2024-2025")
- `minAge`, `maxAge`: Range età
- `budget`: Budget annuale
- `isActive`: Stato attivo/inattivo

#### 4. **Athlete** - Atleti
- `id` (UUID): Identificativo univoco
- `organizationId`: Organizzazione di appartenenza
- `teamId`: Squadra di appartenenza (opzionale)
- Dati anagrafici: `firstName`, `lastName`, `birthDate`, `fiscalCode`
- Contatti: `email`, `phone`, `address`, `city`, `province`, `postalCode`
- Coordinate GPS: `latitude`, `longitude`
- Sport: `jerseyNumber`, `positionId`, `status`
- Trasporto: `usesTransport`, `transportZoneId`
- Altri: `needsPromotion`, `notes`

#### 5. **Document** - Documenti
- `id` (UUID): Identificativo univoco
- `athleteId`: Atleta associato
- `documentTypeId`: Tipo documento
- `fileUrl`, `fileName`, `fileSize`, `mimeType`: Dati file
- `uploadDate`, `issueDate`, `expiryDate`: Date documento
- `status`: Stato (VALID, EXPIRING, EXPIRED, MISSING)
- `uploadedById`: Utente che ha caricato

#### 6. **Payment** - Pagamenti
- `id` (UUID): Identificativo univoco
- `organizationId`: Organizzazione
- `athleteId`: Atleta associato
- `paymentTypeId`: Tipo pagamento
- `amount`: Importo
- `dueDate`, `paidDate`: Date scadenza/pagamento
- `status`: Stato (PENDING, PAID, OVERDUE, CANCELLED)
- `paymentMethod`: Metodo pagamento
- `transactionId`: ID transazione
- `createdById`: Utente che ha creato

#### 7. **StaffMember** - Staff tecnico
- `id` (UUID): Identificativo univoco
- `organizationId`: Organizzazione
- `teamId`: Squadra assegnata (opzionale)
- Dati: `firstName`, `lastName`, `role`
- Contatti: `email`, `phone`
- Qualifiche: `qualifications[]`, `licenseNumber`, `licenseExpiry`
- Contratto: `startDate`, `endDate`, `salary`, `contractType`

#### 8. **Match** - Partite
- `id` (UUID): Identificativo univoco
- `organizationId`: Organizzazione
- `competitionId`: Competizione (opzionale)
- `homeTeamId`, `awayTeamId`: Squadre
- `venueId`: Campo di gioco
- `date`, `time`: Data e ora
- `status`: Stato (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, POSTPONED)
- `homeScore`, `awayScore`: Risultato
- `round`: Giornata/turno

#### 9. **Venue** - Campi da gioco
- `id` (INT): Identificativo numerico
- `organizationId`: Organizzazione
- `name`: Nome campo
- `address`, `city`, `province`, `postalCode`: Indirizzo
- `capacity`: Capienza
- `surfaceType`, `fieldType`: Tipo superficie
- `hasLighting`: Illuminazione
- `latitude`, `longitude`: Coordinate GPS

#### 10. **Sponsor** - Sponsor
- `id` (UUID): Identificativo univoco
- `organizationId`: Organizzazione
- `name`: Nome sponsor
- `sponsorType`: Tipo (main, secondary)
- `contactPerson`, `contactEmail`, `contactPhone`: Contatti
- `contractStartDate`, `contractEndDate`: Periodo contratto
- `annualAmount`, `amount`: Importi
- `visibility[]`: Visibilità sponsor

### Tabelle di Supporto

#### **DocumentType** - Tipi di documento
- Certificato medico, Carta identità, Privacy, Foto tessera, ecc.

#### **PaymentType** - Tipi di pagamento
- Quota iscrizione, Retta mensile/trimestrale, Kit gara, Trasporto, ecc.

#### **TransportZone** - Zone trasporto
- Zone geografiche con tariffe mensili

#### **Bus** - Pulmini
- Mezzi di trasporto con autisti e capacità

#### **Position** - Ruoli/Posizioni
- Portiere, Difensore, Centrocampista, Attaccante

#### **Notification** - Notifiche
- Sistema di notifiche per eventi (scadenze, pagamenti, ecc.)

## 📝 Script di Popolamento

### Script Principali
1. **05-add-missing-columns.sql** - Aggiunge colonne mancanti per allineamento frontend
2. **06-final-population.sql** - Popolamento completo con dati demo

### Ordine di Esecuzione per Database Vuoto
```bash
# 1. Setup iniziale database
cd backend && ./scripts/setup-database.sh

# 2. Migrazioni Prisma
cd backend && npx prisma migrate deploy

# 3. Aggiungi colonne mancanti
psql -U lucamambelli -d soccer_management -f 05-add-missing-columns.sql

# 4. Popola database
psql -U lucamambelli -d soccer_management -f 06-final-population.sql

# 5. Verifica popolamento
psql -U lucamambelli -d soccer_management -f verify-complete-population.sql
```

## 🔑 Dati Demo Inseriti

### Organizzazioni
1. **Demo Soccer Club** (DEMO)
   - 4 squadre (Under 15, 17, 19, Prima Squadra)
   - 20 atleti
   - Zone trasporto e bus
   - Admin: demo@soccermanager.com

2. **ASD Ravenna Calcio** (RAVC)
   - 5 squadre (Pulcini, Esordienti, Giovanissimi, Allievi, Juniores)
   - 25 atleti
   - Zone trasporto e bus
   - Admin: admin@asdravennacalcio.it

### Dati Completi Inseriti
- ✅ Tipi di documenti con scadenze
- ✅ Tipi di pagamento (iscrizioni, rette, kit)
- ✅ Documenti atleti (alcuni in scadenza per test notifiche)
- ✅ Pagamenti (alcuni pendenti, altri pagati)
- ✅ Staff tecnico con licenze
- ✅ Sponsor con contratti attivi
- ✅ Campi da gioco
- ✅ Partite programmate
- ✅ Notifiche di sistema

## 🔧 Manutenzione

### Backup Database
```bash
pg_dump -U lucamambelli soccer_management > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database
```bash
psql -U lucamambelli -d soccer_management < backup_file.sql
```

### Reset Completo
```bash
# Elimina e ricrea database
dropdb soccer_management
createdb soccer_management

# Riapplica tutto
cd backend && npx prisma migrate deploy
psql -U lucamambelli -d soccer_management -f 05-add-missing-columns.sql
psql -U lucamambelli -d soccer_management -f 06-final-population.sql
```

## 📊 Query Utili

### Conteggio generale
```sql
SELECT 
  (SELECT COUNT(*) FROM "Organization") as orgs,
  (SELECT COUNT(*) FROM "Team") as teams,
  (SELECT COUNT(*) FROM "Athlete") as athletes,
  (SELECT COUNT(*) FROM "User") as users,
  (SELECT COUNT(*) FROM "Document") as docs,
  (SELECT COUNT(*) FROM "Payment") as payments;
```

### Documenti in scadenza
```sql
SELECT a."firstName", a."lastName", d."expiryDate", dt.name
FROM "Document" d
JOIN "Athlete" a ON d."athleteId" = a.id
JOIN "DocumentType" dt ON d."documentTypeId" = dt.id
WHERE d."expiryDate" BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
ORDER BY d."expiryDate";
```

### Pagamenti pendenti
```sql
SELECT o.name, COUNT(*) as pending, SUM(p.amount) as total
FROM "Payment" p
JOIN "Athlete" a ON p."athleteId" = a.id
JOIN "Organization" o ON p."organizationId" = o.id
WHERE p.status = 'PENDING'
GROUP BY o.name;
```

## 🚨 Note Importanti

1. **Enum Types**: Il database usa enum PostgreSQL per status (AthleteStatus, PaymentStatus, DocumentStatus, MatchStatus)
2. **UUID**: La maggior parte degli ID sono UUID generati con `gen_random_uuid()`
3. **Campi NOT NULL**: Molti campi sono obbligatori, verificare sempre i constraint
4. **Relazioni**: Cascade delete su alcune relazioni (es. Document → Athlete)
5. **Timezone**: Tutti i timestamp sono salvati senza timezone

## 📚 Riferimenti

- Schema Prisma: `/backend/prisma/schema.prisma`
- Migrazioni: `/backend/prisma/migrations/`
- Script SQL: `/soccer-management-system/*.sql`
