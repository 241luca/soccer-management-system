# 💰 Sponsors API

API per la gestione completa degli sponsor delle società calcistiche.

## Endpoints

- [GET /organizations/:orgId/sponsors](#get-organizationsorgidsponsors) - Lista sponsor
- [POST /organizations/:orgId/sponsors](#post-organizationsorgidsponsors) - Crea sponsor
- [PUT /sponsors/:id](#put-sponsorsid) - Aggiorna sponsor
- [DELETE /sponsors/:id](#delete-sponsorsid) - Disattiva sponsor

## GET /organizations/:orgId/sponsors

Ottiene la lista degli sponsor di un'organizzazione con statistiche.

### Request

```http
GET /api/v1/organizations/43c973a6-5e20-43af-a295-805f1d7c86b1/sponsors
Authorization: Bearer <token>
```

### Query Parameters

| Parametro | Tipo | Descrizione | Esempio |
|-----------|------|-------------|---------|
| type | string | Filtra per tipo sponsor | `main`, `technical`, `gold` |
| active | boolean | Filtra per stato attivo | `true`, `false` |

### Response

```json
{
  "sponsors": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "organizationId": "43c973a6-5e20-43af-a295-805f1d7c86b1",
      "name": "Banca di Romagna",
      "logoUrl": "/uploads/sponsors/banca-romagna.png",
      "website": "https://www.bancadiromagna.it",
      "contactName": "Marco Rossi",
      "contactEmail": "m.rossi@bancadiromagna.it",
      "contactPhone": "+39 0544 123456",
      "sponsorType": "main",
      "contractStartDate": "2024-01-01",
      "contractEndDate": "2025-12-31",
      "annualAmount": 50000,
      "description": "Main sponsor maglia e stadio",
      "visibility": ["jersey", "stadium", "website"],
      "notes": "Rinnovo automatico salvo disdetta",
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "TechSport Italia",
      "sponsorType": "technical",
      "annualAmount": 30000,
      "visibility": ["jersey", "materials"],
      "isActive": true
      // Altri campi...
    }
  ],
  "summary": {
    "total": 12,
    "byType": {
      "main": 1,
      "technical": 1,
      "gold": 3,
      "silver": 4,
      "bronze": 2,
      "partner": 1
    },
    "totalAnnualValue": 185000
  }
}
```

### Tipi di Sponsor

| Tipo | Descrizione | Visibilità tipica |
|------|-------------|-------------------|
| `main` | Sponsor principale | Maglia, stadio, tutto |
| `technical` | Sponsor tecnico | Materiale sportivo |
| `gold` | Sponsor oro | Maglia, sito web |
| `silver` | Sponsor argento | Sito web, materiali |
| `bronze` | Sponsor bronzo | Sito web |
| `partner` | Partner commerciale | Eventi |

### Opzioni Visibilità

- `jersey` - Logo su maglie da gioco
- `website` - Presenza su sito web
- `stadium` - Cartellonistica stadio
- `materials` - Materiale sportivo e promozionale
- `events` - Eventi e manifestazioni

## POST /organizations/:orgId/sponsors

Crea un nuovo sponsor per l'organizzazione.

### Request

```http
POST /api/v1/organizations/43c973a6-5e20-43af-a295-805f1d7c86b1/sponsors
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "name": "Supermercati Conad",
  "sponsorType": "gold",
  "logoUrl": "/uploads/sponsors/conad.png",
  "website": "https://www.conad.it",
  "contactName": "Laura Verdi",
  "contactEmail": "l.verdi@conad.it",
  "contactPhone": "+39 051 987654",
  "contractStartDate": "2025-01-01",
  "contractEndDate": "2026-12-31",
  "annualAmount": 25000,
  "description": "Sponsor gold con visibilità maglia away",
  "visibility": ["jersey", "website", "events"],
  "notes": "Contratto biennale con opzione terzo anno"
}
```

### Campi Richiesti

- `name` - Nome dello sponsor
- `sponsorType` - Tipo di sponsor (vedi tabella sopra)

### Response

```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "organizationId": "43c973a6-5e20-43af-a295-805f1d7c86b1",
    "name": "Supermercati Conad",
    // Tutti i campi dello sponsor creato
  }
}
```

### Validazioni

| Campo | Validazione | Esempio |
|-------|------------|---------|
| name | Richiesto, non vuoto | "Sponsor SRL" |
| sponsorType | Enum valido | "main", "gold", etc. |
| annualAmount | Numero decimale >= 0 | 25000.50 |
| contractStartDate | Data ISO 8601 | "2025-01-01" |
| contractEndDate | Data ISO 8601, dopo start | "2025-12-31" |
| visibility | Array di enum validi | ["jersey", "website"] |
| website | URL valido | "https://example.com" |
| contactEmail | Email valida | "info@example.com" |
| contactPhone | Formato telefono | "+39 051 123456" |

## PUT /sponsors/:id

Aggiorna i dati di uno sponsor esistente.

### Request

```http
PUT /api/v1/sponsors/770e8400-e29b-41d4-a716-446655440002
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "annualAmount": 30000,
  "contractEndDate": "2027-12-31",
  "visibility": ["jersey", "website", "stadium", "events"],
  "notes": "Aumento contributo e visibilità per stagione 2025/26"
}
```

### Response

```json
{
  "success": true,
  "data": {
    // Sponsor aggiornato con tutti i campi
  }
}
```

### Error Responses

#### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Sponsor not found"
}
```

#### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Cannot modify sponsor from another organization"
}
```

#### 422 Validation Error
```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "errors": {
    "contractEndDate": {
      "msg": "Contract end date must be after start date",
      "path": "contractEndDate"
    }
  }
}
```

## DELETE /sponsors/:id

Disattiva uno sponsor (soft delete).

### Request

```http
DELETE /api/v1/sponsors/770e8400-e29b-41d4-a716-446655440002
Authorization: Bearer <token>
```

### Response

```json
{
  "success": true,
  "message": "Sponsor deactivated successfully"
}
```

### Note

- Lo sponsor non viene eliminato fisicamente
- Viene impostato `isActive = false`
- Può essere riattivato con PUT impostando `isActive = true`

## 📊 Statistiche e Report

Il campo `summary` nella lista sponsor fornisce:

- **total**: Numero totale di sponsor
- **byType**: Conteggio per tipo di sponsor
- **totalAnnualValue**: Somma degli importi annuali degli sponsor attivi

Esempio di utilizzo per dashboard:

```javascript
// Ottieni sponsor con statistiche
const response = await fetch('/api/v1/organizations/123/sponsors?active=true');
const { sponsors, summary } = await response.json();

console.log(`Totale sponsor attivi: ${summary.total}`);
console.log(`Valore annuale: €${summary.totalAnnualValue.toLocaleString()}`);
```

## 🔒 Permessi

- **Visualizzazione**: Tutti gli utenti dell'organizzazione
- **Creazione/Modifica/Cancellazione**: 
  - Admin dell'organizzazione
  - Owner dell'organizzazione
  - Super Admin

## 💡 Best Practices

1. **Upload Logo**: Carica prima il logo dello sponsor, poi crea il record
2. **Date Contratto**: Imposta sempre le date per monitorare scadenze
3. **Importi**: Usa sempre decimali con 2 cifre per gli importi
4. **Visibilità**: Definisci chiaramente dove apparirà lo sponsor
5. **Contatti**: Mantieni sempre aggiornati i contatti dello sponsor

## 🎯 Use Cases

### 1. Dashboard Sponsor
```javascript
// Mostra riepilogo sponsor con scadenze prossime
const today = new Date().toISOString().split('T')[0];
const nextMonth = new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0];

const expiring = sponsors.filter(s => 
  s.contractEndDate >= today && 
  s.contractEndDate <= nextMonth
);
```

### 2. Report Annuale
```javascript
// Calcola entrate per tipo sponsor
const revenueByType = sponsors.reduce((acc, sponsor) => {
  if (sponsor.isActive && sponsor.annualAmount) {
    acc[sponsor.sponsorType] = (acc[sponsor.sponsorType] || 0) + 
                               Number(sponsor.annualAmount);
  }
  return acc;
}, {});
```

### 3. Gestione Scadenze
```javascript
// Notifica per contratti in scadenza
const expiringContracts = sponsors.filter(s => {
  const daysToExpiry = Math.floor(
    (new Date(s.contractEndDate) - new Date()) / (1000*60*60*24)
  );
  return daysToExpiry > 0 && daysToExpiry <= 60;
});
```

## 📝 Note Implementazione

1. **Decimal Fields**: Gli importi sono salvati come Decimal nel DB
2. **Soft Delete**: Gli sponsor non vengono mai cancellati fisicamente
3. **Multi-tenancy**: Ogni sponsor appartiene a una sola organizzazione
4. **Audit Trail**: Tutte le modifiche vengono loggete
