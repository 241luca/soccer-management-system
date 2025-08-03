import { Router } from 'express';
import { authenticate } from '../middleware/multi-tenant.middleware';
import { getRateLimitStatus, toggleRateLimit } from '../middleware/rateLimit.middleware';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Middleware to check if user is super admin
const requireSuperAdmin = async (req: any, res: any, next: any) => {
  if (!req.user?.isSuperAdmin) {
    // Check if user is a super admin
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { id: req.user?.userId }
    });
    
    if (!superAdmin) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Super admin access required'
        }
      });
    }
  }
  next();
};

// Get rate limit status
router.get('/rate-limit/status', authenticate, requireSuperAdmin, (req, res) => {
  const status = getRateLimitStatus();
  res.json(status);
});

// Toggle rate limiting
router.post('/rate-limit/toggle', authenticate, requireSuperAdmin, (req, res) => {
  const { enabled } = req.body;
  
  if (typeof enabled !== 'boolean') {
    return res.status(400).json({
      error: {
        code: 'INVALID_INPUT',
        message: 'enabled must be a boolean'
      }
    });
  }
  
  toggleRateLimit(enabled);
  
  res.json({
    message: `Rate limiting ${enabled ? 'enabled' : 'disabled'}`,
    status: getRateLimitStatus()
  });
});

// Get system statistics
router.get('/system/stats', authenticate, requireSuperAdmin, async (req, res, next) => {
  try {
    const [
      organizationsCount,
      usersCount,
      athletesCount,
      activeOrganizations
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.user.count(),
      prisma.athlete.count(),
      prisma.organization.count({ where: { isActive: true } })
    ]);
    
    res.json({
      organizations: {
        total: organizationsCount,
        active: activeOrganizations
      },
      users: {
        total: usersCount
      },
      athletes: {
        total: athletesCount
      },
      rateLimit: getRateLimitStatus()
    });
  } catch (error) {
    next(error);
  }
});

export default router;
