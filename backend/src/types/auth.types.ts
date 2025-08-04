import { Request } from 'express';

// Unified AuthRequest interface for the entire application
export interface AuthRequest extends Request {
  user?: {
    id: string;
    userId?: string; // For backward compatibility
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    organizationId?: string;
    organizationRole?: string;
    roleId?: string;
    permissions?: string[];
    isSuperAdmin?: boolean;
    isActive?: boolean;
  };
  organization?: {
    id: string;
    name: string;
    code: string;
  };
}

// For authenticated requests
export interface AuthenticatedRequest extends AuthRequest {
  user: {
    id: string;
    userId?: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    organizationId: string;
    organizationRole?: string;
    roleId?: string;
    permissions?: string[];
    isSuperAdmin?: boolean;
    isActive?: boolean;
  };
}

// Export for backward compatibility
export type { AuthRequest as IAuthRequest };
