import { PrismaClient, User, Prisma } from '@prisma/client';
import { NotFoundError, BadRequestError, UnauthorizedError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';
import { notificationService } from './notification.service';

const prisma = new PrismaClient();

export interface SystemSettings {
  general: {
    organizationName: string;
    organizationCode: string;
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    timezone: string;
    locale: string;
  };
  features: {
    enableTransport: boolean;
    enableDocuments: boolean;
    enablePayments: boolean;
    enableNotifications: boolean;
    enableMatches: boolean;
    enableAIAssistant: boolean;
  };
  limits: {
    maxAthletes: number;
    maxTeams: number;
    maxCoaches: number;
    maxDocumentSize: number; // MB
    documentRetentionDays: number;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    defaultReminderDays: number[];
  };
  payments: {
    currency: string;
    taxRate: number;
    lateFeePercentage: number;
    gracePeriodDays: number;
  };
  security: {
    passwordMinLength: number;
    passwordRequireUppercase: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireSpecial: boolean;
    sessionTimeout: number; // minutes
    maxLoginAttempts: number;
    lockoutDuration: number; // minutes
  };
}

export interface CreateUserInput {
  email: string;
  password: string;
  role: 'ADMIN' | 'COACH' | 'STAFF' | 'PARENT' | 'ATHLETE';
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface UpdateUserInput extends Partial<Omit<CreateUserInput, 'password'>> {
  isActive?: boolean;
  newPassword?: string;
}

export interface BackupOptions {
  includeDocuments: boolean;
  includePayments: boolean;
  includeMatches: boolean;
  includeAuditLogs: boolean;
}

export class AdminService {
  // System Settings Management
  async getSettings(organizationId: string): Promise<SystemSettings> {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      throw NotFoundError('Organization');
    }

    // Merge stored settings with defaults
    const defaultSettings = this.getDefaultSettings();
    const storedSettings = organization.settings as any || {};

    return {
      general: {
        ...defaultSettings.general,
        ...storedSettings.general,
        organizationName: organization.name,
        organizationCode: organization.code,
        logoUrl: organization.logoUrl
      },
      features: {
        ...defaultSettings.features,
        ...storedSettings.features
      },
      limits: {
        ...defaultSettings.limits,
        ...storedSettings.limits
      },
      notifications: {
        ...defaultSettings.notifications,
        ...storedSettings.notifications
      },
      payments: {
        ...defaultSettings.payments,
        ...storedSettings.payments
      },
      security: {
        ...defaultSettings.security,
        ...storedSettings.security
      }
    };
  }

  async updateSettings(organizationId: string, settings: Partial<SystemSettings>) {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      throw NotFoundError('Organization');
    }

    const currentSettings = await this.getSettings(organizationId);
    const updatedSettings = {
      ...currentSettings,
      ...settings
    };

    // Extract organization-level fields
    const { organizationName, organizationCode, logoUrl, ...systemSettings } = updatedSettings.general;

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: organizationName,
        code: organizationCode,
        logoUrl,
        settings: {
          ...systemSettings,
          features: updatedSettings.features,
          limits: updatedSettings.limits,
          notifications: updatedSettings.notifications,
          payments: updatedSettings.payments,
          security: updatedSettings.security
        }
      }
    });

    logger.info(`System settings updated for organization ${organizationId}`);

    await notificationService.create({
      organizationId,
      type: 'system_settings_changed',
      severity: 'info',
      title: 'Impostazioni Sistema Aggiornate',
      message: 'Le impostazioni del sistema sono state modificate da un amministratore',
      isPersistent: false
    });

    return updatedSettings;
  }

  // User Management
  async findAllUsers(organizationId: string, params?: {
    role?: string;
    isActive?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: Prisma.UserWhereInput = {
      organizationId,
      ...(params?.role && { role: params.role as any }),
      ...(params?.isActive !== undefined && { isActive: params.isActive }),
      ...(params?.search && {
        OR: [
          { firstName: { contains: params.search, mode: 'insensitive' } },
          { lastName: { contains: params.search, mode: 'insensitive' } },
          { email: { contains: params.search, mode: 'insensitive' } }
        ]
      })
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          phone: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          _count: {
            select: {
              auditLogs: true,
              notifications: true
            }
          }
        },
        orderBy: [
          { role: 'asc' },
          { lastName: 'asc' },
          { firstName: 'asc' }
        ],
        take: params?.limit,
        skip: params?.offset
      }),
      prisma.user.count({ where })
    ]);

    return {
      data: users.map(user => ({
        ...user,
        activityCount: user._count.auditLogs,
        notificationCount: user._count.notifications
      })),
      total,
      limit: params?.limit || users.length,
      offset: params?.offset || 0
    };
  }

  async createUser(data: CreateUserInput, organizationId: string, createdBy: string) {
    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      throw BadRequestError('Email already in use');
    }

    // Get security settings
    const settings = await this.getSettings(organizationId);
    this.validatePassword(data.password, settings.security);

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        organizationId
      }
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: createdBy,
        action: 'create',
        entityType: 'user',
        entityId: user.id,
        newValues: {
          email: user.email,
          role: user.role,
          name: `${user.firstName} ${user.lastName}`
        }
      }
    });

    logger.info(`New user created: ${user.email} (${user.role})`);

    // Send welcome notification
    await notificationService.create({
      organizationId,
      userId: user.id,
      type: 'user_welcome',
      severity: 'info',
      title: 'Benvenuto!',
      message: `Il tuo account è stato creato. Ruolo: ${user.role}`,
      isPersistent: true
    });

    return user;
  }

  async updateUser(id: string, data: UpdateUserInput, organizationId: string, updatedBy: string) {
    const user = await prisma.user.findFirst({
      where: { id, organizationId }
    });

    if (!user) {
      throw NotFoundError('User');
    }

    // Prevent self-deactivation for admins
    if (id === updatedBy && data.isActive === false) {
      throw BadRequestError('Cannot deactivate your own account');
    }

    // Handle password update
    let passwordHash = user.passwordHash;
    if (data.newPassword) {
      const settings = await this.getSettings(organizationId);
      this.validatePassword(data.newPassword, settings.security);
      passwordHash = await bcrypt.hash(data.newPassword, 10);
    }

    const oldValues = {
      email: user.email,
      role: user.role,
      isActive: user.isActive
    };

    const updated = await prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        isActive: data.isActive,
        passwordHash,
        ...(data.newPassword && { failedLoginAttempts: 0, lockedUntil: null })
      }
    });

    // Log changes
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: updatedBy,
        action: 'update',
        entityType: 'user',
        entityId: id,
        oldValues,
        newValues: {
          email: updated.email,
          role: updated.role,
          isActive: updated.isActive
        }
      }
    });

    logger.info(`User updated: ${updated.email}`);

    return updated;
  }

  async deleteUser(id: string, organizationId: string, deletedBy: string) {
    const user = await prisma.user.findFirst({
      where: { id, organizationId }
    });

    if (!user) {
      throw NotFoundError('User');
    }

    // Prevent self-deletion
    if (id === deletedBy) {
      throw BadRequestError('Cannot delete your own account');
    }

    // Check if last admin
    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { organizationId, role: 'ADMIN', isActive: true }
      });
      if (adminCount <= 1) {
        throw BadRequestError('Cannot delete the last admin user');
      }
    }

    await prisma.user.delete({ where: { id } });

    // Log deletion
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: deletedBy,
        action: 'delete',
        entityType: 'user',
        entityId: id,
        oldValues: {
          email: user.email,
          role: user.role,
          name: `${user.firstName} ${user.lastName}`
        }
      }
    });

    logger.info(`User deleted: ${user.email}`);

    return { message: 'User deleted successfully' };
  }

  // Audit Logs
  async getAuditLogs(organizationId: string, params?: {
    userId?: string;
    entityType?: string;
    entityId?: string;
    action?: string;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: Prisma.AuditLogWhereInput = {
      organizationId,
      ...(params?.userId && { userId: params.userId }),
      ...(params?.entityType && { entityType: params.entityType }),
      ...(params?.entityId && { entityId: params.entityId }),
      ...(params?.action && { action: params.action }),
      ...(params?.fromDate && { createdAt: { gte: params.fromDate } }),
      ...(params?.toDate && { createdAt: { lte: params.toDate } })
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: params?.limit || 50,
        skip: params?.offset || 0
      }),
      prisma.auditLog.count({ where })
    ]);

    return {
      data: logs,
      total,
      limit: params?.limit || 50,
      offset: params?.offset || 0
    };
  }

  // Backup & Restore
  async createBackup(organizationId: string, options: BackupOptions) {
    logger.info(`Creating backup for organization ${organizationId}`);

    const backup: any = {
      version: '1.0',
      createdAt: new Date(),
      organizationId
    };

    // Include organization data
    backup.organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    // Include core data
    backup.teams = await prisma.team.findMany({ where: { organizationId } });
    backup.athletes = await prisma.athlete.findMany({ where: { organizationId } });
    backup.users = await prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true
      }
    });

    // Include optional data based on options
    if (options.includeDocuments) {
      backup.documentTypes = await prisma.documentType.findMany({ where: { organizationId } });
      backup.documents = await prisma.document.findMany({
        where: { athlete: { organizationId } }
      });
    }

    if (options.includePayments) {
      backup.paymentTypes = await prisma.paymentType.findMany({ where: { organizationId } });
      backup.payments = await prisma.payment.findMany({ where: { organizationId } });
    }

    if (options.includeMatches) {
      backup.competitions = await prisma.competition.findMany({ where: { organizationId } });
      backup.venues = await prisma.venue.findMany({ where: { organizationId } });
      backup.matches = await prisma.match.findMany({ where: { organizationId } });
      backup.matchRosters = await prisma.matchRoster.findMany({
        where: { match: { organizationId } }
      });
      backup.matchStats = await prisma.matchStat.findMany({
        where: { match: { organizationId } }
      });
    }

    if (options.includeAuditLogs) {
      backup.auditLogs = await prisma.auditLog.findMany({ where: { organizationId } });
    }

    // Include transport data
    backup.transportZones = await prisma.transportZone.findMany({ where: { organizationId } });
    backup.buses = await prisma.bus.findMany({ where: { organizationId } });
    backup.busRoutes = await prisma.busRoute.findMany({
      where: { bus: { organizationId } }
    });
    backup.athleteTransports = await prisma.athleteTransport.findMany({
      where: { athlete: { organizationId } }
    });

    logger.info(`Backup created successfully for organization ${organizationId}`);

    return backup;
  }

  async validateBackup(backupData: any): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check version
    if (!backupData.version || backupData.version !== '1.0') {
      errors.push('Invalid or unsupported backup version');
    }

    // Check required fields
    if (!backupData.organizationId) {
      errors.push('Missing organization ID');
    }

    if (!backupData.organization) {
      errors.push('Missing organization data');
    }

    if (!backupData.teams || !Array.isArray(backupData.teams)) {
      errors.push('Missing or invalid teams data');
    }

    if (!backupData.athletes || !Array.isArray(backupData.athletes)) {
      errors.push('Missing or invalid athletes data');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // System Health & Statistics
  async getSystemHealth(organizationId: string) {
    const [
      athleteCount,
      teamCount,
      userCount,
      documentCount,
      paymentCount,
      matchCount,
      dbSize
    ] = await Promise.all([
      prisma.athlete.count({ where: { organizationId } }),
      prisma.team.count({ where: { organizationId } }),
      prisma.user.count({ where: { organizationId } }),
      prisma.document.count({ where: { athlete: { organizationId } } }),
      prisma.payment.count({ where: { organizationId } }),
      prisma.match.count({ where: { organizationId } }),
      this.getDatabaseSize()
    ]);

    const settings = await this.getSettings(organizationId);

    return {
      status: 'healthy',
      timestamp: new Date(),
      database: {
        size: dbSize,
        status: 'connected'
      },
      resources: {
        athletes: {
          used: athleteCount,
          limit: settings.limits.maxAthletes,
          percentage: Math.round((athleteCount / settings.limits.maxAthletes) * 100)
        },
        teams: {
          used: teamCount,
          limit: settings.limits.maxTeams,
          percentage: Math.round((teamCount / settings.limits.maxTeams) * 100)
        },
        users: {
          total: userCount,
          active: await prisma.user.count({ where: { organizationId, isActive: true } })
        }
      },
      data: {
        documents: documentCount,
        payments: paymentCount,
        matches: matchCount
      },
      features: settings.features
    };
  }

  // Helper methods
  private getDefaultSettings(): SystemSettings {
    return {
      general: {
        organizationName: '',
        organizationCode: '',
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e',
        timezone: 'Europe/Rome',
        locale: 'it-IT'
      },
      features: {
        enableTransport: true,
        enableDocuments: true,
        enablePayments: true,
        enableNotifications: true,
        enableMatches: true,
        enableAIAssistant: false
      },
      limits: {
        maxAthletes: 500,
        maxTeams: 20,
        maxCoaches: 50,
        maxDocumentSize: 10,
        documentRetentionDays: 365
      },
      notifications: {
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: false,
        defaultReminderDays: [30, 15, 7]
      },
      payments: {
        currency: 'EUR',
        taxRate: 22,
        lateFeePercentage: 5,
        gracePeriodDays: 7
      },
      security: {
        passwordMinLength: 8,
        passwordRequireUppercase: true,
        passwordRequireNumbers: true,
        passwordRequireSpecial: false,
        sessionTimeout: 60,
        maxLoginAttempts: 5,
        lockoutDuration: 30
      }
    };
  }

  private validatePassword(password: string, securitySettings: SystemSettings['security']) {
    const errors: string[] = [];

    if (password.length < securitySettings.passwordMinLength) {
      errors.push(`Password must be at least ${securitySettings.passwordMinLength} characters`);
    }

    if (securitySettings.passwordRequireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (securitySettings.passwordRequireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (securitySettings.passwordRequireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    if (errors.length > 0) {
      throw BadRequestError(errors.join(', '));
    }
  }

  private async getDatabaseSize(): Promise<string> {
    try {
      // This is a simplified version - in production you'd query actual DB size
      const result = await prisma.$queryRaw<any[]>`
        SELECT pg_database_size(current_database()) as size
      `;
      
      const bytes = result[0]?.size || 0;
      return this.formatBytes(bytes);
    } catch (error) {
      logger.error('Failed to get database size:', error);
      return 'Unknown';
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const adminService = new AdminService();
