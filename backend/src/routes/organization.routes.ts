import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { organizationService } from '../services/organization.service';
import { 
  authenticate,
  requireOrganization,
  requirePermissions,
  requireSuperAdmin,
  extractOrganization,
  AuthRequest
} from '../middleware/multi-tenant.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { z } from 'zod';
import { validateOrganizationUpdate, handleValidationErrors } from '../validators/organization.validator';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createOrgSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  subdomain: z.string().min(1),
  plan: z.string(),
  ownerEmail: z.string().email(),
  ownerFirstName: z.string().min(1),
  ownerLastName: z.string().min(1),
  ownerPassword: z.string().min(8)
});

const inviteUserSchema = z.object({
  email: z.string().email(),
  roleId: z.string().uuid()
});

// Super admin: list all organizations
router.get('/',
  authenticate,
  requireSuperAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        logoUrl: true,
        plan: true,
        isActive: true,
        subdomain: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            athletes: true,
            teams: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(organizations);
  })
);

// Public routes
router.get('/check-availability/:identifier', asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    await organizationService.getOrganization(req.params.identifier);
    res.json({ available: false });
  } catch (error) {
    res.json({ available: true });
  }
}));

// Super admin routes
router.post('/create',
  authenticate,
  requireSuperAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = createOrgSchema.parse(req.body);
    const result = await organizationService.createOrganization(data);
    res.status(201).json(result);
  })
);

// Organization-specific routes
router.get('/current',
  extractOrganization,
  authenticate,
  requireOrganization,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const org = await organizationService.getOrganization(req.organization!.id);
    res.json(org);
  })
);

router.patch('/current',
  extractOrganization,
  authenticate,
  requireOrganization,
  requirePermissions('ORGANIZATION_UPDATE'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const updated = await organizationService.updateOrganization(
      req.organization!.id,
      req.body
    );
    res.json(updated);
  })
);

// Get organization details (anagrafica completa)
router.get('/current/details',
  extractOrganization,
  authenticate,
  requireOrganization,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const details = await organizationService.getOrganizationDetails(
      req.organization!.id
    );
    res.json(details);
  })
);

// Update organization details (anagrafica completa)
router.patch('/current/details',
  extractOrganization,
  authenticate,
  requireOrganization,
  requirePermissions('ORGANIZATION_UPDATE'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const updated = await organizationService.updateOrganizationDetails(
      req.organization!.id,
      req.body
    );
    res.json(updated);
  })
);

// Upload organization logo
router.post('/current/logo',
  extractOrganization,
  authenticate,
  requireOrganization,
  requirePermissions('ORGANIZATION_UPDATE'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // Questo endpoint verrà implementato con multer per gestire l'upload
    // Per ora restituiamo un placeholder
    res.status(501).json({ message: 'Logo upload not implemented yet' });
  })
);

    // Get organization details by ID (for super admin and owner with access)
router.get('/:id/details',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const user = req.user;
    
    // Check permissions
    const isSuperAdmin = user?.role === 'SUPER_ADMIN' || req.headers['x-super-admin'] === 'true';
    
    if (!isSuperAdmin && user?.organizationId !== id && user?.role !== 'Owner') {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Super admin access required',
        code: 'SUPER_ADMIN_REQUIRED'
      });
      return;
    }
    
    // For Owner, verify they have access to this org
    if (user?.role === 'Owner' && !isSuperAdmin) {
      const hasAccess = await prisma.userOrganization.findFirst({
        where: {
          userId: user.id || user.userId,
          organizationId: id,
          role: {
            name: 'Owner'
          }
        }
      });
      
      if (!hasAccess) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'No access to this organization',
          code: 'NO_ORG_ACCESS'
        });
        return;
      }
    }
    
    const details = await organizationService.getOrganizationDetails(id);
    res.json(details);
  })
);

