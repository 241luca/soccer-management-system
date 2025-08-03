# 🏢 Multi-Tenant Architecture Analysis

## 📊 Analisi Approfondita Multi-Società

### 1. 🎯 Obiettivi
- **Isolamento dati**: Ogni società vede solo i propri dati
- **Gestione centralizzata**: Super-admin può gestire tutte le società
- **Scalabilità**: Supportare N società senza degrado performance
- **Sicurezza**: Prevenire accessi non autorizzati tra società
- **Flessibilità**: Ogni società può avere configurazioni diverse

### 2. 🏗️ Architettura Attuale

#### Database Schema
Attualmente abbiamo già il campo `organizationId` in quasi tutte le tabelle:
- ✅ Athletes, Teams, Matches, etc. hanno `organizationId`
- ✅ La tabella `Organization` esiste già
- ⚠️ Manca gestione multi-tenant a livello applicativo
- ⚠️ Manca sistema di permessi granulare

### 3. 🔄 Modifiche Necessarie

#### A. Database Schema Updates

```sql
-- 1. Tabella Organizations (già esistente, da estendere)
ALTER TABLE Organization ADD COLUMN IF NOT EXISTS
  subdomain VARCHAR(50) UNIQUE,
  plan VARCHAR(20) DEFAULT 'basic',
  maxUsers INTEGER DEFAULT 10,
  maxAthletes INTEGER DEFAULT 100,
  isActive BOOLEAN DEFAULT true,
  trialEndsAt TIMESTAMP,
  billingEmail VARCHAR(255),
  customDomain VARCHAR(255);

-- 2. Nuova tabella per i piani
CREATE TABLE Plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  maxUsers INTEGER NOT NULL,
  maxAthletes INTEGER NOT NULL,
  maxTeams INTEGER NOT NULL,
  features JSONB NOT NULL,
  isActive BOOLEAN DEFAULT true
);

-- 3. Nuova tabella per gestione ruoli granulari
CREATE TABLE Roles (
  id SERIAL PRIMARY KEY,
  organizationId UUID NOT NULL,
  name VARCHAR(50) NOT NULL,
  permissions JSONB NOT NULL,
  isSystem BOOLEAN DEFAULT false,
  FOREIGN KEY (organizationId) REFERENCES Organization(id),
  UNIQUE(organizationId, name)
);

-- 4. Tabella User-Organization-Role (relazione many-to-many)
CREATE TABLE UserOrganizationRole (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID NOT NULL,
  organizationId UUID NOT NULL,
  roleId INTEGER NOT NULL,
  isDefault BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id),
  FOREIGN KEY (organizationId) REFERENCES Organization(id),
  FOREIGN KEY (roleId) REFERENCES Roles(id),
  UNIQUE(userId, organizationId, roleId)
);

-- 5. Super Admin table
CREATE TABLE SuperAdmins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  isActive BOOLEAN DEFAULT true,
  lastLogin TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Organization invitations
CREATE TABLE OrganizationInvitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizationId UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  roleId INTEGER NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  acceptedAt TIMESTAMP,
  invitedById UUID NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizationId) REFERENCES Organization(id),
  FOREIGN KEY (roleId) REFERENCES Roles(id),
  FOREIGN KEY (invitedById) REFERENCES User(id)
);
```

#### B. Modifiche Backend

##### 1. Middleware Multi-Tenant
```typescript
// middleware/multiTenant.middleware.ts
export const multiTenantMiddleware = async (req, res, next) => {
  const { organizationId } = req.user;
  
  // Inject organizationId in all queries
  req.organizationId = organizationId;
  
  // Set Prisma client context
  req.prisma = prismaClientWithOrganization(organizationId);
  
  next();
};
```

##### 2. Sistema Permessi
```typescript
// types/permissions.ts
export enum Permission {
  // Athletes
  ATHLETE_VIEW = 'athlete.view',
  ATHLETE_CREATE = 'athlete.create',
  ATHLETE_UPDATE = 'athlete.update',
  ATHLETE_DELETE = 'athlete.delete',
  
  // Teams
  TEAM_VIEW = 'team.view',
  TEAM_CREATE = 'team.create',
  TEAM_UPDATE = 'team.update',
  TEAM_DELETE = 'team.delete',
  
  // Matches
  MATCH_VIEW = 'match.view',
  MATCH_CREATE = 'match.create',
  MATCH_UPDATE = 'match.update',
  MATCH_DELETE = 'match.delete',
  
  // Payments
  PAYMENT_VIEW = 'payment.view',
  PAYMENT_CREATE = 'payment.create',
  PAYMENT_UPDATE = 'payment.update',
  
  // Admin
  USER_MANAGE = 'user.manage',
  ROLE_MANAGE = 'role.manage',
  SETTINGS_MANAGE = 'settings.manage',
  
  // Reports
  REPORT_VIEW = 'report.view',
  REPORT_EXPORT = 'report.export'
}
```

