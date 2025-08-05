import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types';
import { BadRequestError } from '../utils/errors';

// Middleware to ensure organization context is available
export const ensureOrganizationContext = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Check if user already has organizationId from JWT
  let organizationId = req.user?.organizationId;
  
  // For Super Admin, allow overriding via header or use default
  if (!organizationId && req.user?.isSuperAdmin) {
    // Try to get from X-Organization-ID header
    organizationId = req.headers['x-organization-id'] as string;
    
    // If still no organization ID, use Demo organization as default
    if (!organizationId) {
      organizationId = '43c973a6-5e20-43af-a295-805f1d7c86b1'; // Demo Soccer Club ID
    }
    
    // Set it on the user object for downstream use
    req.user.organizationId = organizationId;
  }
  
  // If still no organizationId, throw error
  if (!organizationId) {
    throw new BadRequestError('Organization ID required');
  }
  
  // Set organization context on request
  req.organization = {
    id: organizationId,
    name: '', // Could be populated from DB if needed
    code: ''  // Could be populated from DB if needed
  };
  
  next();
};

// Helper function to get organizationId from request
export const getOrganizationId = (req: AuthRequest): string => {
  // First check if it's already set by middleware
  if (req.user?.organizationId) {
    return req.user.organizationId;
  }
  
  // For Super Admin, check header or use default
  if (req.user?.isSuperAdmin) {
    const headerOrgId = req.headers['x-organization-id'] as string;
    return headerOrgId || '43c973a6-5e20-43af-a295-805f1d7c86b1'; // Demo Soccer Club ID
  }
  
  throw new BadRequestError('Organization ID required');
};
