# 🚀 Istruzioni per Implementazione Backend - Anagrafica Società v2.0

## Contesto del Progetto

Questo è un sistema di gestione per società di calcio che ha bisogno dell'implementazione backend completa per il modulo Anagrafica Società. Il frontend è già completamente sviluppato e funzionante.

## Repository e Accesso

```
Repository: https://github.com/241luca/soccer-management-system
Directory principale: /Users/lucamambelli/Desktop/soccer-management-system
```

## Stato Attuale

### ✅ Già Completato (Frontend)
- Interfaccia completa con 10 tab per gestione anagrafica
- Gestione multi-società per Super Admin e Owner
- Sistema di navigazione bidirezionale
- Validazione lato client
- Gestione errori con fallback localStorage

### ❌ Da Implementare (Backend)
- API complete per tutti i tab dell'anagrafica
- Gestione Sponsor (CRUD completo)
- Gestione Staff con compensi
- Gestione Team Kits con e-commerce
- Upload documenti societari
- Validazioni server-side
- Middleware permessi

## Database Schema (Già Definito)

Il database PostgreSQL utilizza Prisma ORM. Lo schema è già definito in `/backend/prisma/schema.prisma`:

### Tabelle Principali
1. **Organization** - Dati societari completi
2. **Sponsor** - Partner commerciali (DA CREARE)
3. **StaffMember** - Personale con compensi (DA AGGIORNARE)
4. **TeamKit** - Maglie con e-commerce (DA AGGIORNARE)
5. **OrganizationDocument** - Documenti societari
6. **Venue** - Strutture sportive

## API Endpoints da Implementare

### 1. Organizations (Priorità Alta)

#### GET /api/v1/organizations/:id/details
- Ritorna TUTTI i campi dell'organizzazione
- Include conteggi relazioni (_count)
- Gestisce permessi Super Admin con header X-Super-Admin

