# 📝 Backend Implementation Examples - Anagrafica Società

## 1. Organization Details Route Example

```javascript
// backend/src/routes/organizations.routes.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';
import { checkSuperAdmin } from '../middleware/superAdmin.js';
import { canModifyOrganization } from '../middleware/permissions.js';
import { validateOrganizationUpdate } from '../validators/organization.validator.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/v1/organizations/:id/details
router.get('/:id/details', requireAuth, checkSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check permissions
    if (!req.isSuperAdmin && req.user.organizationId !== id && req.user.role !== 'Owner') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Super admin access required',
        code: 'SUPER_ADMIN_REQUIRED'
      });
    }
    
    // For Owner, verify they have access to this org
    if (req.user.role === 'Owner' && !req.isSuperAdmin) {
      const hasAccess = await prisma.userOrganization.findFirst({
        where: {
          userId: req.user.id,
          organizationId: id,
          role: 'Owner'
        }
      });
      
      if (!hasAccess) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'No access to this organization',
          code: 'NO_ORG_ACCESS'
        });
      }
    }
    
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            teams: true,
            users: true,
            athletes: true,
            venues: true,
            sponsors: true,
            staffMembers: true
          }
        }
      }
    });
    
    if (!organization) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Organization not found',
        code: 'ORG_NOT_FOUND'
      });
    }
    
    res.json(organization);
  } catch (error) {
    console.error('Error fetching organization details:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch organization details'
    });
  }
});

// PUT /api/v1/organizations/:id
router.put('/:id', 
  requireAuth, 
  canModifyOrganization,
  validateOrganizationUpdate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Remove fields that shouldn't be updated
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      delete updateData._count;
      
      const organization = await prisma.organization.update({
        where: { id },
        data: updateData,
        include: {
          _count: {
            select: {
              teams: true,
              users: true,
              athletes: true
            }
          }
        }
      });
      
      res.json({
        success: true,
        data: organization
      });
    } catch (error) {
      console.error('Error updating organization:', error);
      
      if (error.code === 'P2002') {
        return res.status(400).json({
          error: 'Duplicate Entry',
          message: 'Organization code already exists'
        });
      }
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update organization'
      });
    }
  }
);

export default router;
```

## 2. Sponsors Routes Example

```javascript
// backend/src/routes/sponsors.routes.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';
import { requireOrganizationContext } from '../middleware/organizationContext.js';
import { validateSponsorCreate, validateSponsorUpdate } from '../validators/sponsor.validator.js';
import { validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/v1/organizations/:orgId/sponsors
router.get('/organizations/:orgId/sponsors', 
  requireAuth,
  requireOrganizationContext,
  async (req, res) => {
    try {
      const { orgId } = req.params;
      const { type, active } = req.query;
      
      // Build where clause
      const where = {
        organizationId: orgId,
        ...(type && { sponsorType: type }),
        ...(active !== undefined && { isActive: active === 'true' })
      };
      
      const sponsors = await prisma.sponsor.findMany({
        where,
        orderBy: [
          { sponsorType: 'asc' },
          { annualAmount: 'desc' }
        ]
      });
      
      // Calculate summary
      const summary = {
        total: sponsors.length,
        byType: {},
        totalAnnualValue: 0
      };
      
      const types = ['main', 'technical', 'gold', 'silver', 'bronze', 'partner'];
      types.forEach(type => {
        summary.byType[type] = sponsors.filter(s => s.sponsorType === type).length;
      });
      
      summary.totalAnnualValue = sponsors
        .filter(s => s.isActive && s.annualAmount)
        .reduce((sum, s) => sum + Number(s.annualAmount), 0);
      
      res.json({
        sponsors,
        summary
      });
    } catch (error) {
      console.error('Error fetching sponsors:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch sponsors'
      });
    }
  }
);

// POST /api/v1/organizations/:orgId/sponsors
router.post('/organizations/:orgId/sponsors',
  requireAuth,
  requireOrganizationContext,
  validateSponsorCreate,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          error: 'Validation Error',
          message: 'Invalid input data',
          errors: errors.mapped()
        });
      }
      
      const { orgId } = req.params;
      const sponsorData = {
        ...req.body,
        organizationId: orgId
      };
      
      const sponsor = await prisma.sponsor.create({
        data: sponsorData
      });
      
      res.status(201).json({
        success: true,
        data: sponsor
      });
    } catch (error) {
      console.error('Error creating sponsor:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create sponsor'
      });
    }
  }
);

// PUT /api/v1/sponsors/:id
router.put('/sponsors/:id',
  requireAuth,
  validateSponsorUpdate,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verify sponsor belongs to user's organization
      const sponsor = await prisma.sponsor.findUnique({
        where: { id }
      });
      
      if (!sponsor) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Sponsor not found'
        });
      }
      
      // Check permissions
      if (req.user.role !== 'SUPER_ADMIN' && 
          req.user.organizationId !== sponsor.organizationId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Cannot modify sponsor from another organization'
        });
      }
      
      const updated = await prisma.sponsor.update({
        where: { id },
        data: req.body
      });
      
      res.json({
        success: true,
        data: updated
      });
    } catch (error) {
      console.error('Error updating sponsor:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update sponsor'
      });
    }
  }
);

// DELETE /api/v1/sponsors/:id
router.delete('/sponsors/:id',
  requireAuth,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Soft delete - just set isActive to false
      const sponsor = await prisma.sponsor.update({
        where: { id },
        data: { isActive: false }
      });
      
      res.json({
        success: true,
        message: 'Sponsor deactivated successfully'
      });
    } catch (error) {
      console.error('Error deleting sponsor:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete sponsor'
      });
    }
  }
);

export default router;
```

