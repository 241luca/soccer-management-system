import { PrismaClient, SuperAdmin, Organization, Plan } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ConflictError, NotFoundError, ForbiddenError } from '../utils/errors';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface CreateSuperAdminInput {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

interface CreatePlanInput {
  name: string;
  price: number;
  maxUsers: number;
  maxAthletes: number;
  maxTeams: number;
  features: any;
  isActive?: boolean;
}

interface OrganizationFilters {
  isActive?: boolean;
  plan?: string;
  search?: string;
}

class SuperAdminService {
  // Create super admin user
  async createSuperAdmin(data: CreateSuperAdminInput) {
    // Check if email already exists in SuperAdmin
    const existingSuper = await prisma.superAdmin.findUnique({
      where: { email: data.email }
    });

    if (existingSuper) {
      throw new ConflictError('Super admin with this email already exists');
    }

    // Check if email exists in regular users
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const superAdmin = await prisma.superAdmin.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        passwordHash: hashedPassword,
        isActive: true
      }
    });

    logger.info(`Super admin ${superAdmin.email} created`);
    return superAdmin;
  }

  // Get all organizations
  async getAllOrganizations(filters?: OrganizationFilters) {
    const where: any = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.plan) {
      where.plan = filters.plan;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { subdomain: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const organizations = await prisma.organization.findMany({
      where,
      include: {
        _count: {
          select: {
            userOrganizations: true,
            teams: true,
            athletes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return organizations;
  }

  // Get system statistics
  async getSystemStats() {
    const [
      totalOrganizations,
      activeOrganizations,
      totalUsers,
      totalAthletes,
      totalMatches,
      totalRevenue
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.organization.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.athlete.count(),
      prisma.match.count(),
      prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true }
      })
    ]);

    // Get organizations by plan
    const organizationsByPlan = await prisma.organization.groupBy({
      by: ['plan'],
      _count: true
    });

    // Get growth data (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyGrowth = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count
      FROM "Organization"
      WHERE "createdAt" >= ${twelveMonthsAgo}
      GROUP BY month
      ORDER BY month
    `;

    return {
      organizations: {
        total: totalOrganizations,
        active: activeOrganizations
      },
      users: totalUsers,
      athletes: totalAthletes,
      matches: totalMatches,
      revenue: totalRevenue._sum?.amount || 0,
      organizationsByPlan,
      monthlyGrowth
    };
  }

  // Plan management
  async createPlan(data: CreatePlanInput) {
    const plan = await prisma.plan.create({
      data: {
        name: data.name,
        price: data.price,
        maxUsers: data.maxUsers,
        maxAthletes: data.maxAthletes,
        maxTeams: data.maxTeams,
        features: data.features,
        isActive: data.isActive ?? true
      }
    });

    logger.info(`Plan ${plan.name} created`);
    return plan;
  }

  async updatePlan(id: string, data: Partial<CreatePlanInput>) {
    const plan = await prisma.plan.update({
      where: { id },
      data
    });

    logger.info(`Plan ${plan.name} updated`);
    return plan;
  }

  async deletePlan(id: string) {
    // Check if any organizations are using this plan
    const orgsUsingPlan = await prisma.organization.count({
      where: { plan: id }
    });

    if (orgsUsingPlan > 0) {
      throw new ConflictError(`Cannot delete plan: ${orgsUsingPlan} organizations are using it`);
    }

    await prisma.plan.delete({
      where: { id }
    });

    logger.info(`Plan ${id} deleted`);
  }

  async getAllPlans(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };
    
    const plans = await prisma.plan.findMany({
      where,
      orderBy: {
        price: 'asc'
      }
    });

    return plans;
  }

  // Organization management
  async toggleOrganizationStatus(organizationId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!org) {
      throw new NotFoundError('Organization not found');
    }

    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        isActive: !org.isActive
      }
    });

    logger.info(`Organization ${updated.name} ${updated.isActive ? 'activated' : 'deactivated'}`);
    return updated;
  }

  async changeOrganizationPlan(organizationId: string, planName: string) {
    // Verify plan exists
    const plan = await prisma.plan.findUnique({
      where: { name: planName }
    });

    if (!plan) {
      throw new NotFoundError('Plan not found');
    }

    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: { 
        plan: planName,
        maxUsers: plan.maxUsers,
        maxAthletes: plan.maxAthletes,
        maxTeams: plan.maxTeams
      }
    });

    logger.info(`Organization ${updated.name} moved to plan ${plan.name}`);
    return updated;
  }

  // User management
  async getAllUsers(filters?: { search?: string; isSuperAdmin?: boolean }) {
    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        userOrganizations: {
          include: {
            organization: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return users;
  }

  async toggleUserStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: !user.isActive
      }
    });

    logger.info(`User ${updated.email} ${updated.isActive ? 'activated' : 'deactivated'}`);
    return updated;
  }

  // Audit logs
  async getAuditLogs(filters?: { 
    organizationId?: string; 
    userId?: string; 
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (filters?.organizationId) {
      where.organizationId = filters.organizationId;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.action) {
      where.action = filters.action;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: true,
        organization: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1000
    });

    return logs;
  }

  // System health check
  async getSystemHealth() {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;
      
      // Get basic metrics
      const dbSize = await prisma.$queryRaw`
        SELECT pg_database_size(current_database()) as size
      `;

      // Check for any critical errors in last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      return {
        status: 'healthy',
        database: {
          connected: true,
          size: dbSize
        },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  // Backup management (placeholder)
  async createBackup() {
    // This would trigger a backup process
    logger.info('Backup requested');
    return {
      message: 'Backup process initiated',
      timestamp: new Date()
    };
  }

  // Maintenance mode
  async setMaintenanceMode(enabled: boolean, message?: string) {
    // This would need to be stored in a cache or config
    logger.info(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`);
    return {
      enabled,
      message,
      timestamp: new Date()
    };
  }
}

export const superAdminService = new SuperAdminService();
