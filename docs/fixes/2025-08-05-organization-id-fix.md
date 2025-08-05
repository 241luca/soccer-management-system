# Fix: Organization ID Required per Super Admin

## Problema
Il Super Admin riceveva l'errore "Organization ID required" quando cercava di accedere agli endpoint API come `/teams`, `/athletes`, etc.

## Causa
Il Super Admin non ha un `organizationId` nel suo token JWT (per design, dato che può accedere a tutte le organizzazioni). Tuttavia, gli endpoint API richiedevano sempre un `organizationId`.

## Soluzione
1. Creato un nuovo middleware `organizationContext.middleware.ts` che:
   - Controlla se l'utente ha già un `organizationId` dal JWT
   - Per i Super Admin, cerca l'header `X-Organization-ID`
   - Se non trova nessun ID, usa l'organizzazione Demo come default
   - Fornisce una funzione helper `getOrganizationId(req)` per ottenere l'ID

2. Aggiornato `team.routes.ts` per:
   - Usare il middleware `ensureOrganizationContext`
   - Sostituire tutti i controlli manuali con `getOrganizationId(req)`

## File Modificati
- `/backend/src/middleware/organizationContext.middleware.ts` (nuovo)
- `/backend/src/routes/team.routes.ts` (aggiornato)

## Prossimi Passi
Gli stessi aggiornamenti devono essere applicati a:
- `/backend/src/routes/athlete.routes.ts`
- `/backend/src/routes/document.routes.ts`
- `/backend/src/routes/payment.routes.ts`
- `/backend/src/routes/match.routes.ts`
- `/backend/src/routes/transport.routes.ts`
- `/backend/src/routes/dashboard.routes.ts`

## Note
Il frontend già invia correttamente l'header `X-Organization-ID` per il Super Admin (vedi `/src/services/api.js` linea 72).
