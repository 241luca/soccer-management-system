import { Router, Response } from 'express';
import { authenticate, requireSuperAdmin, AuthRequest } from '../middleware/multi-tenant.middleware';
import { getRateLimitStatus, toggleRateLimit } from '../middleware/rateLimit.middleware';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get rate limit status
router.get('/rate-limit/status', authenticate, requireSuperAdmin, (req: AuthRequest, res: Response) => {
  const status = getRateLimitStatus();
  res.json(status);
});

// Toggle rate limiting
router.post('/rate-limit/toggle', authenticate, requireSuperAdmin, (req: AuthRequest, res: Response) => {
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
  
  return res.json({
    message: `Rate limiting ${enabled ? 'enabled' : 'disabled'}`,
    status: getRateLimitStatus()
  });
});

// Get system statistics
router.get('/system/stats', authenticate, requireSuperAdmin, async (req: AuthRequest, res: Response, next) => {
  try {
    const [
      organizationsCount,
      usersCount,
      athletesCount,
      teamsCount
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.user.count(),
      prisma.athlete.count(),
      prisma.team.count()
    ]);
    
    res.json({
      organizations: organizationsCount,
      users: usersCount,
      athletes: athletesCount,
      teams: teamsCount,
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
});

// Health check
router.get('/health', (req: AuthRequest, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

export default router;
