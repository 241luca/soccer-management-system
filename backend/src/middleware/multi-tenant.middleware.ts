import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types';
import { authenticate as authMiddleware } from './auth.middleware';

// Re-export for compatibility
export type { AuthRequest };
export interface AuthenticatedRequest extends AuthRequest {}

// Re-export authenticate
export const authenticate = authMiddleware;

export const extractOrganization = (req: AuthRequest, res: Response, next: NextFunction) => {
  const organizationId = 
    req.headers['x-organization-id'] as string ||
    req.user?.organizationId ||
    null;
  
  if (organizationId) {
    req.organization = {
      id: organizationId,
      name: '',
      code: ''
    };
  }
  
  next();
};

export const requireOrganization = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.organizationId && !req.organization?.id) {
    return res.status(400).json({
      error: {
        code: 'ORGANIZATION_REQUIRED',
        message: 'Organization context is required'
      }
    });
  }
  return next();
};

export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.isSuperAdmin) {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Super admin access required'
      }
    });
  }
  return next();
};

export const requirePermissions = (...permissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (req.user.isSuperAdmin) {
      return next();
    }
    
    const hasPermission = permissions.some(p => 
      req.user?.permissions?.includes(p)
    );
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    return next();
  };
};

export const multiTenantContext = extractOrganization;
