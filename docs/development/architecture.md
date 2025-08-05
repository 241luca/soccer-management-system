# 🏗️ Architettura Sistema

## Overview

Il Soccer Management System è costruito con un'architettura moderna a 3 livelli, ottimizzata per scalabilità e manutenibilità.

## 📐 Architettura Generale

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Components  │  │    Hooks     │  │    Services      │  │
│  │  - Pages    │  │ - useAuth    │  │  - API Client    │  │
│  │  - Shared   │  │ - useApiData │  │  - Auth Service  │  │
│  │  - Layout   │  │ - Custom     │  │  - Utils         │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WebSocket
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js/Express)                 │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Routes    │  │  Middleware  │  │    Services      │  │
│  │  - Auth     │  │  - Auth      │  │  - Business      │  │
│  │  - CRUD     │  │  - Validate  │  │  - Data Access   │  │
│  │  - Upload   │  │  - RateLimit │  │  - Integration   │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Prisma ORM
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Tables    │  │   Indexes    │  │   Functions      │  │
│  │  - Core     │  │  - Primary   │  │  - Triggers      │  │
│  │  - Multi-   │  │  - Foreign   │  │  - Procedures    │  │
│  │    tenant   │  │  - Custom    │  │  - Views         │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Frontend Architecture

### Stack Tecnologico
- **React 18**: UI library con hooks
- **Vite**: Build tool veloce
- **TailwindCSS**: Utility-first CSS
- **TypeScript**: Type safety (parziale)
- **Lucide Icons**: Icone moderne

### Struttura Directory
```
src/
├── components/
│   ├── layout/
│   │   ├── Navigation.jsx
│   │   ├── Layout.jsx
│   │   └── LoadingSpinner.jsx
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── OrganizationSelector.jsx
│   ├── organizations/
│   │   ├── OrganizationDetails.jsx
│   │   ├── OrganizationList.jsx
│   │   └── OrganizationSwitcher.jsx
│   └── shared/
│       ├── ErrorMessage.jsx
│       ├── Button.jsx
│       └── Modal.jsx
├── hooks/
│   ├── useAuth.js          # Gestione autenticazione
│   ├── useApiData.js       # Fetching dati API
│   └── useNotifications.js # Sistema notifiche
├── services/
│   ├── api.js             # API client centralizzato
│   └── auth.js            # Auth utilities
└── utils/
    ├── constants.js       # Costanti app
    └── helpers.js         # Funzioni utility
```

### Patterns Utilizzati

#### 1. Custom Hooks Pattern
```javascript
// useApiData - Hook per gestione dati API
const useApiData = (endpoint, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, dependencies);
  
  return { data, loading, error, refetch };
};
```

#### 2. Compound Components
```javascript
// Organization Details con Tab System
<OrganizationDetails>
  <OrganizationDetails.Header />
  <OrganizationDetails.Tabs>
    <Tab name="general" />
    <Tab name="contacts" />
    <Tab name="fiscal" />
  </OrganizationDetails.Tabs>
  <OrganizationDetails.Content />
</OrganizationDetails>
```

#### 3. Provider Pattern
```javascript
// Auth Context Provider
<AuthProvider>
  <App />
</AuthProvider>
```

## ⚙️ Backend Architecture

### Stack Tecnologico
- **Node.js**: Runtime JavaScript
- **Express.js**: Web framework
- **TypeScript**: Type safety completo
- **Prisma ORM**: Database toolkit
- **JWT**: Autenticazione stateless
- **Socket.io**: Real-time communication

### Struttura Directory
```
backend/src/
├── routes/              # API endpoints
│   ├── auth.routes.ts
│   ├── organization.routes.ts
│   ├── sponsors.routes.ts      # NEW
│   ├── staff.routes.ts         # NEW
│   ├── teamKits.routes.ts      # NEW
│   └── organizationDocuments.routes.ts # NEW
├── services/            # Business logic
│   ├── auth.service.ts
│   ├── organization.service.ts
│   └── notification.service.ts
├── middleware/          # Express middleware
│   ├── auth.middleware.ts
│   ├── rateLimit.middleware.ts
│   ├── error.middleware.ts
│   └── multi-tenant.middleware.ts
├── validators/          # Input validation # NEW
│   ├── organization.validator.ts
│   └── sponsor.validator.ts
├── utils/              # Utilities
│   ├── errors.ts
│   ├── logger.ts
│   └── asyncHandler.ts
└── types/              # TypeScript types
    ├── auth.types.ts
    └── express.types.ts
```

### Layered Architecture

#### 1. Route Layer
```typescript
// Gestisce HTTP request/response
router.get('/organizations/:id/details', 
  authenticate,
  checkPermissions,
  async (req, res) => {
    const data = await organizationService.getDetails(req.params.id);
    res.json(data);
  }
);
```

#### 2. Service Layer
```typescript
// Business logic isolata
class OrganizationService {
  async getDetails(id: string) {
    // Validazioni business
    // Orchestrazione data access
    // Trasformazioni
    return organization;
  }
}
```

#### 3. Data Access Layer
```typescript
// Prisma ORM per accesso dati
const organization = await prisma.organization.findUnique({
  where: { id },
  include: { 
    _count: { 
      select: { teams: true, users: true }
    }
  }
});
```

### Middleware Pipeline

```
Request → CORS → RateLimit → Auth → Validation → Route → Response
                                ↓
                            Error Handler
```

## 🗄️ Database Architecture

### Schema Design Principles

1. **Multi-tenancy via Row-Level Security**
   - Ogni record ha `organizationId`
   - Filtri automatici per tenant

