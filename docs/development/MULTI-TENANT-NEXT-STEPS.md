# 📋 ISTRUZIONI PER COMPLETARE MULTI-TENANT

## ✅ COSA È STATO FATTO (Session Corrente)

1. **Creato organization.service.ts** - Service completo per gestire organizzazioni
2. **Creato organization.routes.ts** - Routes per API organizzazioni  
3. **Creato super-admin.service.ts** - Service per super amministratori
4. **Creato super-admin.routes.ts** - Routes per super admin
5. **Creato script di migrazione** - Per migrare dati esistenti
6. **Aggiornato server.ts** - Incluse nuove routes
7. **Creati file di supporto**:
   - asyncHandler.ts
   - validation.middleware.ts
   - express.d.ts (tipi TypeScript)
8. **Aggiornato package.json** - Aggiunte dipendenze e comando migrazione

## 🚀 PROSSIMI PASSI DA ESEGUIRE

### 1. Installare Dipendenze (5 min)
```bash
cd backend
npm install
```

### 2. Eseguire Migration Database (10 min)
```bash
# Generare migration SQL
npm run prisma:migrate dev --name add_multi_tenant

# Se ci sono errori, applicare manualmente:
# Il file SQL è in: backend/prisma/migrations/add_multi_tenant.sql
```

### 3. Eseguire Script Migrazione Dati (5 min)
```bash
npm run migrate:multi-tenant
```

Questo creerà:
- 3 piani di abbonamento (Basic, Pro, Enterprise)
- Demo Organization
- Utente demo: demo@soccermanager.com / demo123456
- Super admin: superadmin@soccermanager.com / superadmin123456
- Migrerà tutti i dati esistenti alla Demo Organization

### 4. Aggiornare Tutti i Services (2-3 ore)

Per ogni service in `backend/src/services/`:
- ✅ athlete.service.ts (già fatto)
- ❌ team.service.ts
- ❌ match.service.ts
- ❌ document.service.ts
- ❌ payment.service.ts
- ❌ notification.service.ts
- ❌ transport.service.ts
- ❌ dashboard.service.ts

**Pattern da seguire:**
```typescript
// Prima
async findAll() {
  return prisma.entity.findMany();
}

// Dopo
async findAll(organizationId: string) {
  return prisma.entity.findMany({
    where: { organizationId }
  });
}
```

### 5. Aggiornare Tutte le Routes (1-2 ore)

Per ogni route in `backend/src/routes/`:
- ❌ athlete.routes.ts
- ❌ team.routes.ts
- ❌ match.routes.ts
- etc...

**Pattern da seguire:**
```typescript
// Importare i nuovi middleware
import { 
  extractOrganization, 
  multiTenantAuth, 
  requirePermission 
} from '../middleware/multiTenant.middleware';
import { Permission } from '../types/permissions';

// Prima
router.get('/', authenticate, async (req, res) => {

// Dopo
router.get('/', 
  extractOrganization,
  multiTenantAuth,
  requirePermission(Permission.ENTITY_VIEW),
  async (req, res) => {
```

### 6. Test con Postman (1 ora)

1. **Login come Super Admin**:
   ```
   POST /api/v1/auth/login
   {
     "email": "superadmin@soccermanager.com",
     "password": "superadmin123456"
   }
   ```

2. **Creare nuova organizzazione**:
   ```
   POST /api/v1/organizations/create
   {
     "name": "Test FC",
     "slug": "test-fc",
     "planId": "[ID del piano]",
     "ownerEmail": "owner@testfc.com",
     "ownerName": "Test Owner",
     "ownerPassword": "password123"
   }
   ```

3. **Login come Demo Owner**:
   ```
   POST /api/v1/auth/login
   {
     "email": "demo@soccermanager.com",
     "password": "demo123456"
   }
   ```

### 7. Frontend Updates (3-4 giorni)

1. **Organization Selector Component**
2. **Update useAuth Hook**
3. **Permission-based UI**
4. **Super Admin Dashboard**

## ⚠️ PROBLEMI COMUNI E SOLUZIONI

### Errore Migration Database
Se la migration fallisce:
1. Controllare che non ci siano connessioni attive: `npm run prisma:studio` e chiudere
2. Applicare manualmente il SQL dal file migration
3. Eseguire `npm run prisma:generate`

### Errore TypeScript
Se TypeScript non riconosce i nuovi tipi:
1. Riavviare VS Code
2. Eseguire `npm run build` per verificare
3. Controllare tsconfig.json include i file .d.ts

### Errore Import Moduli
Se i moduli non vengono trovati:
1. Verificare che tutti i file siano stati creati
2. Controllare i percorsi di import
3. Riavviare il server dev

## 📊 STATO FINALE ATTESO

Dopo aver completato tutti i passi:
- ✅ Sistema multi-tenant funzionante
- ✅ Isolamento completo dei dati tra organizzazioni
- ✅ Sistema di permessi granulare
- ✅ Super admin può gestire tutte le organizzazioni
- ✅ Ogni organizzazione ha i propri utenti, ruoli e dati
- ✅ Compatibilità con sistema esistente mantenuta

## 🔗 RISORSE

- Schema Prisma: `/backend/prisma/schema.prisma`
- Middleware: `/backend/src/middleware/multiTenant.middleware.ts`
- Permessi: `/backend/src/types/permissions.ts`
- Documentazione: `/docs/development/MULTI-TENANT-ANALYSIS.md`

## 💾 COMMIT E PUSH

Dopo aver completato e testato:
```bash
git add .
git commit -m "feat: implement multi-tenant architecture - phase 2 core services"
git push origin main
```

---

**NOTA**: Mantenere sempre la retrocompatibilità. Tutti i dati esistenti devono continuare a funzionare sotto la Demo Organization.
