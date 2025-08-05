# 👥 Staff API

API per la gestione del personale delle società calcistiche con gestione compensi.

## Endpoints

- [GET /organizations/:orgId/staff](#get-organizationsorgidstaff) - Lista staff
- [GET /staff/:id](#get-staffid) - Dettagli membro staff
- [POST /organizations/:orgId/staff](#post-organizationsorgidstaff) - Crea membro staff
- [PUT /staff/:id](#put-staffid) - Aggiorna membro staff
- [DELETE /staff/:id](#delete-staffid) - Disattiva membro staff

## GET /organizations/:orgId/staff

Ottiene la lista del personale dell'organizzazione.

### Request

```http
GET /api/v1/organizations/43c973a6-5e20-43af-a295-805f1d7c86b1/staff
Authorization: Bearer <token>
```

### Query Parameters

| Parametro | Tipo | Descrizione | Default |
|-----------|------|-------------|---------|
| includeInactive | boolean | Includi staff inattivo | false |

### Response

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "organizationId": "43c973a6-5e20-43af-a295-805f1d7c86b1",
    "teamId": "456e7890-e89b-12d3-a456-426614174001",
    "firstName": "Roberto",
    "lastName": "Mancini",
    "role": "head-coach",
    "email": "r.mancini@ravennacalcio.it",
    "phone": "+39 335 1234567",
    "photoUrl": "/uploads/staff/mancini.jpg",
    "qualifications": ["UEFA Pro", "Laurea Scienze Motorie"],
    "startDate": "2023-07-01",
    "endDate": null,
    "salary": 45000,
    "contractType": "full-time",
    "paymentFrequency": "monthly",
    "isActive": true,
    "team": {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "name": "Prima Squadra"
    },
    "createdAt": "2023-06-15T10:00:00Z",
    "updatedAt": "2024-01-10T15:30:00Z"
  },
  {
    "id": "234e5678-e89b-12d3-a456-426614174002",
    "firstName": "Marco",
    "lastName": "Rossi",
    "role": "assistant-coach",
    "teamId": "456e7890-e89b-12d3-a456-426614174001",
    "salary": 25000,
    "contractType": "full-time",
    "paymentFrequency": "monthly",
    "isActive": true,
    "team": {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "name": "Prima Squadra"
    }
  }
]
```

### Ruoli Staff

| Ruolo | Descrizione |
|-------|-------------|
| `head-coach` | Allenatore principale |
| `assistant-coach` | Vice allenatore |
| `goalkeeper-coach` | Allenatore portieri |
| `fitness-coach` | Preparatore atletico |
| `physio` | Fisioterapista |
| `doctor` | Medico |
| `manager` | Dirigente |
| `scout` | Osservatore |
| `analyst` | Match analyst |
| `kitman` | Magazziniere |

### Tipi Contratto

| Tipo | Descrizione |
|------|-------------|
| `full-time` | Tempo pieno |
| `part-time` | Part time |
| `volunteer` | Volontario |
| `consultant` | Consulente |

### Frequenza Pagamento

| Frequenza | Descrizione |
|-----------|-------------|
| `monthly` | Mensile |
| `weekly` | Settimanale |
| `hourly` | Orario |
| `per-event` | Per evento |

## GET /staff/:id

Ottiene i dettagli di un membro dello staff.

### Request

```http
GET /api/v1/staff/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
```

### Response

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "organizationId": "43c973a6-5e20-43af-a295-805f1d7c86b1",
  "teamId": "456e7890-e89b-12d3-a456-426614174001",
  "firstName": "Roberto",
  "lastName": "Mancini",
  "role": "head-coach",
  "email": "r.mancini@ravennacalcio.it",
  "phone": "+39 335 1234567",
  "photoUrl": "/uploads/staff/mancini.jpg",
  "qualifications": ["UEFA Pro", "Laurea Scienze Motorie"],
  "startDate": "2023-07-01",
  "endDate": null,
  "salary": 45000,
  "contractType": "full-time",
  "paymentFrequency": "monthly",
  "isActive": true,
  "team": {
    "id": "456e7890-e89b-12d3-a456-426614174001",
    "name": "Prima Squadra",
    "category": "PRIMA_SQUADRA",
    "season": "2024"
  },
  "organization": {
    "id": "43c973a6-5e20-43af-a295-805f1d7c86b1",
    "name": "ASD Ravenna Calcio"
  },
  "createdAt": "2023-06-15T10:00:00Z",
  "updatedAt": "2024-01-10T15:30:00Z"
}
```

## POST /organizations/:orgId/staff

Crea un nuovo membro dello staff.

### Request

```http
POST /api/v1/organizations/43c973a6-5e20-43af-a295-805f1d7c86b1/staff
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "firstName": "Luigi",
  "lastName": "Bianchi",
  "role": "fitness-coach",
  "teamId": "456e7890-e89b-12d3-a456-426614174001",
  "email": "l.bianchi@ravennacalcio.it",
  "phone": "+39 340 9876543",
  "qualifications": ["Laurea Scienze Motorie", "Master Preparazione Atletica"],
  "startDate": "2025-01-01",
  "salary": 30000,
  "contractType": "full-time",
  "paymentFrequency": "monthly"
}
```

### Campi Richiesti

- `firstName` - Nome
- `lastName` - Cognome  
- `role` - Ruolo (vedi tabella ruoli)

### Response

```json
{
  "success": true,
  "data": {
    "id": "345e6789-e89b-12d3-a456-426614174003",
    // Tutti i campi del membro staff creato
  }
}
```

## PUT /staff/:id

Aggiorna i dati di un membro dello staff.

### Request

```http
PUT /api/v1/staff/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "salary": 50000,
  "contractType": "full-time",
  "paymentFrequency": "monthly",
  "endDate": "2026-06-30",
  "qualifications": ["UEFA Pro", "Laurea Scienze Motorie", "Corso Mental Coach"]
}
```

### Validazioni

| Campo | Validazione | Note |
|-------|------------|------|
| salary | >= 0 | Può essere null per volontari |
| contractType | Enum valido | Vedi tabella tipi |
| paymentFrequency | Enum valido | Vedi tabella frequenze |
| email | Email valida | Opzionale |
| startDate | Data valida | Formato YYYY-MM-DD |
| endDate | Data valida, dopo startDate | Formato YYYY-MM-DD |

### Response

```json
{
  "success": true,
  "data": {
    // Membro staff aggiornato
  }
}
```

### Error Responses

#### 400 Validation Error
```json
{
  "error": "Validation Error",
  "message": "Salary cannot be negative"
}
```

#### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Cannot modify staff from another organization"
}
```

## DELETE /staff/:id

Disattiva un membro dello staff (soft delete).

### Request

```http
DELETE /api/v1/staff/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
```

### Response

```json
{
  "success": true,
  "message": "Staff member deactivated successfully"
}
```

## 💰 Gestione Compensi

### Calcolo Costi Staff

```javascript
// Calcolo costo annuale staff per team
const teamStaffCost = staff
  .filter(s => s.teamId === teamId && s.isActive)
  .reduce((total, member) => {
    if (!member.salary) return total;
    
    let annualCost = 0;
    switch (member.paymentFrequency) {
      case 'monthly':
        annualCost = member.salary * 12;
        break;
      case 'weekly':
        annualCost = member.salary * 52;
        break;
      case 'hourly':
        // Stima 1600 ore/anno
        annualCost = member.salary * 1600;
        break;
      case 'per-event':
        // Stima 40 eventi/anno
        annualCost = member.salary * 40;
        break;
    }
    return total + annualCost;
  }, 0);
```

### Report Compensi

```javascript
// Riepilogo compensi per tipo contratto
const salaryByContractType = staff
  .filter(s => s.isActive && s.salary)
  .reduce((acc, member) => {
    acc[member.contractType] = (acc[member.contractType] || 0) + member.salary;
    return acc;
  }, {});
```

## 📊 Analytics e Report

### Staff per Ruolo
```javascript
const staffByRole = staff.reduce((acc, member) => {
  acc[member.role] = (acc[member.role] || 0) + 1;
  return acc;
}, {});
```

### Contratti in Scadenza
```javascript
const expiringContracts = staff.filter(member => {
  if (!member.endDate || !member.isActive) return false;
  const daysToExpiry = Math.floor(
    (new Date(member.endDate) - new Date()) / (1000*60*60*24)
  );
  return daysToExpiry > 0 && daysToExpiry <= 90;
});
```

## 🔒 Permessi

- **Visualizzazione**: 
  - Tutti possono vedere lo staff della propria organizzazione
  - I compensi sono visibili solo ad Admin e Owner
- **Creazione/Modifica/Cancellazione**:
  - Admin dell'organizzazione
  - Owner dell'organizzazione
  - Super Admin

## 💡 Best Practices

1. **Qualifiche**: Mantieni aggiornate le qualifiche e certificazioni
2. **Date Contratto**: Imposta sempre start/end date per tracciare la storia
3. **Team Assignment**: Assegna sempre a un team specifico quando possibile
4. **Foto**: Carica foto professionali per migliorare la presentazione
5. **Compensi**: Registra sempre i compensi per analisi costi

## 🎯 Use Cases

### 1. Organigramma Tecnico
```javascript
// Mostra struttura tecnica per team
const technicalStaff = staff
  .filter(s => s.isActive && ['head-coach', 'assistant-coach', 'goalkeeper-coach', 'fitness-coach'].includes(s.role))
  .sort((a, b) => {
    const roleOrder = ['head-coach', 'assistant-coach', 'goalkeeper-coach', 'fitness-coach'];
    return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
  });
```

### 2. Budget Staff
```javascript
// Calcola budget necessario per stagione
const seasonBudget = staff
  .filter(s => s.isActive && s.salary)
  .reduce((total, member) => {
    // Calcola costo per 10 mesi (stagione)
    const monthlyCost = member.paymentFrequency === 'monthly' ? member.salary : 
                       member.salary * 4; // Approssimazione per altri tipi
    return total + (monthlyCost * 10);
  }, 0);
```

### 3. Gestione Volontari
```javascript
// Lista volontari attivi
const volunteers = staff.filter(s => 
  s.isActive && 
  (s.contractType === 'volunteer' || !s.salary)
);
```

## 📝 Note Implementazione

1. **Privacy**: I dati sensibili (stipendi) sono visibili solo agli autorizzati
2. **Soft Delete**: Lo staff non viene mai cancellato fisicamente
3. **Multi-team**: Un membro può essere associato a un solo team alla volta
4. **Storico**: Mantieni traccia di start/end date per storia contrattuale
5. **Decimal Fields**: Gli stipendi sono salvati come Decimal nel database
