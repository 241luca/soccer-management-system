# Fix: Organization ID Required per Super Admin e Login Super Admin

## Problema 1: Organization ID Required
Il Super Admin riceveva l'errore "Organization ID required" quando cercava di accedere agli endpoint API come `/teams`, `/athletes`, etc.

## Problema 2: Super Admin Login Failed
Il Super Admin non riusciva a fare login - errore 401 Unauthorized su `/auth/super-admin/login`.

## Causa
### Problema 1
Il Super Admin non ha un `organizationId` nel suo token JWT (per design, dato che può accedere a tutte le organizzazioni). Tuttavia, gli endpoint API richiedevano sempre un `organizationId`.

### Problema 2
Il metodo `loginSuperAdmin` cercava l'utente nella tabella `User` invece che nella tabella `SuperAdmin`.

## Soluzione
### Soluzione Problema 1
1. Creato un nuovo middleware `organizationContext.middleware.ts` che:
   - Controlla se l'utente ha già un `organizationId` dal JWT
   - Per i Super Admin, cerca l'header `X-Organization-ID`
   - Se non trova nessun ID, usa l'organizzazione Demo come default
   - Fornisce una funzione helper `getOrganizationId(req)` per ottenere l'ID

2. Aggiornato i file delle route per:
   - Usare il middleware `ensureOrganizationContext`
   - Sostituire tutti i controlli manuali con `getOrganizationId(req)`

### Soluzione Problema 2
1. Modificato `auth.service.ts` per usare `prisma.superAdmin` invece di `prisma.user`
2. Creato script SQL per inserire il Super Admin nella tabella corretta
3. Eseguito lo script per creare l'utente Super Admin

## File Modificati
- `/backend/src/middleware/organizationContext.middleware.ts` (nuovo)
- `/backend/src/routes/team.routes.ts` (aggiornato)
- `/backend/src/routes/athlete.routes.ts` (aggiornato)
- `/backend/src/routes/dashboard.routes.ts` (aggiornato)
- `/backend/src/services/auth.service.ts` (aggiornato per Super Admin)
- `/create-super-admin.sql` (nuovo script SQL)

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