// Update organization by ID (for super admin, admin and owner with access)
router.put('/:id',
  authenticate,
  validateOrganizationUpdate,
  handleValidationErrors,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const user = req.user;
    const updateData = req.body;
    
    // Check permissions
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    
    // Super Admin can modify any organization
    if (!isSuperAdmin) {
      // Owner needs to have access to this specific organization
      if (user?.role === 'Owner') {
        const hasAccess = await prisma.userOrganization.findFirst({
          where: {
            userId: user.id || user.userId,
            organizationId: id,
            role: {
              name: 'Owner'
            }
          }
        });
        
        if (!hasAccess) {
          res.status(403).json({ 
            error: 'Forbidden',
            message: 'Insufficient permissions to modify this organization',
            code: 'INSUFFICIENT_PERMISSIONS'
          });
          return;
        }
      }
      // Admin can only modify their own organization
      else if (user?.role === 'Admin' && user.organizationId === id) {
        // Admin can proceed
      }
      else {
        res.status(403).json({ 
          error: 'Forbidden',
          message: 'Insufficient permissions to modify this organization',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
        return;
      }
    }
    
    try {
      // Remove fields that shouldn't be updated
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      delete updateData._count;
      
      const updated = await organizationService.updateOrganizationDetails(
        id,
        updateData
      );
      
      res.json({
        success: true,
        data: updated
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(400).json({
          error: 'Duplicate Entry',
          message: 'Organization code already exists'
        });
        return;
      }
      throw error;
    }
  })
);

// Update organization details by ID (PATCH) - for super admin and owner with access
router.patch('/:id/details',
  authenticate,
  validateOrganizationUpdate,
  handleValidationErrors,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const user = req.user;
    const updateData = req.body;
    
    // Check permissions
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    
    // Super Admin can modify any organization
    if (!isSuperAdmin) {
      // Owner needs to have access to this specific organization
      if (user?.role === 'Owner') {
        const hasAccess = await prisma.userOrganization.findFirst({
          where: {
            userId: user.id || user.userId,
            organizationId: id,
            role: {
              name: 'Owner'
            }
          }
        });
        
        if (!hasAccess) {
          res.status(403).json({ 
            error: 'Forbidden',
            message: 'Insufficient permissions to modify this organization',
            code: 'INSUFFICIENT_PERMISSIONS'
          });
          return;
        }
      }
      // Admin can only modify their own organization
      else if (user?.role === 'Admin' && user.organizationId === id) {
        // Admin can proceed
      }
      else {
        res.status(403).json({ 
          error: 'Forbidden',
          message: 'Insufficient permissions to modify this organization',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
        return;
      }
    }
    
    try {
      // Remove fields that shouldn't be updated
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      delete updateData._count;
      
      const updated = await organizationService.updateOrganizationDetails(
        id,
        updateData
      );
      
      res.json({
        success: true,
        data: updated
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(400).json({
          error: 'Duplicate Entry',
          message: 'Organization code already exists'
        });
        return;
      }
      throw error;
    }
  })
);

// User management
router.get('/users',
  extractOrganization,
  authenticate,
  requireOrganization,
  requirePermissions('USER_VIEW'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const users = await organizationService.getOrganizationUsers(
      req.organization!.id
    );
    res.json({ users });
  })
);

router.post('/invite',
  extractOrganization,
  authenticate,
  requireOrganization,
  requirePermissions('USER_CREATE'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = inviteUserSchema.parse(req.body);
    const invitation = await organizationService.inviteUser({
      organizationId: req.organization!.id,
      email: data.email,
      roleId: data.roleId,
      invitedBy: req.user?.id || req.user?.userId || ""
    });
    res.status(201).json(invitation);
  })
);

router.post('/accept-invitation',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await organizationService.acceptInvitation(req.body);
    res.json(result);
  })
);

router.delete('/users/:userId',
  extractOrganization,
  authenticate,
  requireOrganization,
  requirePermissions('USER_DELETE'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await organizationService.removeUser(
      req.params.userId,
      req.organization!.id,
      req.user?.id || req.user?.userId || ""
    );
    res.status(204).send();
  })
);

router.patch('/users/:userId/role',
  extractOrganization,
  authenticate,
  requireOrganization,
  requirePermissions('USER_UPDATE'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const updated = await organizationService.updateUserRole({
      userId: req.params.userId,
      organizationId: req.organization!.id,
      roleId: req.body.roleId,
      updatedBy: req.user?.id || req.user?.userId || ""
    });
    res.json(updated);
  })
);

// Role management
router.get('/roles',
  extractOrganization,
  authenticate,
  requireOrganization,
  requirePermissions('ROLE_VIEW'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const roles = await organizationService.getOrganizationRoles(
      req.organization!.id
    );
    res.json({ roles });
  })
);

router.post('/roles',
  extractOrganization,
  authenticate,
  requireOrganization,
  requirePermissions('ROLE_CREATE'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const role = await organizationService.createRole({
      organizationId: req.organization!.id,
      ...req.body
    });
    res.status(201).json(role);
  })
);

router.patch('/roles/:roleId',
  extractOrganization,
  authenticate,
  requireOrganization,
  requirePermissions('ROLE_UPDATE'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const updated = await organizationService.updateRole(
      req.params.roleId,
      req.body
    );
    res.json(updated);
  })
);

router.delete('/roles/:roleId',
  extractOrganization,
  authenticate,
  requireOrganization,
  requirePermissions('ROLE_DELETE'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await organizationService.deleteRole(req.params.roleId);
    res.status(204).send();
  })
);

// Statistics
router.get('/stats',
  extractOrganization,
  authenticate,
  requireOrganization,
  requirePermissions('ORGANIZATION_VIEW'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await organizationService.getOrganizationStats(
      req.organization!.id
    );
    res.json(stats);
  })
);

// Transfer ownership
router.post('/transfer-ownership',
  extractOrganization,
  authenticate,
  requireOrganization,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await organizationService.transferOwnership(
      req.organization!.id,
      req.body.newOwnerId,
      req.user?.id || req.user?.userId || ""
    );
    res.json({ message: 'Ownership transferred successfully' });
  })
);

export default router;
