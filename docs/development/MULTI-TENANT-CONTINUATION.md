# 🔄 ISTRUZIONI CONTINUAZIONE MULTI-TENANT

## 📋 STATO ATTUALE DEL PROGETTO

### ✅ Completato
1. **Frontend**: 100% completo con 11 moduli enterprise
2. **Backend Base**: 100% completo con tutti i 10 services
3. **Multi-Tenant - Fase 1**: Database schema aggiornato
4. **Multi-Tenant - Fase 2**: Parzialmente completato
   - ✅ Schema Prisma aggiornato con nuove tabelle
   - ✅ Middleware multi-tenant creato
   - ✅ Sistema permessi definito
   - ✅ Auth service aggiornato per multi-org
   - ⚠️ Organization service incompleto (file troncato)

### 🎯 OBIETTIVO
Trasformare il sistema in multi-tenant per supportare multiple società calcistiche con isolamento dati, gestione permessi e account separati.

## 📁 FILE CREATI/MODIFICATI

### Database
- ✅ `/backend/prisma/schema.prisma` - Aggiornato con tabelle multi-tenant
- ✅ `/backend/prisma/migrations/add_multi_tenant.sql` - Migration SQL

### Backend
- ✅ `/backend/src/middleware/multiTenant.middleware.ts` - Middleware completo
- ✅ `/backend/src/types/permissions.ts` - Sistema permessi completo  
- ✅ `/backend/src/services/auth.service.ts` - Aggiornato per multi-org
- ⚠️ `/backend/src/services/organization.service.ts` - INCOMPLETO (fermato a riga ~350)

## 🚀 PROSSIMI PASSI IMMEDIATI

### 1. Completare organization.service.ts
Il file è stato troncato. Deve essere completato con:
```typescript
// Continuare da inviteUser method...
async inviteUser(data: InviteUserInput) {
  // Check if user already exists in organization
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
    include: {
      userOrganizations: {
        where: { organizationId: data.organizationId }
      }
    }
  });

  if (existingUser && existingUser.userOrganizations.length > 0) {
    throw ConflictError('User already belongs to this organization');
  }

  // Generate invitation token
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invitation = await prisma.organizationInvitation.create({
    data: {
      ...data,
      token,
      expiresAt
    },
    include: {
      organization: true,
      role: true
    }
  });

  // TODO: Send invitation email
  logger.info(`Invitation sent to ${data.email} for organization ${invitation.organization.name}`);

  return invitation;
}

// Aggiungere altri metodi necessari...
```

### 2. Creare Routes Multi-tenant
Creare `/backend/src/routes/organization.routes.ts`:
```typescript
import { Router } from 'express';
import { multiTenantAuth, requirePermission, superAdminAuth } from '../middleware/multiTenant.middleware';
import { Permission } from '../types/permissions';
// ... implementare routes
```

### 3. Aggiornare Routes Esistenti
Modificare tutte le routes esistenti per usare il nuovo middleware:
- `athlete.routes.ts`
- `team.routes.ts`
- `match.routes.ts`
- etc.

Esempio:
```typescript
// Prima
router.get('/', auth, athleteController.findAll);

// Dopo
router.get('/', 
  extractOrganization,
  multiTenantAuth, 
  requirePermission(Permission.ATHLETE_VIEW),
  enforceOrganizationScope,
  athleteController.findAll
);
```

## 📊 PIANO COMPLETO (da docs/development/MULTI-TENANT-ANALYSIS.md)

### ✅ Fase 1: Database (COMPLETATA)
- Schema aggiornato
- Migration creata

### 🔄 Fase 2: Backend Core (IN CORSO)
- ✅ Middleware multi-tenant
- ✅ Sistema permessi
- ✅ Auth service update
- ⚠️ Organization service (da completare)
- ❌ Super admin service (da creare)
- ❌ Update tutti i services esistenti
- ❌ Update tutte le routes

### ❌ Fase 3: Frontend Base (2-3 giorni)
1. Organization selector component
2. Update useAuth hook
3. Route protection con permessi
4. Update useData hook per multi-org

### ❌ Fase 4: Admin Panel (3-4 giorni)
1. Super admin dashboard
2. Organization management UI
3. User & role management
4. Billing/plans UI

### ❌ Fase 5: Testing & Security (2-3 giorni)
1. Test isolamento dati
2. Test permessi
3. Performance testing
4. Security audit

## 🛠️ COMANDI PER RIPRENDERE

```bash
# 1. Applicare migration database
cd backend
npm run prisma:migrate dev --name add_multi_tenant

# 2. Generare Prisma Client
npm run prisma:generate

# 3. Verificare compilazione TypeScript
npm run build

# 4. Test con API
npm run dev
```

## ⚠️ ATTENZIONE CRITICA

1. **Isolamento Dati**: OGNI query deve filtrare per organizationId
2. **Backward Compatibility**: Mantenere compatibilità con dati esistenti
3. **Default Organization**: Creare org di demo per test
4. **Permessi**: Verificare ogni endpoint con i permessi corretti

## 📝 ESEMPIO IMPLEMENTAZIONE SERVICE

Quando aggiorni un service esistente:
```typescript
// Prima
async findAll() {
  return prisma.athlete.findMany();
}

// Dopo  
async findAll(organizationId: string, params?: any) {
  return prisma.athlete.findMany({
    where: {
      organizationId, // SEMPRE filtrare per org
      ...params
    }
  });
}
```

## 🔐 DECISIONI ARCHITETTURALI PRESE

1. **Database**: Single database con Row Level Security
2. **Routing**: Subdomain-based (demo.app.com, acme.app.com)
3. **Sessioni**: Token JWT con organizationId embedded
4. **Permessi**: Role-based con permessi granulari
5. **Piani**: Basic, Pro, Enterprise con limiti configurabili

## 📋 CHECKLIST COMPLETAMENTO

- [ ] Completare organization.service.ts
- [ ] Creare super-admin.service.ts
- [ ] Aggiornare tutti i 10 services con organizationId
- [ ] Aggiornare tutte le routes con nuovo middleware
- [ ] Creare migration script per dati esistenti
- [ ] Frontend: Organization selector
- [ ] Frontend: Update hooks (useAuth, useData)
- [ ] Frontend: Permission-based UI
- [ ] Testing completo isolamento
- [ ] Documentazione aggiornata
- [ ] Push su GitHub

## 🚨 PRIORITÀ IMMEDIATE

1. **Completare organization.service.ts** (30 min)
2. **Creare script migrazione dati** (1 ora)
3. **Update 1-2 services come esempio** (2 ore)
4. **Test con Postman** (1 ora)

---

**IMPORTANTE**: Il sistema deve rimanere retrocompatibile. Tutti i dati esistenti devono essere migrati a una "Demo Organization" di default.

**NOTA**: Luca ha già i dati GitHub nel prompt iniziale. Il progetto è su: https://github.com/241luca/soccer-management-system