## 3. Staff Routes Update Example

```javascript
// backend/src/routes/staff.routes.js - UPDATE existing file
// Add these fields to existing routes

// GET /api/v1/organizations/:orgId/staff
router.get('/organizations/:orgId/staff', requireAuth, async (req, res) => {
  try {
    const { orgId } = req.params;
    const { includeInactive } = req.query;
    
    const where = {
      organizationId: orgId,
      ...(includeInactive !== 'true' && { isActive: true })
    };
    
    const staff = await prisma.staffMember.findMany({
      where,
      include: {
        team: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { role: 'asc' },
        { lastName: 'asc' }
      ]
    });
    
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch staff members'
    });
  }
});

// PUT /api/v1/staff/:id - Update to include new fields
router.put('/staff/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validate salary if provided
    if (updateData.salary !== undefined && updateData.salary < 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Salary cannot be negative'
      });
    }
    
    // Validate contractType if provided
    const validContractTypes = ['full-time', 'part-time', 'volunteer', 'consultant'];
    if (updateData.contractType && !validContractTypes.includes(updateData.contractType)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid contract type'
      });
    }
    
    // Validate paymentFrequency if provided
    const validPaymentFrequencies = ['monthly', 'weekly', 'hourly', 'per-event'];
    if (updateData.paymentFrequency && !validPaymentFrequencies.includes(updateData.paymentFrequency)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid payment frequency'
      });
    }
    
    const staff = await prisma.staffMember.update({
      where: { id },
      data: updateData,
      include: {
        team: true
      }
    });
    
    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update staff member'
    });
  }
});
```

## 4. Middleware Examples

```javascript
// backend/src/middleware/organizationContext.js
export const requireOrganizationContext = (req, res, next) => {
  // Try to get organization ID from multiple sources
  const orgId = req.headers['x-organization-id'] || 
                req.params.orgId || 
                req.params.organizationId ||
                req.body?.organizationId ||
                req.user?.organizationId;
  
  if (!orgId) {
    return res.status(400).json({ 
      error: 'Bad Request',
      message: 'Organization ID required',
      code: 'ORG_ID_REQUIRED'
    });
  }
  
  req.organizationId = orgId;
  next();
};

// backend/src/middleware/superAdmin.js
export const checkSuperAdmin = (req, res, next) => {
  // Check both role and header
  req.isSuperAdmin = req.user?.role === 'SUPER_ADMIN' || 
                     req.headers['x-super-admin'] === 'true';
  next();
};

// backend/src/middleware/permissions.js
export const canModifyOrganization = async (req, res, next) => {
  const organizationId = req.params.id || req.params.orgId;
  const user = req.user;
  
  // Super Admin can modify any organization
  if (user.role === 'SUPER_ADMIN') {
    return next();
  }
  
  // Owner needs to have access to this specific organization
  if (user.role === 'Owner') {
    const hasAccess = await prisma.userOrganization.findFirst({
      where: {
        userId: user.id,
        organizationId: organizationId,
        role: 'Owner'
      }
    });
    
    if (hasAccess) {
      return next();
    }
  }
  
  // Admin can only modify their own organization
  if (user.role === 'Admin' && user.organizationId === organizationId) {
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Forbidden',
    message: 'Insufficient permissions to modify this organization',
    code: 'INSUFFICIENT_PERMISSIONS'
  });
};
```

## 5. Validation Examples

