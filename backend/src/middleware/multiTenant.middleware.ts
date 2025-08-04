// Re-export from the main multi-tenant middleware for backward compatibility
export * from './multi-tenant.middleware';

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types';

export interface AuthenticatedRequest extends AuthRequest {}

export const superAdminAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }
  
  if (!req.user.isSuperAdmin) {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Super admin access required'
      }
    });
  }
  
  return next();
};
