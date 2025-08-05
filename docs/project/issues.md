# Issues da risolvere

## ✅ 1. Errore 401 - Insufficient permissions su update atleti [RISOLTO]

**Problema**: Quando un utente con ruolo Admin prova a modificare un atleta, riceve errore 401 "Insufficient permissions"

**Causa**: Il middleware di autorizzazione confrontava i ruoli in modo case-sensitive. Il frontend invia "Admin" ma il backend si aspettava "ADMIN".

**Soluzione implementata**: 
- Modificato `auth.middleware.ts` per normalizzare i ruoli in uppercase prima del confronto
- Ora sia "Admin" che "ADMIN" sono accettati

## ✅ 2. API Trasporti non implementate [RISOLTO]

**Problema**: Le API per zone e pulmini restituivano solo placeholder

**Soluzione implementata**:
- Implementato completamente `transport.routes.ts` con tutti gli endpoint:
  - GET/POST/PUT/DELETE /transport/zones
  - GET/POST/PUT/DELETE /transport/buses
  - POST /transport/athletes/assign
  - DELETE /transport/athletes/:id/transport
  - GET /transport/stats
- Utilizzato il servizio `transportService` già esistente
- Aggiunta validazione con Zod
- Autorizzazione corretta per Admin e Coach

## 2. API Documenti Atleti non implementate

**Endpoint mancanti**:
- GET /api/v1/athletes/:id/documents
- POST /api/v1/athletes/:id/documents
- DELETE /api/v1/athletes/:id/documents/:docId
- GET /api/v1/athletes/:id/documents/:docId/download

## 3. API Tipi Documento Personalizzati

**Endpoint mancanti**:
- GET /api/v1/organization/document-types
- POST /api/v1/organization/document-types
- DELETE /api/v1/organization/document-types/:id
