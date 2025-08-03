import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    organizationId?: string;
    roleId?: string;
    permissions?: string[];
    isSuperAdmin?: boolean;
  };
  organization?: {
    id: string;
    name: string;
    subdomain: string;
    plan: string;
    isActive: boolean;
  };
}

/**
 * Extract organization from subdomain or header
 */
export async function extractOrganization(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let organizationId: string | null = null;
    let subdomain: string | null = null;

    // 1. Check subdomain from host
    const host = req.get('host');
    if (host) {
      const hostParts = host.split('.');
      if (hostParts.length >= 2) {
        // Extract subdomain (e.g., "demo" from "demo.soccermanager.com")
        subdomain = hostParts[0];
        
        // Skip if it's a common subdomain like www, api, etc.
        const skipSubdomains = ['www', 'api', 'admin', 'app'];
        if (!skipSubdomains.includes(subdomain)) {
          const org = await prisma.organization.findUnique({
            where: { subdomain }
          });
          
          if (org) {
            organizationId = org.id;
            req.organization = {
              id: org.id,
              name: org.name,
              subdomain: org.subdomain || '',
              plan: org.plan,
              isActive: org.isActive
            };
          }
        }
      }
    }

    // 2. Check X-Organization-ID header (overrides subdomain)
    const headerOrgId = req.get('X-Organization-ID');
    if (headerOrgId) {
      const org = await prisma.organization.findUnique({
        where: { id: headerOrgId }
      });
      
      if (org) {
        organizationId = org.id;
        req.organization = {
          id: org.id,
          name: org.name,
          subdomain: org.subdomain || '',
          plan: org.plan,
          isActive: org.isActive
        };
      }
    }

    // 3. Check JWT token for organization context
    const authHeader = req.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        if (decoded.organizationId && !organizationId) {
          const org = await prisma.organization.findUnique({
            where: { id: decoded.organizationId }
          });
          
          if (org) {
            organizationId = org.id;
            req.organization = {
              id: org.id,
              name: org.name,
              subdomain: org.subdomain || '',
              plan: org.plan,
              isActive: org.isActive
            };
          }
        }
      } catch (error) {
        // Token might be invalid, but we continue as organization might be public
      }
    }

    next();
  } catch (error) {
    logger.error('Error extracting organization:', error);
    next(error);
  }
}

/**
 * Authenticate user from JWT token
 */
export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.slice(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Set user context
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        organizationId: decoded.organizationId,
        roleId: decoded.roleId,
        permissions: decoded.permissions || [],
        isSuperAdmin: decoded.isSuperAdmin || false
      };

      // Verify user still exists and is active
      if (decoded.isSuperAdmin) {
        const superAdmin = await prisma.superAdmin.findUnique({
          where: { id: decoded.userId }
        });

        if (!superAdmin || !superAdmin.isActive) {
          throw new UnauthorizedError('Invalid user');
        }
      } else {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId }
        });

        if (!user || !user.isActive) {
          throw new UnauthorizedError('Invalid user');
        }

        // If organization is required, verify access
        if (req.organization && decoded.organizationId !== req.organization.id) {
          // Check if user has access to this organization
          const userOrg = await prisma.userOrganization.findUnique({
            where: {
              userId_organizationId: {
                userId: decoded.userId,
                organizationId: req.organization.id
              }
            },
            include: {
              role: true
            }
          });

          if (!userOrg) {
            throw new ForbiddenError('Access denied to this organization');
          }

          // Update user context with correct organization permissions
          req.user.organizationId = req.organization.id;
          req.user.roleId = userOrg.roleId;
          req.user.permissions = userOrg.role.permissions as string[];
        }
      }

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token');
      } else if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expired');
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Require organization context
 */
export function requireOrganization(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.organization) {
    return next(new ForbiddenError('Organization context required'));
  }

  if (!req.organization.isActive) {
    return next(new ForbiddenError('Organization is not active'));
  }

  next();
}

/**
 * Require specific permissions
 */
export function requirePermissions(...permissions: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Super admins bypass all permission checks
    if (req.user?.isSuperAdmin) {
      return next();
    }

    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = permissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return next(new ForbiddenError(`Missing required permissions: ${permissions.join(', ')}`));
    }

    next();
  };
}

/**
 * Require super admin access
 */
export function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user?.isSuperAdmin) {
    return next(new ForbiddenError('Super admin access required'));
  }

  next();
}

/**
 * Optional authentication - doesn't fail if no token
 */
export async function optionalAuthenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    // If token is present, validate it
    await authenticate(req, res, next);
  } catch (error) {
    // If authentication fails, continue without user context
    next();
  }
}

/**
 * Apply organization filter to Prisma queries
 */
export function applyOrganizationFilter(query: any, organizationId: string) {
  return {
    ...query,
    where: {
      ...query.where,
      organizationId
    }
  };
}
