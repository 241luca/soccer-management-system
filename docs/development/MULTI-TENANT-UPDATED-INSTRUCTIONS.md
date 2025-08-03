# 🚀 ISTRUZIONI AGGIORNATE MULTI-TENANT

## ⚠️ PROBLEMA RILEVATO
Lo schema Prisma esistente ha già alcune tabelle multi-tenant ma con struttura diversa da quella progettata. Ho creato uno script di migrazione semplificato che funziona con lo schema esistente.

## ✅ COSA È STATO COMPLETATO
1. **File creati:**
   - `organization.service.ts` - Service per gestire organizzazioni
   - `organization.routes.ts` - Routes API organizzazioni
   - `super-admin.service.ts` - Service super admin
   - `super-admin.routes.ts` - Routes super admin
   - `migrate-to-multi-tenant-simplified.ts` - Script migrazione semplificato
   - File di supporto (asyncHandler, validation, types)

2. **File modificati:**
   - `server.ts` - Aggiunte nuove routes
   - `package.json` - Aggiunte dipendenze e comandi

## 📋 PROSSIMI PASSI IMMEDIATI

### 1. Installare dipendenze (2 min)
```bash
cd backend
npm install
npm install --save-dev @types/bcryptjs
```

### 2. Generare Prisma Client (1 min)
```bash
npm run prisma:generate
```

### 3. Eseguire migrazione semplificata (5 min)
```bash
npm run migrate:multi-tenant:simple
```

Questo creerà:
- 3 piani (Basic, Pro, Enterprise)
- Demo Organization (code: DEMO)
- Demo owner: demo@soccermanager.com / demo123456
- Super admin: superadmin@soccermanager.com / superadmin123456

### 4. Aggiornare auth.service.ts
Il service di autenticazione deve supportare il nuovo sistema. Aggiorni il metodo login per:
- Verificare se l'utente è SuperAdmin
- Caricare le organizzazioni dell'utente
- Includere organizationId nel token JWT

### 5. Aggiornare i Services esistenti
Pattern da seguire per ogni service:

```typescript
// athlete.service.ts già lo fa correttamente:
async findAll(organizationId: string, params) {
  const where: Prisma.AthleteWhereInput = { organizationId };
  // ...
}
```

Services da aggiornare:
- ✅ athlete.service.ts (già fatto)
- ❌ team.service.ts
- ❌ match.service.ts
- ❌ document.service.ts
- ❌ payment.service.ts
- ❌ notification.service.ts
- ❌ dashboard.service.ts

### 6. Aggiornare le Routes
Le routes devono usare il middleware multi-tenant. Il file athlete.routes.ts già usa `req.user!.organizationId`.

### 7. Testare con Postman

**Login Demo Owner:**
```
POST /api/v1/auth/login
{
  "email": "demo@soccermanager.com",
  "password": "demo123456"
}
```

**Verificare organizzazione corrente:**
```
GET /api/v1/organizations/current
Authorization: Bearer [token]
```

## 🔧 CORREZIONI DA FARE

### 1. Organization Service
Il service deve essere allineato con lo schema Prisma esistente:
- Usare `code` invece di `slug`
- Usare `Role` invece di `OrganizationRole`
- Adattare i campi alle tabelle esistenti

### 2. Middleware Multi-tenant
Verificare che il middleware `multiTenant.middleware.ts` sia compatibile con lo schema.

### 3. Auth Service
Aggiornare per gestire:
- Login utenti normali con selezione organizzazione
- Login super admin separato
- Token JWT con organizationId

## 📊 SCHEMA ESISTENTE

Le tabelle multi-tenant già presenti:
- `Organization` - con code, subdomain, plan (stringa)
- `Plan` - con name, price, maxUsers, maxAthletes
- `Role` - ruoli per organizzazione
- `UserOrganization` - relazione many-to-many
- `SuperAdmin` - utenti super admin separati
- `OrganizationInvitation` - inviti

## 🎯 OBIETTIVO FINALE

Sistema multi-tenant funzionante dove:
1. Ogni società ha i propri dati isolati
2. Gli utenti possono appartenere a più società
3. I super admin gestiscono tutto il sistema
4. Sistema di permessi basato su ruoli
5. Compatibilità con dati esistenti (migrati a Demo Org)

## 💡 SUGGERIMENTI

1. **Iniziare con lo script di migrazione semplificato** per creare i dati base
2. **Testare subito il login** per verificare che funzioni
3. **Aggiornare un service alla volta** e testarlo
4. **Non modificare lo schema Prisma** per ora, lavorare con quello esistente
5. **Mantenere la retrocompatibilità** con il sistema attuale

## 🐛 TROUBLESHOOTING

**Errore TypeScript sui tipi:**
```bash
npm run prisma:generate
# Riavviare VS Code
```

**Errore migrazione:**
- Verificare che il database sia attivo
- Controllare i log per dettagli
- Eseguire query manualmente se necessario

**Errore import moduli:**
- Verificare percorsi relativi
- Controllare che tutti i file esistano
- Compilare con `npm run build` per verificare

---

**NOTA**: Il sistema è già parzialmente predisposto per il multi-tenant. L'obiettivo è completare l'implementazione lavorando con lo schema esistente.