##### 3. Auth Service Update
```typescript
// services/auth.service.ts
class AuthService {
  async login(email: string, password: string, organizationId?: string) {
    // Se organizationId non specificato, cerca l'org di default dell'utente
    // Supporta utenti in multiple organizzazioni
  }
  
  async switchOrganization(userId: string, organizationId: string) {
    // Cambia contesto organizzazione
  }
  
  async getUserOrganizations(userId: string) {
    // Lista tutte le org dell'utente
  }
}
```

#### C. Modifiche Frontend

##### 1. Organization Selector
```jsx
// components/OrganizationSelector.jsx
const OrganizationSelector = () => {
  const { user, currentOrganization, switchOrganization } = useAuth();
  const organizations = user.organizations;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {currentOrganization.name}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {organizations.map(org => (
          <DropdownMenuItem 
            key={org.id}
            onClick={() => switchOrganization(org.id)}
          >
            {org.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Plus className="mr-2 h-4 w-4" />
          Crea nuova società
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
```

##### 2. Route Protection
```jsx
// components/ProtectedRoute.jsx
const ProtectedRoute = ({ children, permission }) => {
  const { hasPermission } = useAuth();
  
  if (!hasPermission(permission)) {
    return <AccessDenied />;
  }
  
  return children;
};
```

### 4. 🔐 Sicurezza

#### Livelli di Isolamento
1. **Database Level**: Row Level Security (RLS)
2. **API Level**: Middleware validation
3. **Frontend Level**: UI conditionals
4. **Network Level**: Subdomain isolation (opzionale)

#### Best Practices
- ✅ Sempre validare organizationId nel backend
- ✅ Mai fidarsi del frontend per la sicurezza
- ✅ Audit log per tutte le operazioni critiche
- ✅ Rate limiting per organizzazione
- ✅ Encryption at rest per dati sensibili

### 5. 📋 Piano di Implementazione

#### Fase 1: Database (2-3 giorni)
1. Backup completo database
2. Creazione nuove tabelle
3. Migration dati esistenti
4. Test integrità dati

#### Fase 2: Backend Core (3-4 giorni)
1. Middleware multi-tenant
2. Sistema permessi
3. Auth service update
4. API endpoints per gestione org

#### Fase 3: Frontend Base (2-3 giorni)
1. Organization selector
2. Context provider update
3. Route protection
4. Permission checks UI

#### Fase 4: Admin Panel (3-4 giorni)
1. Super admin dashboard
2. Organization management
3. User management
4. Billing integration (base)

#### Fase 5: Testing & Security (2-3 giorni)
1. Test isolamento dati
2. Penetration testing base
3. Performance testing
4. Documentation update

### 6. 🎯 Priorità Immediate

1. **Decisioni Architetturali**:
   - Single database vs Database per tenant?
   - Subdomain vs Path-based routing?
   - Sessioni condivise vs isolate?

2. **Scelte Tecniche**:
   - Redis per caching per-tenant?
   - CDN per assets per-tenant?
   - Background jobs isolation?

3. **Business Model**:
   - Piani e prezzi?
   - Limiti per piano?
   - Trial period?

### 7. 🚀 Vantaggi

- **Scalabilità**: Supporta crescita
- **Revenue**: Multi-società = multi-revenue
- **Isolamento**: Sicurezza dati garantita
- **Flessibilità**: Configurazioni per-società
- **Demo**: Società demo sempre disponibile

### 8. ⚠️ Rischi e Mitigazioni

| Rischio | Impatto | Mitigazione |
|---------|---------|-------------|
| Data leak tra tenant | Alto | RLS + Testing approfondito |
| Performance degradation | Medio | Indicizzazione + Caching |
| Complessità gestione | Medio | Admin panel intuitivo |
| Costi infrastruttura | Basso | Ottimizzazione query |

### 9. 🔄 Migration Strategy

```typescript
// 1. Crea organization di default
const defaultOrg = await createOrganization({
  name: "Demo Organization",
  code: "DEMO",
  subdomain: "demo"
});

// 2. Associa tutti i dati esistenti
await prisma.$executeRaw`
  UPDATE athletes SET organizationId = ${defaultOrg.id} 
  WHERE organizationId IS NULL
`;

// 3. Crea admin user per default org
await createSuperAdmin({
  email: "admin@system.com",
  organizations: [defaultOrg.id]
});
```

### 10. 📊 Metriche di Successo

- Tempo medio creazione nuova società: < 2 minuti
- Zero data leak tra tenant nei primi 6 mesi
- Performance: < 10% degradation con 50 tenant
- User satisfaction: > 90% per gestione multi-org

---

## 🎯 Prossimi Passi Consigliati

1. **Review e approvazione** di questo piano
2. **Scelte architetturali** definitive
3. **Setup ambiente test** isolato
4. **Implementazione Fase 1** (Database)
5. **Testing incrementale** per fase

Questo è un cambiamento significativo ma gestibile con il giusto approccio!
