# 🔌 REST API Reference

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
Tutte le richieste (eccetto login) richiedono un JWT token nell'header:
```
Authorization: Bearer <token>
```

## Multi-Tenant Context
Il sistema supporta multi-tenancy. L'organizzazione viene determinata in questo ordine:

1. **Subdomain**: `https://demo.soccermanager.com`
2. **Header**: `X-Organization-ID: <organization-id>`
3. **JWT Token**: Contiene l'organizationId dell'utente

## 🏢 Organization & Auth Endpoints

### Authentication
| Method | Endpoint | Descrizione | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | Login utente | No |
| POST | `/auth/register` | Registrazione | No |
| POST | `/auth/super-admin/login` | Login super admin | No |
| GET | `/auth/organizations` | Lista org utente | Yes |
| POST | `/auth/switch-organization` | Cambia org | Yes |
| POST | `/auth/refresh` | Refresh token | No |
| GET | `/auth/me` | Info utente | Yes |

### Organizations
| Method | Endpoint | Descrizione | Permessi |
|--------|----------|-------------|----------|
| GET | `/organizations/current` | Info org corrente | ORGANIZATION_VIEW |
| PATCH | `/organizations/current` | Aggiorna org | ORGANIZATION_UPDATE |
| GET | `/organizations/users` | Lista utenti | USER_VIEW |
| POST | `/organizations/invite` | Invita utente | USER_CREATE |
| DELETE | `/organizations/users/:id` | Rimuovi utente | USER_DELETE |
| GET | `/organizations/roles` | Lista ruoli | ROLE_VIEW |
| POST | `/organizations/roles` | Crea ruolo | ROLE_CREATE |
| GET | `/organizations/stats` | Statistiche | ORGANIZATION_VIEW |

## Endpoints

### 🔐 Authentication
| Method | Endpoint | Descrizione |
|--------|----------|-------------|
| POST | `/auth/login` | Login utente |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout utente |
| GET | `/auth/me` | Info utente corrente |

### 👥 Athletes
| Method | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/athletes` | Lista atleti |
| GET | `/athletes/:id` | Dettaglio atleta |
| POST | `/athletes` | Crea atleta |
| PUT | `/athletes/:id` | Aggiorna atleta |
| DELETE | `/athletes/:id` | Elimina atleta |

### 🏆 Teams
| Method | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/teams` | Lista squadre |
| GET | `/teams/:id` | Dettaglio squadra |
| POST | `/teams` | Crea squadra |
| PUT | `/teams/:id` | Aggiorna squadra |
| DELETE | `/teams/:id` | Elimina squadra |
| GET | `/teams/:id/athletes` | Atleti della squadra |

### ⚽ Matches
| Method | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/matches` | Lista partite |
| GET | `/matches/:id` | Dettaglio partita |
| POST | `/matches` | Crea partita |
| PUT | `/matches/:id` | Aggiorna partita |
| DELETE | `/matches/:id` | Elimina partita |
| PUT | `/matches/:id/roster` | Aggiorna convocazioni |
| PUT | `/matches/:id/stats` | Aggiorna statistiche |
| GET | `/matches/calendar` | Vista calendario |

### 🚌 Transport
| Method | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/transport/zones` | Lista zone |
| POST | `/transport/zones` | Crea zona |
| PUT | `/transport/zones/:id` | Aggiorna zona |
| DELETE | `/transport/zones/:id` | Elimina zona |
| GET | `/transport/buses` | Lista pulmini |
| POST | `/transport/buses` | Crea pulmino |
| PUT | `/transport/buses/:id` | Aggiorna pulmino |
| DELETE | `/transport/buses/:id` | Elimina pulmino |
| POST | `/transport/buses/:id/routes` | Crea percorso |
| POST | `/transport/athletes/assign` | Assegna trasporto |

### 📄 Documents
| Method | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/documents/athlete/:athleteId` | Documenti atleta |
| POST | `/documents/upload/:athleteId` | Upload documento |
| GET | `/documents/:id/download` | Download documento |
| DELETE | `/documents/:id` | Elimina documento |
| GET | `/documents/expiring` | Documenti in scadenza |

### 💰 Payments
| Method | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/payments` | Lista pagamenti |
| GET | `/payments/:id` | Dettaglio pagamento |
| POST | `/payments` | Crea pagamento |
| PUT | `/payments/:id` | Aggiorna pagamento |
| POST | `/payments/:id/record` | Registra pagamento |
| GET | `/payments/overdue` | Pagamenti scaduti |
| GET | `/payments/report` | Report economico |

### 📊 Dashboard
| Method | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Statistiche generali |
| GET | `/dashboard/activity` | Activity feed |
| GET | `/dashboard/kpi` | Key Performance Indicators |

### 🔔 Notifications
| Method | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/notifications` | Lista notifiche |
| PUT | `/notifications/:id/read` | Segna come letta |
| PUT | `/notifications/read-all` | Segna tutte come lette |
| DELETE | `/notifications/:id` | Elimina notifica |

### ⚙️ Admin
| Method | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/admin/settings` | Impostazioni sistema |
| PUT | `/admin/settings` | Aggiorna impostazioni |
| GET | `/admin/users` | Lista utenti |
| POST | `/admin/users` | Crea utente |
| PUT | `/admin/users/:id` | Aggiorna utente |
| DELETE | `/admin/users/:id` | Elimina utente |
| GET | `/admin/audit-logs` | Audit logs |
| POST | `/admin/backup` | Crea backup |
| GET | `/admin/health` | System health |

## Query Parameters

### Pagination
```
?limit=20&offset=0
```

### Filtering
```
?status=active&teamId=123
```

### Sorting
```
?sortBy=name&order=asc
```

### Search
```
?search=mario
```

## Response Format

### Success Response
```json
{
  "data": { ... },
  "meta": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

## Status Codes

| Code | Descrizione |
|------|-------------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## Rate Limiting

- 100 richieste per 15 minuti per IP
- Header di risposta:
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: 95
  - `X-RateLimit-Reset`: 1640995200

## Esempi

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Get Athletes
```bash
curl -X GET http://localhost:3000/api/v1/athletes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

### Create Team
```bash
curl -X POST http://localhost:3000/api/v1/teams \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pulcini 2015",
    "category": "PULCINI",
    "minAge": 8,
    "maxAge": 10,
    "season": "2024/2025"
  }'
```

## WebSocket Events

Connessione: `ws://localhost:3000`

### Eventi Client → Server
- `join` - Join organization room
- `leave` - Leave organization room

### Eventi Server → Client
- `notification:new` - Nuova notifica
- `athlete:updated` - Atleta aggiornato
- `match:updated` - Partita aggiornata
- `payment:recorded` - Pagamento registrato

---

Per esempi dettagliati di ogni endpoint, vedi i file specifici in questa directory.