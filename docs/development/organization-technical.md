# Documentazione Tecnica - Sistema Gestione Organizzazioni

## Architettura

### Componenti Principali

#### OrganizationDetails.jsx
Componente principale per la gestione dell'anagrafica societaria.

**Props:**
- `organizationId`: ID dell'organizzazione da visualizzare
- `canEdit`: Boolean per abilitare/disabilitare modifica
- `onBack`: Callback per navigazione indietro

**Features:**
- 10 tab per organizzare i dati
- Validazione in tempo reale
- Upload immagini per logo
- Gestione errori 403 con fallback localStorage

#### SettingsView.jsx
Gestione impostazioni di sistema (ex "Altri Dati").

**Props:**
- `user`: Oggetto utente corrente
- `organization`: Organizzazione corrente
- `onNavigate`: Callback navigazione
- `isSystemSettings`: Boolean per cambiare UI

**Features:**
- 6 tab configurazioni sistema
- Toggle dinamico pulsante navigazione
- Gestione permessi basata su ruolo

#### OrganizationList.jsx
Lista organizzazioni per cambio società.

**Props:**
- `onNavigate`: Callback navigazione
- `onSelectOrganization`: Callback selezione (solo Super Admin/Owner)

**Features:**
- Grid responsive
- Filtri e ordinamento
- Pulsante "Torna all'Anagrafica"

## Database Schema

### Tabelle Principali

#### Organization
```prisma
model Organization {
  id                String   @id @default(uuid())
  name              String
  code              String   @unique
  logoUrl           String?
  fullName          String?
  
  // Contatti
  email             String?
  phone             String?
  website           String?
  
  // Indirizzo
  address           String?
  city              String?
  province          String?
  postalCode        String?
  
  // Dati Legali
  fiscalCode        String?
  vatNumber         String?
  iban              String?
  bankName          String?
  
  // Contatti Dirigenti
  presidentName     String?
  presidentEmail    String?
  presidentPhone    String?
  secretaryName     String?
  secretaryEmail    String?
  secretaryPhone    String?
  
  // Aspetto
  primaryColor      String?
  secondaryColor    String?
  
  // Social Media
  socialFacebook    String?
  socialInstagram   String?
  socialTwitter     String?
  socialYoutube     String?
  
  // Metadata
  foundedYear       Int?
  federationNumber  String?
  description       String?
  
  // Relations
  teams            Team[]
  venues           Venue[]
  teamKits         TeamKit[]
  staffMembers     StaffMember[]
  sponsors         Sponsor[]
  documents        OrganizationDocument[]
}
```

#### Sponsor (Nuovo)
```prisma
model Sponsor {
  id                String    @id @default(uuid())
  organizationId    String
  name              String
  logoUrl           String?
  website           String?
  contactName       String?
  contactEmail      String?
  contactPhone      String?
  sponsorType       String    // main, technical, gold, silver, bronze, partner
  contractStartDate DateTime? @db.Date
  contractEndDate   DateTime? @db.Date
  annualAmount      Decimal?  @db.Decimal(10, 2)
  description       String?   @db.Text
  visibility        String[]  // jersey, website, stadium, materials, events
  notes             String?   @db.Text
  isActive          Boolean   @default(true)
  
  organization      Organization @relation(fields: [organizationId], references: [id])
}
```

#### StaffMember (Aggiornato)
```prisma
model StaffMember {
  // ... campi esistenti ...
  
  // Nuovi campi compensi
  salary            Decimal?  @db.Decimal(10, 2)
  contractType      String?   // full-time, part-time, volunteer, consultant
  paymentFrequency  String?   // monthly, weekly, hourly, per-event
}
```

#### TeamKit (Aggiornato)
```prisma
model TeamKit {
  // ... campi esistenti ...
  
  // Nuovi campi e-commerce
  shopUrl          String?
  merchandiseUrl   String?
  price            Decimal? @db.Decimal(10, 2)
  availableSizes   String[]
}
```

## API Endpoints

### Organizations

#### GET /api/v1/organizations/:id/details
Ottiene tutti i dettagli di un'organizzazione.

**Headers:**
- `Authorization: Bearer {token}`
- `X-Organization-ID: {orgId}` (opzionale)
- `X-Super-Admin: true` (automatico per Super Admin)

**Response:**
```json
{
  "id": "uuid",
  "name": "Demo Club",
  "code": "DEMO",
  "logoUrl": "https://...",
  "fullName": "Demo Soccer Club ASD",
  // ... tutti i campi dell'organizzazione
}
```

#### PUT /api/v1/organizations/:id
Aggiorna i dati dell'organizzazione.

**Permessi:** Admin, Super Admin, Owner (per le proprie società)

### Sponsor (Da implementare)

#### GET /api/v1/organizations/:orgId/sponsors
Lista sponsor di un'organizzazione.

#### POST /api/v1/organizations/:orgId/sponsors
Crea nuovo sponsor.

