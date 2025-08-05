import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authService } from '../services/auth.service';
import { z } from 'zod';
import { authenticate, extractOrganization, AuthRequest } from '../middleware/multi-tenant.middleware';
import { authRateLimiter } from '../middleware/rateLimit.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const prisma = new PrismaClient();

// Apply rate limiting to all auth routes
router.use(authRateLimiter);

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  organizationId: z.string().uuid().optional()
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  organizationName: z.string().optional(),
  organizationId: z.string().uuid().optional(),
  invitationToken: z.string().optional()
});

const switchOrganizationSchema = z.object({
  organizationId: z.string().uuid()
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);
    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: error.errors
        }
      });
    }
    return next(error);
  }
});

// Register
router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);
    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: error.errors
        }
      });
    }
    return next(error);
  }
});

// Get user organizations
router.get('/organizations', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const organizations = await authService.getUserOrganizations(req.user?.id || req.user?.userId || "");
    return res.json({ organizations });
  } catch (error) {
    return next(error);
  }
});

// Get user organizations
router.get('/user-organizations',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userOrgs = await prisma.userOrganization.findMany({
      where: { userId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            code: true,
            logoUrl: true,
            plan: true
          }
        },
        role: true
      }
    });

    const organizations = userOrgs.map((uo: any) => ({
      ...uo.organization,
      role: uo.role.name,
      isDefault: uo.isDefault
    }));

    return res.json(organizations);
  })
);

// Switch organization
router.post('/switch-organization', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = switchOrganizationSchema.parse(req.body);
    const result = await authService.switchOrganization({
      userId: req.user?.id || req.user?.userId || "",
      organizationId: data.organizationId
    });
    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: error.errors
        }
      });
    }
    return next(error);
  }
});

// Super Admin login
router.post('/super-admin/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    console.log('Super Admin login attempt:', { email, passwordLength: password?.length });
    
    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Email and password are required'
        }
      });
    }
    
    const result = await authService.loginSuperAdmin(email, password);
    return res.json(result);
  } catch (error) {
    console.error('Super Admin login error:', error);
    return next(error);
  }
});

// Get current user with organization context
router.get('/me', extractOrganization, authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await authService.validateUser(req.user?.id || req.user?.userId || "");
    
    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }
    
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: req.user!.roleId ? user.role : 'SUPER_ADMIN',
        permissions: req.user!.permissions || []
      },
      organization: req.organization || null
    });
  } catch (error) {
    return next(error);
  }
});

// Refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        error: {
          code: 'MISSING_TOKEN',
          message: 'Refresh token is required'
        }
      });
    }
    
    const result = await authService.refreshToken(refreshToken);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

// Logout (stateless - just for logging)
router.post('/logout', authenticate, (req: AuthRequest, res) => {
  // In a stateless JWT system, logout is handled client-side
  // This endpoint is just for logging/analytics
  res.json({ message: 'Logged out successfully' });
});

export default router;
