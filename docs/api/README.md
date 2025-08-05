# 📡 API REST Documentation

## Overview

Il Soccer Management System espone API REST per tutte le funzionalità del sistema.

**Base URL**: `https://api.soccermanager.com/api/v1`  
**Formato**: JSON  
**Autenticazione**: Bearer Token JWT

## 🔐 Autenticazione

Tutte le API (eccetto login e registrazione) richiedono autenticazione tramite JWT token.

```http
Authorization: Bearer <token>
```

## 📋 Indice API

### Core
- [Authentication](authentication.md) - Login, registrazione, gestione sessioni
- [Organizations](organizations.md) - Gestione società (**AGGIORNATO**)
- [Users](users.md) - Gestione utenti e ruoli

### Anagrafica Società (**NUOVO**)
- [Sponsors](sponsors.md) - Gestione sponsor
- [Staff](staff.md) - Gestione personale
- [Team Kits](team-kits.md) - Gestione maglie
- [Organization Documents](documents.md) - Documenti societari

### Gestione Sportiva
- [Teams](teams.md) - Gestione squadre
- [Athletes](athletes.md) - Gestione atleti
- [Matches](matches.md) - Gestione partite
- [Training](training.md) - Gestione allenamenti

### Amministrazione
- [Payments](payments.md) - Gestione pagamenti
- [Documents](athlete-documents.md) - Documenti atleti
- [Transport](transport.md) - Gestione trasporti
- [Notifications](notifications.md) - Sistema notifiche

### Report e Analytics
- [Dashboard](dashboard.md) - Statistiche e report
- [Analytics](analytics.md) - Analisi avanzate

## 🔄 Convenzioni API

### Request Format

```json
{
  "field1": "value1",
  "field2": "value2"
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "code": "ERROR_CODE"
}
```

### Validation Error Response

```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "errors": {
    "fieldName": {
      "msg": "Error message",
      "path": "fieldName",
      "location": "body"
    }
  }
}
```

## 🎯 Status Codes

- `200 OK` - Richiesta completata con successo
- `201 Created` - Risorsa creata con successo
- `204 No Content` - Richiesta completata, nessun contenuto da ritornare
- `400 Bad Request` - Richiesta malformata
- `401 Unauthorized` - Autenticazione richiesta
- `403 Forbidden` - Accesso negato
- `404 Not Found` - Risorsa non trovata
- `422 Unprocessable Entity` - Errore di validazione
- `429 Too Many Requests` - Rate limit superato
- `500 Internal Server Error` - Errore del server

## 🔒 Headers Speciali

### Multi-tenant Headers

```http
X-Organization-ID: <organization-uuid>
```

### Super Admin Access

```http
X-Super-Admin: true
```

## 📊 Paginazione

Le API che ritornano liste supportano paginazione:

```http
GET /api/v1/resource?page=1&limit=20&sort=name&order=asc
```

Parametri:
- `page` - Numero pagina (default: 1)
- `limit` - Elementi per pagina (default: 20, max: 100)
- `sort` - Campo per ordinamento
- `order` - Direzione (asc/desc)

Response:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## 🔍 Filtri

Le API supportano filtri tramite query parameters:

```http
GET /api/v1/athletes?status=active&teamId=123&search=mario
```

## 🚦 Rate Limiting

- **Authenticated requests**: 1000/ora per utente
- **Unauthenticated requests**: 100/ora per IP
- **File uploads**: 10/ora per utente

Headers di risposta:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1628856000
```

## 🔄 Versioning

L'API usa versioning nell'URL. La versione corrente è `v1`.

```
https://api.soccermanager.com/api/v1/...
```

## 📝 Changelog

### v1.2.0 (Agosto 2025)
- Aggiunte API complete per Anagrafica Società
- Nuovo modulo Sponsor
- Enhanced Staff e Team Kits
- Sistema upload documenti

### v1.1.0 (Luglio 2025)
- Miglioramenti performance
- Nuovi filtri e ordinamenti

### v1.0.0 (Giugno 2025)
- Release iniziale

## 🧪 Testing

Ambiente di test disponibile:
- **Base URL**: `https://test-api.soccermanager.com/api/v1`
- **Credenziali test**: Vedi [Setup Guide](../development/setup.md)

## 💡 Best Practices

1. **Usa sempre HTTPS** in produzione
2. **Includi sempre il token** nelle richieste autenticate
3. **Gestisci gli errori** appropriatamente
4. **Rispetta i rate limits**
5. **Usa paginazione** per liste lunghe
6. **Cache le risposte** quando possibile
7. **Valida input** lato client prima di inviare

## 🆘 Supporto

Per problemi con le API:
1. Controlla la documentazione specifica dell'endpoint
2. Verifica i log di errore
3. Contatta il supporto tecnico

---

📌 **Nota**: Questa documentazione è aggiornata alla versione 1.2.0 delle API