#### PUT /api/v1/sponsors/:id
Aggiorna sponsor.

#### DELETE /api/v1/sponsors/:id
Elimina sponsor.

## Gestione Permessi

### Matrice Permessi

| Azione | Super Admin | Owner Multi | Admin | Coach |
|--------|------------|-------------|-------|-------|
| Visualizza Anagrafica | ✅ Tutte | ✅ Assegnate | ✅ Propria | ❌ |
| Modifica Anagrafica | ✅ Tutte | ✅ Assegnate | ✅ Propria | ❌ |
| Cambia Società | ✅ | ✅ | ❌ | ❌ |
| Gestisci Sponsor | ✅ | ✅ | ✅ | ❌ |
| Gestisci Staff | ✅ | ✅ | ✅ | ❌ |

### Implementazione Frontend

```javascript
// Check permessi per Cambia Società
const canChangeOrganization = 
  user?.role === 'SUPER_ADMIN' || 
  user?.role === 'Owner';

// Check permessi modifica
const canEdit = 
  user?.role === 'ADMIN' || 
  user?.role === 'SUPER_ADMIN' || 
  user?.role === 'Owner' ||
  user?.isSuperAdmin;
```

## Navigazione

### Stati di Navigazione

1. **settings** → OrganizationDetails (Anagrafica)
2. **system-settings** → SettingsView (Altri Dati)
3. **organizations** → OrganizationList (Cambio Società)
4. **organization-details** → OrganizationDetails (Dettaglio specifico)

### Event System

Utilizzo di CustomEvent per navigazione tra componenti:

```javascript
// Navigazione programmatica
const event = new CustomEvent('navigate', { 
  detail: { view: 'settings' } 
});
window.dispatchEvent(event);
```

## Gestione Errori

### Errore 403 per Admin/Super Admin

Quando l'API restituisce 403, il sistema:
1. Verifica se l'utente è Admin/Super Admin
2. Carica dati dal localStorage come fallback
3. Permette comunque la visualizzazione

```javascript
if ((error.message?.includes('403')) && 
    (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN')) {
  // Carica da localStorage
  const storedOrg = localStorage.getItem('organization');
  if (storedOrg) {
    const orgData = JSON.parse(storedOrg);
    setOrganization(orgData);
  }
}
```

## LocalStorage Schema

### user
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "Nome",
  "lastName": "Cognome",
  "role": "SUPER_ADMIN|Owner|Admin|Coach",
  "isSuperAdmin": true|false
}
```

### organization
```json
{
  "id": "uuid",
  "name": "Nome Società",
  "code": "CODICE",
  "logoUrl": "https://...",
  "fullName": "Nome Completo Società",
  // ... altri campi
}
```

## Best Practices Sviluppo

### 1. Validazione Form
```javascript
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validateColor = (color) => {
  return /^#[0-9A-F]{6}$/i.test(color);
};
```

### 2. Gestione Stati Loading
```javascript
const [loading, setLoading] = useState(false);
const [saving, setSaving] = useState(false);
const [error, setError] = useState(null);
```

### 3. Header API Personalizzati
```javascript
// In api.js
if (isSuperAdmin) {
  headers['X-Super-Admin'] = 'true';
}
```

## Testing

### Test Cases Critici

1. **Cambio Società**
   - Super Admin può vedere tutte
   - Owner vede solo le assegnate
   - Admin non vede il pulsante

2. **Modifica Anagrafica**
   - Validazione campi email
   - Upload logo
   - Salvataggio con conferma

3. **Navigazione**
   - Altri Dati ↔ Anagrafica
   - Pulsante dinamico
   - Ritorno con freccia

## Prossimi Sviluppi

### API Backend Necessarie
1. CRUD Sponsor completo
2. Endpoint Staff con compensi
3. API TeamKit per e-commerce
4. Upload documenti societari

### Frontend Enhancements
1. Drag & drop per upload
2. Calendario visual per sponsor
3. Dashboard economica staff
4. Preview logo in real-time

## Migration Guide

### Da v1.x a v2.0

1. **Database Migration**
```sql
-- Aggiungi campi Sponsor
ALTER TABLE "Organization" ADD COLUMN sponsors...

-- Aggiungi campi Staff
ALTER TABLE "StaffMember" 
  ADD COLUMN "salary" DECIMAL(10,2),
  ADD COLUMN "contractType" TEXT,
  ADD COLUMN "paymentFrequency" TEXT;

-- Aggiungi campi TeamKit
ALTER TABLE "TeamKit"
  ADD COLUMN "shopUrl" TEXT,
  ADD COLUMN "merchandiseUrl" TEXT,
  ADD COLUMN "price" DECIMAL(10,2);
```

2. **Update Permessi**
- Verificare ruoli Owner per multi-società
- Aggiornare logica canEdit

3. **Clear Cache**
- Pulire localStorage per nuova struttura
- Forzare reload assets
