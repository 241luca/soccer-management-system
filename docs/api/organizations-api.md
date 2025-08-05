# API Documentation - Organizations Module

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer {token}
```

## Special Headers

### Super Admin Header
For Super Admin operations, the system automatically adds:
```
X-Super-Admin: true
```

### Organization Context
For organization-specific operations:
```
X-Organization-ID: {organizationId}
```

---

## Organizations Endpoints

### Get Organization List
```http
GET /organizations
```

**Permissions:** Super Admin, Owner (filtered by access)

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Demo Club",
    "code": "DEMO",
    "plan": "enterprise",
    "isActive": true,
    "subdomain": "demo",
    "maxUsers": 50,
    "_count": {
      "users": 23,
      "athletes": 150,
      "teams": 8
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### Get Organization Details
```http
GET /organizations/:id/details
```

**Permissions:** Admin, Super Admin, Owner (for assigned orgs)

**Response:**
```json
{
  "id": "uuid",
  "name": "Demo Club",
  "code": "DEMO",
  "logoUrl": "https://...",
  "fullName": "Demo Soccer Club ASD",
  "email": "info@democlub.com",
  "phone": "+39 0544 123456",
  "website": "https://www.democlub.com",
  "address": "Via Demo 1",
  "city": "Ravenna",
  "province": "RA",
  "postalCode": "48121",
  "fiscalCode": "92012345678",
  "vatNumber": "12345678901",
  "iban": "IT60X0542811101000000123456",
  "bankName": "Banca Demo",
  "presidentName": "Mario Rossi",
  "presidentEmail": "presidente@democlub.com",
  "presidentPhone": "+39 333 1234567",
  "secretaryName": "Luigi Bianchi",
  "secretaryEmail": "segreteria@democlub.com",
  "secretaryPhone": "+39 333 7654321",
  "primaryColor": "#3B82F6",
  "secondaryColor": "#1E40AF",
  "socialFacebook": "https://facebook.com/democlub",
  "socialInstagram": "https://instagram.com/democlub",
  "socialTwitter": "https://twitter.com/democlub",
  "socialYoutube": "https://youtube.com/democlub",
  "foundedYear": 1950,
  "federationNumber": "123456",
  "description": "Storica società calcistica...",
  "_count": {
    "teams": 8,
    "athletes": 150,
    "venues": 3,
    "sponsors": 12,
    "staffMembers": 25
  }
}
```

### Update Organization
```http
PUT /organizations/:id
```

**Permissions:** Admin, Super Admin, Owner (for assigned orgs)

**Request Body:**
```json
{
  "name": "Demo Club Updated",
  "email": "newinfo@democlub.com",
  "primaryColor": "#FF0000",
  // ... any organization field
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // Updated organization object
  }
}
```

### Create Organization
```http
POST /organizations
```

**Permissions:** Super Admin only

**Request Body:**
```json
{
  "name": "New Club",
  "code": "NEWCLUB",
  "plan": "basic",
  "subdomain": "newclub",
  "maxUsers": 10
}
```

---

## Sponsors Endpoints (To be implemented)

### List Organization Sponsors
```http
GET /organizations/:orgId/sponsors
```

**Query Parameters:**
- `type`: Filter by sponsor type (main, technical, gold, silver, bronze, partner)
- `active`: Filter active/inactive (true/false)

**Response:**
```json
{
  "sponsors": [
    {
      "id": "uuid",
      "name": "Main Sponsor SRL",
      "logoUrl": "https://...",
      "website": "https://sponsor.com",
      "sponsorType": "main",
      "contractStartDate": "2024-01-01",
      "contractEndDate": "2025-12-31",
      "annualAmount": 50000,
      "visibility": ["jersey", "website", "stadium"],
      "isActive": true
    }
  ],
  "summary": {
    "total": 12,
    "byType": {
      "main": 1,
      "technical": 1,
      "gold": 3,
      "silver": 4,
      "bronze": 3
    },
    "totalAnnualValue": 250000
  }
}
```

### Create Sponsor
```http
POST /organizations/:orgId/sponsors
```

**Request Body:**
```json
{
  "name": "New Sponsor",
  "sponsorType": "gold",
  "contractStartDate": "2024-01-01",
  "contractEndDate": "2025-12-31",
  "annualAmount": 25000,
  "contactName": "John Doe",
  "contactEmail": "john@sponsor.com",
  "contactPhone": "+39 333 1234567",
  "visibility": ["jersey", "website"],
  "description": "Gold sponsor for 2024-2025 season"
}
```

### Update Sponsor
```http
PUT /sponsors/:id
```

### Delete Sponsor
```http
DELETE /sponsors/:id
```

---

## Staff Endpoints (Enhanced)

### List Staff with Compensation
```http
GET /organizations/:orgId/staff
```

**Response:**
```json
[
  {
    "id": "uuid",
    "firstName": "Giovanni",
    "lastName": "Rossi",
    "role": "coach",
    "email": "g.rossi@democlub.com",
    "phone": "+39 333 1234567",
    "qualifications": ["UEFA A", "Laurea Scienze Motorie"],
    "startDate": "2023-09-01",
    "salary": 35000,
    "contractType": "full-time",
    "paymentFrequency": "monthly",
    "isActive": true,
    "team": {
      "id": "uuid",
      "name": "Prima Squadra"
    }
  }
]
```

### Create/Update Staff Member
```http
POST /organizations/:orgId/staff
PUT /staff/:id
```

**Request Body:**
```json
{
  "firstName": "Giovanni",
  "lastName": "Rossi",
  "role": "coach",
  "teamId": "uuid",
  "salary": 35000,
  "contractType": "full-time",
  "paymentFrequency": "monthly",
  // ... other fields
}
```

---

## Team Kits Endpoints (Enhanced)

### List Team Kits
```http
GET /organizations/:orgId/kits
```

**Query Parameters:**
- `season`: Filter by season (e.g., "2024/2025")
- `teamId`: Filter by team
- `kitType`: Filter by type (home, away, third, goalkeeper)

**Response:**
```json
[
  {
    "id": "uuid",
    "season": "2024/2025",
    "kitType": "home",
    "primaryColor": "#FF0000",
    "secondaryColor": "#FFFFFF",
    "pattern": "stripes",
    "manufacturer": "Nike",
    "sponsor": "Main Sponsor",
    "imageUrl": "https://...",
    "shopUrl": "https://shop.democlub.com/kit/home",
    "merchandiseUrl": "https://shop.democlub.com/merchandise",
    "price": 79.99,
    "availableSizes": ["XS", "S", "M", "L", "XL", "XXL"],
    "team": {
      "id": "uuid",
      "name": "Prima Squadra"
    }
  }
]
```

### Create/Update Kit
```http
POST /organizations/:orgId/kits
PUT /kits/:id
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Organization ID required",
  "code": "ORG_ID_REQUIRED"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Super admin access required",
  "code": "SUPER_ADMIN_REQUIRED"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Organization not found",
  "code": "ORG_NOT_FOUND"
}
```

### 422 Validation Error
```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "errors": {
    "email": "Invalid email format",
    "primaryColor": "Must be valid hex color"
  }
}
```

---

## Rate Limiting

API implements rate limiting per IP:
- 100 requests per 15 minutes for authenticated users
- 20 requests per 15 minutes for unauthenticated requests

Headers returned:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Webhooks (Future)

Organizations can subscribe to webhooks for events:
- `organization.updated`
- `sponsor.created`
- `sponsor.expiring`
- `staff.created`
- `staff.contract.expiring`

---

## SDK Examples

### JavaScript/TypeScript
```typescript
import { OrganizationAPI } from '@soccermanager/sdk';

const api = new OrganizationAPI({
  token: 'your-jwt-token',
  baseURL: 'http://localhost:3000/api/v1'
});

// Get organization details
const org = await api.organizations.get('org-id');

// Update organization
await api.organizations.update('org-id', {
  primaryColor: '#FF0000'
});

// List sponsors
const sponsors = await api.sponsors.list('org-id', {
  type: 'main',
  active: true
});
```

### cURL Examples
```bash
# Get organization
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/organizations/123/details

# Update organization
curl -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"primaryColor":"#FF0000"}' \
  http://localhost:3000/api/v1/organizations/123
```
