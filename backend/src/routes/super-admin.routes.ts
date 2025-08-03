import { Router, Request, Response } from 'express';
import { superAdminService } from '../services/super-admin.service';
import { superAdminAuth } from '../middleware/multiTenant.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { validateRequest } from '../middleware/validation.middleware';
import { body, param, query } from 'express-validator';

const router = Router();

// All routes require super admin authentication
router.use(superAdminAuth);

// Dashboard stats
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  const stats = await superAdminService.getSystemStats();
  res.json(stats);
}));

// System health
router.get('/health', asyncHandler(async (req: Request, res: Response) => {
  const health = await superAdminService.getSystemHealth();
  res.json(health);
}));

// Organizations management
router.get('/organizations',
  query('isActive').isBoolean().optional(),
  query('planId').isUUID().optional(),
  query('search').optional(),
  validateRequest,
  asyncHandler(async (req: Request, res: Response) => {
    const organizations = await superAdminService.getAllOrganizations(req.query);
    res.json(organizations);
  })
);

router.patch('/organizations/:id/toggle-status',
  param('id').isUUID(),
  validateRequest,
  asyncHandler(async (req: Request, res: Response) => {
    const updated = await superAdminService.toggleOrganizationStatus(req.params.id);
    res.json(updated);
  })
);

router.patch('/organizations/:id/plan',
  param('id').isUUID(),
  body('planId').isUUID(),
  validateRequest,
  asyncHandler(async (req: Request, res: Response) => {
    const updated = await superAdminService.changeOrganizationPlan(
      req.params.id,
      req.body.planId
    );
    res.json(updated);
  })
);

// Plans management
router.get('/plans',
  query('includeInactive').isBoolean().optional(),
  validateRequest,
  asyncHandler(async (req: Request, res: Response) => {
    const plans = await superAdminService.getAllPlans(
      req.query.includeInactive === 'true'
    );
    res.json(plans);
  })
);

router.post('/plans',
  body('name').notEmpty().trim(),
  body('price').isNumeric(),
  body('interval').isIn(['MONTHLY', 'YEARLY']),
  body('features').isArray(),
  body('limits').isObject(),
  validateRequest,
  asyncHandler(async (req: Request, res: Response) => {
    const plan = await superAdminService.createPlan(req.body);
    res.status(201).json(plan);
  })
);

router.patch('/plans/:id',
  param('id').isUUID(),
  validateRequest,
  asyncHandler(async (req: Request, res: Response) => {
    const updated = await superAdminService.updatePlan(req.params.id, req.body);
    res.json(updated);
  })
);

router.delete('/plans/:id',
  param('id').isUUID(),
  validateRequest,
  asyncHandler(async (req: Request, res: Response) => {
    await superAdminService.deletePlan(req.params.id);
    res.status(204).send();
  })
);

// Users management
router.get('/users',
  query('search').optional(),
  query('isSuperAdmin').isBoolean().optional(),
  validateRequest,
  asyncHandler(async (req: Request, res: Response) => {
    const users = await superAdminService.getAllUsers({
      search: req.query.search as string,
      isSuperAdmin: req.query.isSuperAdmin === 'true'
    });
    res.json(users);
  })
);

router.patch('/users/:id/toggle-status',
  param('id').isUUID(),
  validateRequest,
  asyncHandler(async (req: Request, res: Response) => {
    const updated = await superAdminService.toggleUserStatus(req.params.id);
    res.json(updated);
  })
);

// Create super admin
router.post('/create-admin',
  body('email').isEmail(),
  body('name').notEmpty().trim(),
  body('password').isLength({ min: 8 }),
  validateRequest,
  asyncHandler(async (req: Request, res: Response) => {
    const admin = await superAdminService.createSuperAdmin(req.body);
    res.status(201).json({
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName
    });
  })
);

// Audit logs
router.get('/audit-logs',
  query('organizationId').isUUID().optional(),
  query('userId').isUUID().optional(),
  query('action').optional(),
  query('startDate').isISO8601().optional(),
  query('endDate').isISO8601().optional(),
  validateRequest,
  asyncHandler(async (req: Request, res: Response) => {
    const logs = await superAdminService.getAuditLogs(req.query);
    res.json(logs);
  })
);

// System maintenance
router.post('/maintenance',
  body('enabled').isBoolean(),
  body('message').optional(),
  validateRequest,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await superAdminService.setMaintenanceMode(
      req.body.enabled,
      req.body.message
    );
    res.json(result);
  })
);

// Backup
router.post('/backup',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await superAdminService.createBackup();
    res.json(result);
  })
);

export default router;
