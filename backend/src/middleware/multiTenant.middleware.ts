import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    organizationId: string;
    organizationRole?: string;
    permissions?: string[];
  };
  organization?: {
    id: string;
    name: string;
    subdomain?: string | null;
    plan: string;
  };
}

/**
 * Extract organization from subdomain or header
 */
export const extractOrganization = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let organizationIdentifier: string | null = null;

    // 1. Check subdomain
    const host = req.get('host');
    if (host) {
      const subdomain = host.split('.')[0];
      if (subdomain && subdomain !== 'www' && subdomain !== 'app') {
        organizationIdentifier = subdomain;
      }
    }

    // 2. Check header (for API clients)
    const orgHeader = req.headers['x-organization-id'] as string;
    if (orgHeader) {
      organizationIdentifier = orgHeader;
    }

    // 3. Check query parameter (fallback)
    const orgQuery = req.query.organizationId as string;
    if (orgQuery) {
      organizationIdentifier = orgQuery;
    }

    if (!organizationIdentifier) {
      // For public routes or super admin routes
      return next();
    }

    // Find organization
    const organization = await prisma.organization.findFirst({
      where: {
        OR: [
          { id: organizationIdentifier },
          { subdomain: organizationIdentifier },
          { code: organizationIdentifier }
        ],
        isActive: true
      }
    });

    if (!organization) {
      throw new UnauthorizedError('Organization not found');
    }

    req.organization = organization;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Multi-tenant authentication middleware
 */
export const multiTenantAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Get user with organization details
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        userOrganizations: {
          where: {
            organizationId: req.organization?.id || decoded.organizationId
          },
          include: {
            role: true,
            organization: true
          }
        }
      }
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }

    // Check if user belongs to the organization
    const userOrg = user.userOrganizations[0];
    if (!userOrg && req.organization) {
      throw new ForbiddenError('User does not belong to this organization');
    }

    // Set user context
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: userOrg?.organizationId || user.organizationId!,
      organizationRole: userOrg?.role.name,
      permissions: userOrg?.role.permissions as string[]
    };

    // Update organization context if not set
    if (!req.organization && userOrg) {
      req.organization = userOrg.organization;
    }

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(error);
    }
  }
};

/**
 * Permission check middleware
 */
export const requirePermission = (permission: string | string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const permissions = Array.isArray(permission) ? permission : [permission];
    const userPermissions = req.user?.permissions || [];

    const hasPermission = permissions.some(p => 
      userPermissions.includes(p) || 
      userPermissions.includes('*') // Super permission
    );

    if (!hasPermission) {
      throw new ForbiddenError(`Missing required permission: ${permissions.join(', ')}`);
    }

    next();
  };
};

/**
 * Organization data isolation middleware
 */
export const enforceOrganizationScope = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.organizationId) {
    throw new UnauthorizedError('Organization context required');
  }

  // Inject organizationId into all query bodies
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    req.body.organizationId = req.user.organizationId;
  }

  // Add organizationId to query parameters
  if (req.method === 'GET') {
    req.query.organizationId = req.user.organizationId;
  }

  next();
};

/**
 * Super admin authentication
 */
export const superAdminAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (!decoded.isSuperAdmin) {
      throw new ForbiddenError('Super admin access required');
    }

    const superAdmin = await prisma.superAdmin.findUnique({
      where: { id: decoded.userId }
    });

    if (!superAdmin || !superAdmin.isActive) {
      throw new UnauthorizedError('Super admin not found or inactive');
    }

    req.user = {
      id: superAdmin.id,
      email: superAdmin.email,
      role: 'SUPER_ADMIN',
      organizationId: '', // Super admin has no specific org
      permissions: ['*'] // All permissions
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(error);
    }
  }
};