#### PUT /api/v1/organizations/:id
- Aggiorna tutti i campi modificabili
- Validazione:
  - Email format
  - Colori hex (#RRGGBB)
  - IBAN italiano
  - URL validi
- Solo Admin/Super Admin/Owner possono modificare

### 2. Sponsors (Nuovo Modulo)

#### GET /api/v1/organizations/:orgId/sponsors
```javascript
// Response attesa
{
  sponsors: [...],
  summary: {
    total: 12,
    byType: { main: 1, technical: 1, gold: 3, ... },
    totalAnnualValue: 250000
  }
}
```

#### POST /api/v1/organizations/:orgId/sponsors
- Crea nuovo sponsor
- Campi richiesti: name, sponsorType
- Campi opzionali: tutti gli altri

#### PUT /api/v1/sponsors/:id
- Aggiorna sponsor esistente

#### DELETE /api/v1/sponsors/:id
- Soft delete (isActive = false)

### 3. Staff Enhanced

#### GET /api/v1/organizations/:orgId/staff
- Include nuovi campi: salary, contractType, paymentFrequency
- Opzione query param: ?includeInactive=true

#### PUT /api/v1/staff/:id
- Aggiorna inclusi nuovi campi compensi

### 4. Team Kits Enhanced

#### GET /api/v1/organizations/:orgId/kits
- Include: shopUrl, merchandiseUrl, price, availableSizes
- Filtri: ?season=2024/2025&kitType=home&teamId=xxx

#### PUT /api/v1/kits/:id
- Aggiorna inclusi campi e-commerce

### 5. Documents

#### POST /api/v1/organizations/:orgId/documents
- Upload file con multer
- Salva in /backend/uploads/documents/
- Genera filename univoco
- Estrai metadata (size, mimetype)

#### GET /api/v1/documents/:id/download
- Stream file al client
- Verifica permessi organizzazione

## Middleware e Sicurezza

### 1. Auth Middleware (già esistente)
```javascript
// In /backend/src/middleware/auth.js
// Verifica JWT e aggiunge req.user
```

### 2. Organization Context Middleware (da creare)
```javascript
// Nuovo file: /backend/src/middleware/organizationContext.js
export const requireOrganizationContext = (req, res, next) => {
  const orgId = req.headers['x-organization-id'] || 
                req.params.orgId || 
                req.user.organizationId;
  
  if (!orgId) {
    return res.status(400).json({ 
      error: 'Organization ID required' 
    });
  }
  
  req.organizationId = orgId;
  next();
};
```

### 3. Super Admin Check
```javascript
// Nuovo file: /backend/src/middleware/superAdmin.js
export const checkSuperAdmin = (req, res, next) => {
  req.isSuperAdmin = req.user.role === 'SUPER_ADMIN' || 
                     req.headers['x-super-admin'] === 'true';
  next();
};
```

### 4. Permission Middleware
```javascript
// Per Organizations
export const canModifyOrganization = async (req, res, next) => {
  const { organizationId } = req.params;
  const user = req.user;
  
  if (user.role === 'SUPER_ADMIN') return next();
  
  if (user.role === 'Owner') {
    // Verifica se ha accesso a questa org
    const hasAccess = await checkOwnerAccess(user.id, organizationId);
    if (hasAccess) return next();
  }
  
  if (user.role === 'Admin' && user.organizationId === organizationId) {
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Insufficient permissions' 
  });
};
```

## Validazioni Server-Side

### 1. Organization Validation
```javascript
// /backend/src/validators/organization.validator.js
import { body, validationResult } from 'express-validator';

export const validateOrganizationUpdate = [
  body('email').optional().isEmail(),
  body('primaryColor').optional().matches(/^#[0-9A-F]{6}$/i),
  body('secondaryColor').optional().matches(/^#[0-9A-F]{6}$/i),
  body('vatNumber').optional().matches(/^\d{11}$/),
  body('fiscalCode').optional().matches(/^[A-Z0-9]{16}$/),
  body('iban').optional().matches(/^IT\d{2}[A-Z]\d{22}$/),
  body('website').optional().isURL(),
  body('socialFacebook').optional().isURL(),
  // ... altri campi
];
```

### 2. Sponsor Validation
```javascript
export const validateSponsorCreate = [
  body('name').notEmpty().trim(),
  body('sponsorType').isIn(['main', 'technical', 'gold', 'silver', 'bronze', 'partner']),
  body('annualAmount').optional().isDecimal(),
  body('contractStartDate').optional().isISO8601(),
  body('contractEndDate').optional().isISO8601(),
  body('visibility').optional().isArray(),
  body('visibility.*').optional().isIn(['jersey', 'website', 'stadium', 'materials', 'events'])
];
```

## Struttura File Backend

```
backend/
├── src/
│   ├── routes/
│   │   ├── organizations.routes.js (da aggiornare)
│   │   ├── sponsors.routes.js (nuovo)
│   │   ├── staff.routes.js (da aggiornare)
│   │   └── teamKits.routes.js (da aggiornare)
│   ├── services/
│   │   ├── organization.service.js (da aggiornare)
│   │   ├── sponsor.service.js (nuovo)
│   │   └── document.service.js (nuovo)
│   ├── validators/
│   │   ├── organization.validator.js (nuovo)
│   │   └── sponsor.validator.js (nuovo)
│   └── middleware/
│       ├── organizationContext.js (nuovo)
│       └── permissions.js (da aggiornare)
└── uploads/
    └── documents/ (directory per file)
```

## Priorità Implementazione

### Fase 1 - Core APIs (Urgente)
1. ✅ GET /organizations/:id/details
2. ✅ PUT /organizations/:id
3. ✅ Middleware permessi e context

### Fase 2 - Sponsor Module
1. ✅ CRUD completo sponsor
2. ✅ Summary e statistiche
3. ✅ Validazioni

### Fase 3 - Enhanced Features
1. ✅ Staff con compensi
2. ✅ Team Kits e-commerce
3. ✅ Upload documenti

### Fase 4 - Testing & Polish
1. ✅ Error handling consistente
2. ✅ Logging dettagliato
3. ✅ Performance optimization

## Testing con Frontend

Il frontend si aspetta risposte in questo formato:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message",
  "message": "Detailed message",
  "code": "ERROR_CODE"
}
```

## Note Importanti

1. **Gestione Errori 403**: Il frontend ha un fallback su localStorage, ma è meglio gestire correttamente i permessi

2. **Header X-Super-Admin**: Il frontend lo invia automaticamente per Super Admin

3. **Multi-tenancy**: Tutte le query devono essere filtrate per organizationId

4. **Soft Delete**: Usare isActive invece di cancellare fisicamente

5. **Transazioni**: Usare transazioni Prisma per operazioni multiple

## Comandi Utili

```bash
# Test API con curl
curl -H "Authorization: Bearer $TOKEN" \
     -H "X-Organization-ID: 43c973a6-5e20-43af-a295-805f1d7c86b1" \
     http://localhost:3000/api/v1/organizations/43c973a6-5e20-43af-a295-805f1d7c86b1/details

# Genera migration Prisma
cd backend
npx prisma migrate dev --name add_sponsor_table

# Seed database
psql -U lucamambelli -d soccer_management -f seed-sponsors.sql
```

## Credenziali Test

- **Super Admin**: superadmin@soccermanager.com / superadmin123456
- **Owner Multi**: manager@soccermanager.com / manager2024!
- **Admin**: admin@demosoccerclub.com / admin123

## Deliverables Attesi

1. ✅ Tutte le API funzionanti con il frontend esistente
2. ✅ Validazioni complete server-side
3. ✅ Gestione permessi granulare
4. ✅ Error handling robusto
5. ✅ Documentazione API aggiornata
6. ✅ Migration database eseguite

---

**IMPORTANTE**: Il frontend è già completo e testato. Le API devono rispettare esattamente i formati di request/response documentati per garantire la compatibilità.