2. **UUID Primary Keys**
   - Globally unique identifiers
   - Sicurezza migliorata

3. **Soft Deletes**
   - Campo `isActive` invece di DELETE
   - Mantiene integrità referenziale

4. **Audit Fields**
   - `createdAt`, `updatedAt` automatici
   - `createdBy`, `updatedBy` per tracking

### Relazioni Principali

```sql
Organization (1) ─────< (N) User
     │                      │
     │                      │ (N:M via UserOrganization)
     │                      │
     ├──< Team ─────< Athlete
     ├──< Sponsor
     ├──< StaffMember
     ├──< TeamKit
     └──< OrganizationDocument
```

### Indici e Performance

```sql
-- Indici per query frequenti
CREATE INDEX idx_org_sponsor_type ON sponsors(organization_id, sponsor_type);
CREATE INDEX idx_org_docs_year ON organization_documents(organization_id, year);
CREATE INDEX idx_staff_org_role ON staff_members(organization_id, role);
```

## 🔐 Security Architecture

### Authentication Flow

```
1. Login Request
   ↓
2. Validate Credentials
   ↓
3. Generate JWT + Refresh Token
   ↓
4. Return Tokens + User Info
   ↓
5. Client stores in localStorage/memory
   ↓
6. Include JWT in API requests
   ↓
7. Middleware validates JWT
   ↓
8. Extract user context
   ↓
9. Process request with context
```

### Authorization Levels

1. **Super Admin**: Accesso globale
2. **Owner**: Multi-organization access
3. **Admin**: Single organization full access
4. **Staff/Coach**: Limited access
5. **Public**: Documents pubblici only

### Security Measures

- **Password Hashing**: bcrypt con salt rounds 10
- **JWT Expiration**: 24h access, 7d refresh
- **Rate Limiting**: Configurabile per endpoint
- **Input Validation**: express-validator
- **SQL Injection**: Prevenuto da Prisma
- **XSS Protection**: Helmet.js
- **CORS**: Whitelist origins

## 📦 Module Architecture

### Core Modules

#### 1. Authentication Module
- Login/Logout
- JWT management
- Refresh tokens
- Multi-tenant context

#### 2. Organization Module
- CRUD operations
- Anagrafica completa
- Logo management
- Settings

#### 3. Sponsor Module (NEW)
- Sponsor CRUD
- Revenue tracking
- Contract management
- Visibility settings

#### 4. Staff Module (Enhanced)
- Personnel management
- Compensation tracking
- Contract types
- Qualifications

#### 5. Team Kits Module (Enhanced)
- Kit management
- E-commerce integration
- Size availability
- Season tracking

#### 6. Documents Module (NEW)
- Secure upload
- Categorization
- Public/Private access
- Metadata management

## 🔄 Data Flow

### Typical Request Flow

```
1. User Action (Frontend)
   ↓
2. API Call (Service Layer)
   ↓
3. HTTP Request with JWT
   ↓
4. Express Route Handler
   ↓
5. Middleware Chain
   - Rate Limiting
   - Authentication
   - Authorization
   - Validation
   ↓
6. Service Layer Processing
   ↓
7. Database Query (Prisma)
   ↓
8. Response Transformation
   ↓
9. HTTP Response
   ↓
10. Frontend State Update
   ↓
11. UI Re-render
```

### Real-time Updates (Future)

```
Event Occurs → Socket.io Emit → Client Listeners → State Update → UI Update
```

## 🚀 Deployment Architecture

### Development
```
Frontend: Vite Dev Server (5173)
Backend: Nodemon + TS-Node (3000)
Database: Local PostgreSQL (5432)
```

### Production (Recommended)
```
Frontend: Nginx → Static Files
Backend: PM2 → Node Cluster
Database: PostgreSQL with Replicas
Cache: Redis
Storage: S3/Local + CDN
```

### Docker Architecture (Future)
```yaml
services:
  frontend:
    build: ./frontend
    ports: ["80:80"]
  
  backend:
    build: ./backend
    ports: ["3000:3000"]
    
  postgres:
    image: postgres:15
    volumes: ["pgdata:/var/lib/postgresql/data"]
    
  redis:
    image: redis:7
```

## 📈 Scalability Considerations

### Horizontal Scaling
- Stateless backend (JWT)
- Database read replicas
- Load balancer ready
- Microservices ready

### Performance Optimizations
- Database query optimization
- Caching strategy (Redis)
- CDN for static assets
- Lazy loading frontend

### Monitoring Points
- API response times
- Database query performance
- Error rates
- User session analytics

## 🔧 Development Workflow

### Git Flow
```
main
  ├── develop
  │     ├── feature/anagrafica-backend
  │     ├── feature/sponsor-module
  │     └── feature/document-upload
  └── hotfix/security-patch
```

### CI/CD Pipeline (Future)
```
1. Git Push
2. Run Tests
3. Build & Lint
4. Security Scan
5. Deploy Staging
6. Integration Tests
7. Deploy Production
```

## 📚 Best Practices Implemented

1. **Separation of Concerns**: Clear layer boundaries
2. **DRY Principle**: Reusable components/services
3. **SOLID Principles**: Especially in services
4. **Error Handling**: Centralized error management
5. **Logging**: Structured logging with context
6. **Documentation**: Code comments + API docs
7. **Type Safety**: TypeScript backend
8. **Testing Ready**: Structure supports testing

---

**Version**: 2.0.0  
**Last Updated**: August 2025  
**Architecture Review**: Quarterly
