# 🏢 Organizations API

API per la gestione completa delle organizzazioni (società calcistiche) con anagrafica dettagliata.

## Endpoints

- [GET /organizations](#get-organizations) - Lista organizzazioni (Super Admin)
- [GET /organizations/:id/details](#get-organizationsiddetails) - Dettagli completi organizzazione
- [PUT /organizations/:id](#put-organizationsid) - Aggiorna organizzazione
- [POST /organizations/create](#post-organizationscreate) - Crea nuova organizzazione (Super Admin)
- [GET /organizations/current](#get-organizationscurrent) - Organizzazione corrente
- [PATCH /organizations/current](#patch-organizationscurrent) - Aggiorna organizzazione corrente

## GET /organizations

Lista tutte le organizzazioni nel sistema.

**Autorizzazione**: Solo Super Admin

### Request

```http
GET /api/v1/organizations
Authorization: Bearer <token>
X-Super-Admin: true
```

### Response

```json
[
  {
    "id": "43c973a6-5e20-43af-a295-805f1d7c86b1",
    "name": "ASD Ravenna Calcio",
    "code": "RAVFC",
    "logoUrl": "/uploads/logos/ravenna.png",
    "plan": "pro",
    "isActive": true,
    "subdomain": "ravenna",
    "createdAt": "2024-01-15T10:00:00Z",
    "_count": {
      "users": 25,
      "athletes": 150,
      "teams": 8
    }
  }
]
```

## GET /organizations/:id/details

Ottiene tutti i dettagli di un'organizzazione inclusa l'anagrafica completa.

**Autorizzazione**: 
- Super Admin: accesso a tutte le organizzazioni
- Owner: accesso alle proprie organizzazioni
- Admin: accesso alla propria organizzazione

### Request

```http
GET /api/v1/organizations/43c973a6-5e20-43af-a295-805f1d7c86b1/details
Authorization: Bearer <token>
X-Organization-ID: 43c973a6-5e20-43af-a295-805f1d7c86b1
```

### Response

```json
{
  "id": "43c973a6-5e20-43af-a295-805f1d7c86b1",
  "name": "ASD Ravenna Calcio",
  "code": "RAVFC",
  "logoUrl": "/uploads/logos/ravenna.png",
  "settings": {},
  
  // Anagrafica completa
  "fullName": "Associazione Sportiva Dilettantistica Ravenna Calcio",
  "address": "Via dello Sport, 15",
  "city": "Ravenna",
  "province": "RA",
  "postalCode": "48121",
  "country": "IT",
  "phone": "+39 0544 123456",
  "email": "info@asdravennacalcio.it",
  "website": "https://www.asdravennacalcio.it",
  
  // Dati fiscali
  "fiscalCode": "92012340398",
  "vatNumber": "02134560399",
  "iban": "IT60X0542811101000000123456",
  "bankName": "Banca di Romagna",
  
  // Informazioni sportive
  "foundedYear": 1998,
  "federationNumber": "940123",
  
  // Colori sociali
  "primaryColor": "#FFD700",
  "secondaryColor": "#8B0000",
  
  // Dirigenza
  "presidentName": "Mario Rossi",
  "presidentEmail": "presidente@asdravennacalcio.it",
  "presidentPhone": "+39 335 1234567",
  "secretaryName": "Luigi Bianchi",
  "secretaryEmail": "segreteria@asdravennacalcio.it", 
  "secretaryPhone": "+39 339 7654321",
  
  // Social media
  "socialFacebook": "https://facebook.com/asdravennacalcio",
  "socialInstagram": "https://instagram.com/asdravennacalcio",
  "socialTwitter": "https://twitter.com/asdravennacalcio",
  "socialYoutube": "https://youtube.com/asdravennacalcio",
  
  // Descrizione
  "description": "Società calcistica dilettantistica con settore giovanile...",
  
  // Multi-tenant info
  "subdomain": "ravenna",
  "plan": "pro",
  "maxUsers": 50,
  "maxAthletes": 500,
  "maxTeams": 20,
  "isActive": true,
  "isTrial": false,
  "billingEmail": "amministrazione@asdravennacalcio.it",
  
  // Conteggi relazioni
  "_count": {
    "teams": 8,
    "users": 25,
    "athletes": 150,
    "venues": 3,
    "sponsors": 12,
    "staffMembers": 35
  },
  
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2025-08-05T14:30:00Z"
}
```

### Error Responses

#### 403 Forbidden - No Access
```json
{
  "error": "Forbidden",
  "message": "No access to this organization",
  "code": "NO_ORG_ACCESS"
}
```

#### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Organization not found",
  "code": "ORG_NOT_FOUND"
}
```

## PUT /organizations/:id

Aggiorna i dati di un'organizzazione.

**Autorizzazione**:
- Super Admin: può modificare qualsiasi organizzazione
- Owner: può modificare le proprie organizzazioni
- Admin: può modificare la propria organizzazione

### Request

```http
PUT /api/v1/organizations/43c973a6-5e20-43af-a295-805f1d7c86b1
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "name": "ASD Ravenna Calcio 1913",
  "fullName": "Associazione Sportiva Dilettantistica Ravenna Calcio 1913",
  "email": "info@ravennacalcio.it",
  "phone": "+39 0544 654321",
  "website": "https://www.ravennacalcio.it",
  
  "address": "Via dello Sport, 20",
  "city": "Ravenna", 
  "postalCode": "48121",
  
  "primaryColor": "#FFD700",
  "secondaryColor": "#000080",
  
  "presidentName": "Giuseppe Verdi",
  "presidentEmail": "g.verdi@ravennacalcio.it",
  
  "socialFacebook": "https://facebook.com/ravennacalcio1913",
  "socialInstagram": "https://instagram.com/ravennacalcio1913"
}
```

### Validazioni

| Campo | Validazione | Esempio |
|-------|------------|---------|
| email | Email valida | info@example.com |
| phone | Formato telefono | +39 0544 123456 |
| website | URL valido con protocollo | https://example.com |
| primaryColor | Hex color (#RRGGBB) | #FF0000 |
| secondaryColor | Hex color (#RRGGBB) | #0000FF |
| fiscalCode | 16 caratteri alfanumerici | RSSMRA80A01H199K |
| vatNumber | 11 cifre | 12345678901 |
| iban | IBAN italiano (IT + 25 char) | IT60X0542811101000000123456 |
| postalCode | 5 cifre | 48121 |
| province | 2 lettere | RA |
| foundedYear | Anno tra 1800 e corrente | 1998 |

### Response

```json
{
  "success": true,
  "data": {
    // Organizzazione aggiornata con tutti i campi
  }
}
```

### Error Responses

#### 422 Validation Error
```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "errors": {
    "email": {
      "msg": "Invalid email format",
      "path": "email",
      "location": "body"
    },
    "primaryColor": {
      "msg": "Primary color must be valid hex format (#RRGGBB)",
      "path": "primaryColor",
      "location": "body"
    }
  }
}
```

#### 400 Duplicate Entry
```json
{
  "error": "Duplicate Entry",
  "message": "Organization code already exists"
}
```

## POST /organizations/create

Crea una nuova organizzazione con owner.

**Autorizzazione**: Solo Super Admin

### Request

```http
POST /api/v1/organizations/create
Authorization: Bearer <token>
X-Super-Admin: true
Content-Type: application/json
```

```json
{
  "name": "ASD Nuova Squadra",
  "code": "NSQFC",
  "subdomain": "nuovasquadra",
  "plan": "basic",
  "ownerEmail": "owner@nuovasquadra.it",
  "ownerFirstName": "Paolo",
  "ownerLastName": "Bianchi",
  "ownerPassword": "SecurePass123!"
}
```

### Response

```json
{
  "organization": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "ASD Nuova Squadra",
    "code": "NSQFC",
    "subdomain": "nuovasquadra",
    // Altri campi...
  },
  "owner": {
    "id": "987e6543-e21b-12d3-a456-426614174000",
    "email": "owner@nuovasquadra.it",
    "firstName": "Paolo",
    "lastName": "Bianchi"
  },
  "roles": {
    "owner": { "id": "...", "name": "Owner" },
    "admin": { "id": "...", "name": "Admin" },
    "coach": { "id": "...", "name": "Coach" },
    "staff": { "id": "...", "name": "Staff" }
  }
}
```

## GET /organizations/current

Ottiene l'organizzazione corrente dell'utente.

### Request

```http
GET /api/v1/organizations/current
Authorization: Bearer <token>
X-Organization-ID: 43c973a6-5e20-43af-a295-805f1d7c86b1
```

### Response

Come [GET /organizations/:id/details](#get-organizationsiddetails)

## PATCH /organizations/current

Aggiorna l'organizzazione corrente (aggiornamento parziale).

**Autorizzazione**: Richiede permesso `ORGANIZATION_UPDATE`

### Request

```http
PATCH /api/v1/organizations/current
Authorization: Bearer <token>
X-Organization-ID: 43c973a6-5e20-43af-a295-805f1d7c86b1
Content-Type: application/json
```

```json
{
  "phone": "+39 0544 999888",
  "email": "nuova@email.com"
}
```

### Response

Come PUT /organizations/:id

## 📝 Note Implementazione

1. **Multi-tenancy**: Tutti gli endpoint filtrano automaticamente per organizationId
2. **Soft Delete**: Le organizzazioni non vengono mai cancellate fisicamente, solo disattivate
3. **Validazioni**: Tutti i campi sono validati server-side prima del salvataggio
4. **Permessi**: Il sistema verifica sempre i permessi dell'utente prima di ogni operazione
5. **Audit**: Tutte le modifiche vengono registrate nel log di audit

## 🔐 Sicurezza

- Le password owner sono hashate con bcrypt (10 rounds)
- I dati sensibili (IBAN, codice fiscale) sono visibili solo agli autorizzati
- L'header X-Super-Admin viene verificato insieme al ruolo utente
- Le organizzazioni inattive non sono accessibili dagli utenti normali

## 🎯 Best Practices

1. **Aggiornamenti parziali**: Invia solo i campi da modificare
2. **Validazione client**: Valida i dati prima di inviarli per migliorare UX
3. **Gestione errori**: Gestisci sempre errori 403 per multi-org
4. **Cache**: I dati dell'organizzazione cambiano raramente, considera il caching
