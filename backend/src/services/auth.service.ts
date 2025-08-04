import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, User, Organization } from '@prisma/client';
import { UnauthorizedError, ConflictError, BadRequestError, ForbiddenError } from '../utils/errors';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_ROLES } from '../types/permissions';

const prisma = new PrismaClient();

export interface LoginInput {
  email: string;
  password: string;
  organizationId?: string; // Optional - for multi-org users
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  organizationName?: string; // For creating new org
  organizationId?: string;   // For joining existing org
  invitationToken?: string;  // For invitation-based signup
}

export interface SwitchOrganizationInput {
  userId: string;
  organizationId: string;
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET!;
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
  private readonly JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  private readonly SALT_ROUNDS = 10;
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCK_TIME = 30 * 60 * 1000; // 30 minutes

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        userOrganizations: {
          include: {
            organization: true,
            role: true
          }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedError('Account is locked. Please try again later.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      // Increment failed login attempts
      await this.handleFailedLogin(user.id);
      throw new UnauthorizedError('Invalid credentials');
    }

    // Determine organization context
    let organizationId: string;
    let organization: Organization;
    let userRole: any;

    if (data.organizationId) {
      // Specific organization requested
      const userOrg = user.userOrganizations.find(uo => 
        uo.organizationId === data.organizationId
      );

      if (!userOrg) {
        throw new ForbiddenError('User does not belong to this organization');
      }

      organizationId = userOrg.organizationId;
      organization = userOrg.organization;
      userRole = userOrg.role;
    } else if (user.userOrganizations.length === 1) {
      // Single organization - use it
      const userOrg = user.userOrganizations[0];
      organizationId = userOrg.organizationId;
      organization = userOrg.organization;
      userRole = userOrg.role;
    } else if (user.userOrganizations.length > 1) {
      // Multiple organizations - find default
      const defaultOrg = user.userOrganizations.find(uo => uo.isDefault);
      if (defaultOrg) {
        organizationId = defaultOrg.organizationId;
        organization = defaultOrg.organization;
        userRole = defaultOrg.role;
      } else {
        // Return list of organizations for user to choose
        return {
          requiresOrganizationSelection: true,
          organizations: user.userOrganizations.map(uo => ({
            id: uo.organization.id,
            name: uo.organization.name,
            subdomain: uo.organization.subdomain,
            role: uo.role.name
          }))
        };
      }
    } else {
      throw new UnauthorizedError('User has no organization access');
    }

    // Check if organization is active
    if (!organization.isActive) {
      throw new ForbiddenError('Organization is not active');
    }

    // Reset failed login attempts
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date()
      }
    });

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      organizationId,
      roleId: userRole.id,
      permissions: userRole.permissions
    });

    logger.info(`User ${user.email} logged in to organization ${organization.name}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: userRole.name,
        permissions: userRole.permissions
      },
      organization: {
        id: organization.id,
        name: organization.name,
        subdomain: organization.subdomain,
        plan: organization.plan
      },
      ...tokens
    };
  }

  async register(data: RegisterInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Handle invitation-based signup
    if (data.invitationToken) {
      return this.registerWithInvitation(data);
    }

    // Handle new organization creation
    if (data.organizationName) {
      return this.registerWithNewOrganization(data);
    }

    // Regular registration (joining existing org)
    if (!data.organizationId) {
      throw new BadRequestError('Organization ID or name required');
    }

    const organization = await prisma.organization.findUnique({
      where: { id: data.organizationId }
    });

    if (!organization) {
      throw new BadRequestError('Invalid organization ID');
    }

    // Check organization user limit
    const userCount = await prisma.userOrganization.count({
      where: { organizationId: organization.id }
    });

    if (userCount >= organization.maxUsers) {
      throw new ForbiddenError('Organization has reached user limit');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    // Create user and assign default role
    const defaultRole = await prisma.role.findFirst({
      where: {
        organizationId: organization.id,
        name: 'Staff'
      }
    });

    if (!defaultRole) {
      throw new Error('Default role not found');
    }

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        userOrganizations: {
          create: {
            organizationId: organization.id,
            roleId: defaultRole.id,
            isDefault: true
          }
        }
      },
      include: {
        userOrganizations: {
          include: {
            organization: true,
            role: true
          }
        }
      }
    });

    logger.info(`New user registered: ${user.email} for organization ${organization.name}`);

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      organizationId: organization.id,
      roleId: defaultRole.id,
      permissions: defaultRole.permissions as string[]
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: defaultRole.name
      },
      organization: {
        id: organization.id,
        name: organization.name,
        subdomain: organization.subdomain
      },
      ...tokens
    };
  }

  private async registerWithNewOrganization(data: RegisterInput) {
    const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    // Generate unique subdomain
    const subdomain = data.organizationName!
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Ensure subdomain is unique
    let finalSubdomain = subdomain;
    let counter = 1;
    while (await prisma.organization.findUnique({ where: { subdomain: finalSubdomain } })) {
      finalSubdomain = `${subdomain}-${counter}`;
      counter++;
    }

    // Create organization with default roles and settings
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: data.organizationName!,
          code: finalSubdomain.toUpperCase(),
          subdomain: finalSubdomain,
          plan: 'trial',
          isTrial: true,
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          billingEmail: data.email
        }
      });

      // Create default roles
      const roles = await Promise.all(
        DEFAULT_ROLES.map(roleTemplate =>
          tx.role.create({
            data: {
              organizationId: organization.id,
              name: roleTemplate.name,
              description: roleTemplate.description,
              permissions: roleTemplate.permissions,
              isSystem: true
            }
          })
        )
      );

      const adminRole = roles.find(r => r.name === 'Admin')!;

      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          userOrganizations: {
            create: {
              organizationId: organization.id,
              roleId: adminRole.id,
              isDefault: true
            }
          }
        }
      });

      // Create default settings
      await this.createDefaultOrganizationData(tx, organization.id);

      return { user, organization, role: adminRole };
    });

    logger.info(`New organization created: ${result.organization.name} with admin ${result.user.email}`);

    const tokens = this.generateTokens({
      userId: result.user.id,
      email: result.user.email,
      organizationId: result.organization.id,
      roleId: result.role.id,
      permissions: result.role.permissions as string[]
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.role.name
      },
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        subdomain: result.organization.subdomain,
        plan: result.organization.plan
      },
      ...tokens
    };
  }

  private async registerWithInvitation(data: RegisterInput) {
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { token: data.invitationToken! },
      include: {
        organization: true,
        role: true
      }
    });

    if (!invitation || invitation.expiresAt < new Date()) {
      throw new BadRequestError('Invalid or expired invitation');
    }

    if (invitation.acceptedAt) {
      throw new BadRequestError('Invitation already used');
    }

    if (invitation.email !== data.email) {
      throw new BadRequestError('Email does not match invitation');
    }

    const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        userOrganizations: {
          create: {
            organizationId: invitation.organizationId,
            roleId: invitation.roleId,
            isDefault: true
          }
        }
      }
    });

    // Mark invitation as accepted
    await prisma.organizationInvitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() }
    });

    logger.info(`User ${user.email} joined organization ${invitation.organization.name} via invitation`);

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      organizationId: invitation.organizationId,
      roleId: invitation.roleId,
      permissions: invitation.role.permissions as string[]
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: invitation.role.name
      },
      organization: {
        id: invitation.organization.id,
        name: invitation.organization.name,
        subdomain: invitation.organization.subdomain
      },
      ...tokens
    };
  }

  async switchOrganization(data: SwitchOrganizationInput) {
    const userOrg = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: data.userId,
          organizationId: data.organizationId
        }
      },
      include: {
        organization: true,
        role: true,
        user: true
      }
    });

    if (!userOrg) {
      throw new ForbiddenError('User does not belong to this organization');
    }

    if (!userOrg.organization.isActive) {
      throw new ForbiddenError('Organization is not active');
    }

    // Update default organization if requested
    await prisma.$transaction([
      prisma.userOrganization.updateMany({
        where: { userId: data.userId },
        data: { isDefault: false }
      }),
      prisma.userOrganization.update({
        where: {
          userId_organizationId: {
            userId: data.userId,
            organizationId: data.organizationId
          }
        },
        data: { isDefault: true }
      })
    ]);

    const tokens = this.generateTokens({
      userId: data.userId,
      email: userOrg.user.email,
      organizationId: userOrg.organizationId,
      roleId: userOrg.roleId,
      permissions: userOrg.role.permissions as string[]
    });

    logger.info(`User ${data.userId} switched to organization ${userOrg.organization.name}`);

    return {
      organization: {
        id: userOrg.organization.id,
        name: userOrg.organization.name,
        subdomain: userOrg.organization.subdomain,
        plan: userOrg.organization.plan
      },
      role: userOrg.role.name,
      permissions: userOrg.role.permissions,
      ...tokens
    };
  }

  async getUserOrganizations(userId: string) {
    const userOrgs = await prisma.userOrganization.findMany({
      where: { userId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            logoUrl: true,
            plan: true,
            isActive: true
          }
        },
        role: {
          select: {
            name: true,
            permissions: true
          }
        }
      }
    });

    return userOrgs
      .filter(uo => uo.organization.isActive)
      .map(uo => ({
        id: uo.organization.id,
        name: uo.organization.name,
        subdomain: uo.organization.subdomain,
        logoUrl: uo.organization.logoUrl,
        plan: uo.organization.plan,
        role: uo.role.name,
        permissions: uo.role.permissions,
        isDefault: uo.isDefault
      }));
  }

  private generateTokens(payload: any) {
    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(
      { userId: payload.userId, organizationId: payload.organizationId },
      this.JWT_REFRESH_SECRET,
      { expiresIn: this.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
    );

    return { accessToken, refreshToken };
  }

  private async handleFailedLogin(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return;

    const attempts = user.failedLoginAttempts + 1;
    const updateData: any = { failedLoginAttempts: attempts };

    if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
      updateData.lockedUntil = new Date(Date.now() + this.LOCK_TIME);
      logger.warn(`Account locked for user ${user.email} after ${attempts} failed attempts`);
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData
    });
  }

  private async createDefaultOrganizationData(tx: any, organizationId: string) {
    // Create default document types
    await tx.documentType.createMany({
      data: [
        {
          organizationId,
          name: 'Certificato Medico',
          category: 'medical',
          isRequired: true,
          validityDays: 365,
          reminderDays: [30, 15, 7]
        },
        {
          organizationId,
          name: 'Documento Identità',
          category: 'identity',
          isRequired: true,
          validityDays: 1825, // 5 years
          reminderDays: [60, 30]
        },
        {
          organizationId,
          name: 'Tesserino FIGC',
          category: 'federation',
          isRequired: false,
          validityDays: 365,
          reminderDays: [30, 15]
        }
      ]
    });

    // Create default payment types
    await tx.paymentType.createMany({
      data: [
        {
          organizationId,
          name: 'Quota Iscrizione',
          amount: 150,
          frequency: 'annual',
          category: 'membership'
        },
        {
          organizationId,
          name: 'Quota Mensile',
          amount: 50,
          frequency: 'monthly',
          category: 'membership'
        },
        {
          organizationId,
          name: 'Trasporto',
          amount: 30,
          frequency: 'monthly',
          category: 'transport'
        }
      ]
    });

    // Create default positions
    await tx.position.createMany({
      data: [
        { organizationId, name: 'Portiere', sortOrder: 1 },
        { organizationId, name: 'Difensore', sortOrder: 2 },
        { organizationId, name: 'Centrocampista', sortOrder: 3 },
        { organizationId, name: 'Attaccante', sortOrder: 4 }
      ]
    });
  }

  // Super Admin methods
    async loginSuperAdmin(email: string, password: string) {
    // Check if it's a valid superadmin email
    const SUPER_ADMIN_EMAILS = ['superadmin@soccermanager.com'];
    
    if (!SUPER_ADMIN_EMAILS.includes(email)) {
      throw new UnauthorizedError('Invalid super admin credentials');
    }

    // Find user in regular User table
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate super admin token without organization context
    const payload = {
      userId: user.id,
      email: user.email,
      isSuperAdmin: true,
      permissions: ['*'] // All permissions
    };

    const accessToken = jwt.sign(
      payload,
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      payload,
      this.JWT_REFRESH_SECRET,
      { expiresIn: this.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
    );

    logger.info(`Super admin ${user.email} logged in`);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: 'SUPER_ADMIN',
        isSuperAdmin: true
      },
      accessToken,
      refreshToken
    };
  }

  async validateUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as any;
      
      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          userOrganizations: {
            where: { organizationId: decoded.organizationId },
            include: { role: true }
          }
        }
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const userOrg = user.userOrganizations[0];
      if (!userOrg) {
        throw new UnauthorizedError('User no longer has access to organization');
      }

      // Generate new tokens
      const tokens = this.generateTokens({
        userId: user.id,
        email: user.email,
        organizationId: decoded.organizationId,
        roleId: userOrg.roleId,
        permissions: userOrg.role.permissions
      });

      return tokens;
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }
}

export const authService = new AuthService();
