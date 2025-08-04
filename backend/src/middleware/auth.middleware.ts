import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors';
import { AuthRequest } from '../types/auth.types';

// Re-export AuthRequest for backward compatibility
export type { AuthRequest };

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Normalize user object
    req.user = {
      id: decoded.userId || decoded.id,
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      role: decoded.role,
      organizationId: decoded.organizationId,
      roleId: decoded.roleId,
      permissions: decoded.permissions || [],
      isSuperAdmin: decoded.isSuperAdmin || false,
      isActive: decoded.isActive !== false
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Token expired'));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedError('Invalid token'));
    }
    next(error);
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Not authenticated'));
    }
    
    if (req.user.isSuperAdmin) {
      return next();
    }
    
    const userRole = req.user.role || req.user.organizationRole;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return next(new UnauthorizedError('Insufficient permissions'));
    }
    
    next();
  };
};

export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Not authenticated'));
    }
    
    if (req.user.isSuperAdmin) {
      return next();
    }
    
    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return next(new UnauthorizedError(`Missing required permission: ${permission}`));
    }
    
    next();
  };
};
