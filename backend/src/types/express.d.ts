import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        isSuperAdmin: boolean;
        isActive: boolean;
      };
      organizationId?: string;
      currentOrganization?: {
        id: string;
        name: string;
        slug: string;
        planId: string;
      };
      userRole?: {
        id: string;
        name: string;
        permissions: string[];
      };
    }
  }
}

export {};