```javascript
// backend/src/validators/organization.validator.js
import { body } from 'express-validator';

export const validateOrganizationUpdate = [
  // Contact fields
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  
  body('phone')
    .optional()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[(]?[0-9]{2,4}[)]?[-\s.]?[0-9]{4,10}$/)
    .withMessage('Invalid phone number'),
  
  body('website')
    .optional()
    .isURL({ require_protocol: true })
    .withMessage('Invalid website URL'),
  
  // Color validation
  body('primaryColor')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Primary color must be valid hex format (#RRGGBB)'),
  
  body('secondaryColor')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Secondary color must be valid hex format (#RRGGBB)'),
  
  // Italian specific validations
  body('fiscalCode')
    .optional()
    .matches(/^[A-Z0-9]{16}$/)
    .withMessage('Invalid Italian fiscal code'),
  
  body('vatNumber')
    .optional()
    .matches(/^\d{11}$/)
    .withMessage('VAT number must be 11 digits'),
  
  body('iban')
    .optional()
    .matches(/^IT\d{2}[A-Z]\d{22}$/)
    .withMessage('Invalid Italian IBAN format'),
  
  // Social media URLs
  body('socialFacebook')
    .optional()
    .isURL()
    .withMessage('Invalid Facebook URL'),
  
  body('socialInstagram')
    .optional()
    .isURL()
    .withMessage('Invalid Instagram URL'),
  
  body('socialTwitter')
    .optional()
    .isURL()
    .withMessage('Invalid Twitter URL'),
  
  body('socialYoutube')
    .optional()
    .isURL()
    .withMessage('Invalid YouTube URL'),
  
  // Other validations
  body('foundedYear')
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage('Invalid foundation year'),
  
  body('postalCode')
    .optional()
    .matches(/^\d{5}$/)
    .withMessage('Postal code must be 5 digits')
];
```

## 6. Main App Integration

```javascript
// backend/src/app.js - Add these routes
import organizationRoutes from './routes/organizations.routes.js';
import sponsorRoutes from './routes/sponsors.routes.js';

// ... existing code ...

// Routes
app.use('/api/v1', organizationRoutes);
app.use('/api/v1', sponsorRoutes);
// ... other routes ...
```

## 7. Prisma Migration Commands

```bash
# Create sponsor table migration
cd backend
npx prisma migrate dev --name add_sponsor_table

# Update staff and kit tables
npx prisma migrate dev --name add_compensation_and_ecommerce_fields

# Generate Prisma client
npx prisma generate

# Seed example data
npx prisma db seed
```

## 8. Testing Examples

```bash
# Test organization details
curl -X GET http://localhost:3000/api/v1/organizations/43c973a6-5e20-43af-a295-805f1d7c86b1/details \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Organization-ID: 43c973a6-5e20-43af-a295-805f1d7c86b1"

# Update organization
curl -X PUT http://localhost:3000/api/v1/organizations/43c973a6-5e20-43af-a295-805f1d7c86b1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "primaryColor": "#FF0000",
    "email": "newmail@demo.com"
  }'

# Create sponsor
curl -X POST http://localhost:3000/api/v1/organizations/43c973a6-5e20-43af-a295-805f1d7c86b1/sponsors \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Sponsor SRL",
    "sponsorType": "main",
    "annualAmount": 50000,
    "contractStartDate": "2024-01-01",
    "contractEndDate": "2025-12-31",
    "visibility": ["jersey", "website", "stadium"]
  }'
```

## Important Notes

1. **Error Format**: Always return errors in the expected format
2. **Decimal Handling**: Use Prisma Decimal for money fields
3. **Date Format**: Use ISO 8601 for dates
4. **Soft Delete**: Use isActive flag, don't delete records
5. **Multi-tenancy**: Always filter by organizationId
6. **Logging**: Log all errors for debugging
7. **Validation**: Validate both client and server side

## Troubleshooting

### Common Issues

1. **"Organization ID required"**
   - Check headers: X-Organization-ID
   - Check params: orgId or organizationId
   - Check user's default organizationId

2. **"Super admin access required"**
   - Frontend sends X-Super-Admin: true
   - Check user role is SUPER_ADMIN
   - Verify middleware order

3. **Decimal/Money fields**
   ```javascript
   // Convert Prisma Decimal to number for JSON
   annualAmount: sponsor.annualAmount ? Number(sponsor.annualAmount) : null
   ```

4. **Array fields in Prisma**
   ```javascript
   // Ensure arrays are properly formatted
   visibility: req.body.visibility || []
   ```
