import { PrismaClient, Organization, Role, UserOrganization, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { ConflictError, NotFoundError, ForbiddenError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { Permission } from '../types/permissions';

const prisma = new PrismaClient();

// Types
interface CreateOrganizationInput {
  name: string;
  code: string;
  subdomain: string;
  description?: string;
  logoUrl?: string;
  settings?: any;
  plan: string;
  ownerEmail: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerPassword: string;
}

interface UpdateOrganizationInput {
  name?: string;
  logoUrl?: string;
  settings?: any;
  isActive?: boolean;
  billingEmail?: string;
  customDomain?: string;
}

interface CreateRoleInput {
  organizationId: string;
  name: string;
  description?: string;
  permissions: string[];
}

interface InviteUserInput {
  organizationId: string;
  email: string;
  roleId: string;
  invitedBy: string;
}

interface AcceptInvitationInput {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
}

interface UpdateUserRoleInput {
  userId: string;
  organizationId: string;
  roleId: string;
  updatedBy: string;
}

class OrganizationService {
  // Create a new organization with owner
  async createOrganization(data: CreateOrganizationInput) {
    try {
      // Check if organization code already exists
      const existingOrg = await prisma.organization.findFirst({
        where: { 
          OR: [
            { code: data.code },
            { subdomain: data.subdomain }
          ]
        }
      });

      if (existingOrg) {
        throw new ConflictError('Organization code or subdomain already exists');
      }

      // Check if owner email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.ownerEmail }
      });

      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Get plan details from configuration
      const planConfig = {
        basic: { maxUsers: 5, maxAthletes: 50, maxTeams: 3 },
        pro: { maxUsers: 20, maxAthletes: 200, maxTeams: 10 },
        enterprise: { maxUsers: 999, maxAthletes: 9999, maxTeams: 999 }
      };

      const plan = planConfig[data.plan as keyof typeof planConfig];
      if (!plan) {
        throw new NotFoundError('Plan not found');
      }

      // Start transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create organization
        const organization = await tx.organization.create({
          data: {
            name: data.name,
            code: data.code,
            subdomain: data.subdomain,
            logoUrl: data.logoUrl,
            settings: data.settings || {},
            plan: data.plan,
            maxUsers: plan.maxUsers,
            maxAthletes: plan.maxAthletes,
            maxTeams: plan.maxTeams,
            billingEmail: data.ownerEmail,
            isActive: true,
            isTrial: data.plan === 'trial',
            trialEndsAt: data.plan === 'trial' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null
          }
        });

        // Create default roles for organization
        const ownerRole = await tx.role.create({
          data: {
            organizationId: organization.id,
            name: 'Owner',
            description: 'Organization owner with full permissions',
            permissions: [
              'ORGANIZATION_VIEW', 'ORGANIZATION_UPDATE', 'ORGANIZATION_DELETE',
              'USER_VIEW', 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE',
              'ROLE_VIEW', 'ROLE_CREATE', 'ROLE_UPDATE', 'ROLE_DELETE',
              'ATHLETE_VIEW', 'ATHLETE_CREATE', 'ATHLETE_UPDATE', 'ATHLETE_DELETE',
              'TEAM_VIEW', 'TEAM_CREATE', 'TEAM_UPDATE', 'TEAM_DELETE',
              'MATCH_VIEW', 'MATCH_CREATE', 'MATCH_UPDATE', 'MATCH_DELETE',
              'DOCUMENT_VIEW', 'DOCUMENT_CREATE', 'DOCUMENT_UPDATE', 'DOCUMENT_DELETE',
              'PAYMENT_VIEW', 'PAYMENT_CREATE', 'PAYMENT_UPDATE', 'PAYMENT_DELETE',
              'NOTIFICATION_VIEW', 'NOTIFICATION_CREATE', 'NOTIFICATION_UPDATE', 'NOTIFICATION_DELETE',
              'TRANSPORT_VIEW', 'TRANSPORT_CREATE', 'TRANSPORT_UPDATE', 'TRANSPORT_DELETE',
              'REPORT_VIEW', 'REPORT_CREATE',
              'BILLING_VIEW', 'BILLING_UPDATE'
            ],
            isSystem: true
          }
        });

        const adminRole = await tx.role.create({
          data: {
            organizationId: organization.id,
            name: 'Admin',
            description: 'Administrator with most permissions',
            permissions: [
              'ORGANIZATION_VIEW', 'ORGANIZATION_UPDATE',
              'USER_VIEW', 'USER_CREATE', 'USER_UPDATE',
              'ROLE_VIEW',
              'ATHLETE_VIEW', 'ATHLETE_CREATE', 'ATHLETE_UPDATE', 'ATHLETE_DELETE',
              'TEAM_VIEW', 'TEAM_CREATE', 'TEAM_UPDATE', 'TEAM_DELETE',
              'MATCH_VIEW', 'MATCH_CREATE', 'MATCH_UPDATE', 'MATCH_DELETE',
              'DOCUMENT_VIEW', 'DOCUMENT_CREATE', 'DOCUMENT_UPDATE', 'DOCUMENT_DELETE',
              'PAYMENT_VIEW', 'PAYMENT_CREATE', 'PAYMENT_UPDATE',
              'NOTIFICATION_VIEW', 'NOTIFICATION_CREATE', 'NOTIFICATION_UPDATE',
              'TRANSPORT_VIEW', 'TRANSPORT_CREATE', 'TRANSPORT_UPDATE', 'TRANSPORT_DELETE',
              'REPORT_VIEW', 'REPORT_CREATE'
            ],
            isSystem: true
          }
        });

        const coachRole = await tx.role.create({
          data: {
            organizationId: organization.id,
            name: 'Coach',
            description: 'Coach with team and athlete management',
            permissions: [
              'ATHLETE_VIEW', 'ATHLETE_CREATE', 'ATHLETE_UPDATE',
              'TEAM_VIEW', 'TEAM_UPDATE',
              'MATCH_VIEW', 'MATCH_CREATE', 'MATCH_UPDATE',
              'DOCUMENT_VIEW', 'DOCUMENT_CREATE'
            ],
            isSystem: true
          }
        });

        const staffRole = await tx.role.create({
          data: {
            organizationId: organization.id,
            name: 'Staff',
            description: 'Staff with limited permissions',
            permissions: [
              'ATHLETE_VIEW',
              'TEAM_VIEW',
              'MATCH_VIEW',
              'DOCUMENT_VIEW'
            ],
            isSystem: true
          }
        });

        // Hash password
        const hashedPassword = await bcrypt.hash(data.ownerPassword, 10);

        // Create owner user
        const owner = await tx.user.create({
          data: {
            email: data.ownerEmail,
            firstName: data.ownerFirstName,
            lastName: data.ownerLastName,
            passwordHash: hashedPassword,
            organizationId: organization.id,
            role: 'ADMIN',
            isActive: true
          }
        });

        // Link owner to organization with owner role
        await tx.userOrganization.create({
          data: {
            userId: owner.id,
            organizationId: organization.id,
            roleId: ownerRole.id,
            isDefault: true
          }
        });

        // Initialize organization data structures
        await this.initializeOrganizationData(tx, organization.id);

        logger.info(`Organization ${organization.name} created with owner ${owner.email}`);

        return {
          organization,
          owner,
          roles: {
            owner: ownerRole,
            admin: adminRole,
            coach: coachRole,
            staff: staffRole
          }
        };
      });

      return result;
    } catch (error) {
      logger.error('Error creating organization:', error);
      throw error;
    }
  }

  // Initialize default data for new organization
  private async initializeOrganizationData(tx: any, organizationId: string) {
    // Create default teams
    await tx.team.create({
      data: {
        organizationId,
        name: 'Prima Squadra',
        category: 'PRIMA_SQUADRA',
        season: new Date().getFullYear().toString(),
        minAge: 18,
        maxAge: 99,
        isActive: true
      }
    });

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

  // Get organization by ID or subdomain
  async getOrganization(identifier: string) {
    const organization = await prisma.organization.findFirst({
      where: {
        OR: [
          { id: identifier },
          { subdomain: identifier },
          { code: identifier }
        ]
      },
      include: {
        _count: {
          select: {
            userOrganizations: true,
            teams: true,
            athletes: true
          }
        }
      }
    });

    if (!organization) {
      throw new NotFoundError('Organization not found');
    }

    return organization;
  }

  // Update organization
  async updateOrganization(id: string, data: UpdateOrganizationInput) {
    const organization = await prisma.organization.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    logger.info(`Organization ${organization.name} updated`);
    return organization;
  }

  // Delete organization (soft delete)
  async deleteOrganization(id: string) {
    await prisma.organization.update({
      where: { id },
      data: {
        isActive: false
      }
    });

    logger.info(`Organization ${id} soft deleted`);
  }

  // Get organization users
  async getOrganizationUsers(organizationId: string) {
    const userOrgs = await prisma.userOrganization.findMany({
      where: {
        organizationId
      },
      include: {
        user: true,
        role: true
      },
      orderBy: {
        user: {
          createdAt: 'desc'
        }
      }
    });

    return userOrgs;
  }

  // Get user organizations
  async getUserOrganizations(userId: string) {
    const userOrgs = await prisma.userOrganization.findMany({
      where: {
        userId,
        organization: {
          isActive: true
        }
      },
      include: {
        organization: true,
        role: true
      }
    });

    return userOrgs;
  }

  // Create custom role
  async createRole(data: CreateRoleInput) {
    // Verify organization exists
    const org = await this.getOrganization(data.organizationId);

    const role = await prisma.role.create({
      data: {
        organizationId: data.organizationId,
        name: data.name,
        description: data.description,
        permissions: data.permissions,
        isSystem: false
      }
    });

    logger.info(`Role ${role.name} created for organization ${org.name}`);
    return role;
  }

  // Update role
  async updateRole(id: string, data: Partial<CreateRoleInput>) {
    const role = await prisma.role.findUnique({
      where: { id }
    });

    if (!role) {
      throw new NotFoundError('Role not found');
    }

    if (role.isSystem) {
      throw new ForbiddenError('Cannot modify system roles');
    }

    const updated = await prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        permissions: data.permissions
      }
    });

    return updated;
  }

  // Delete role
  async deleteRole(id: string) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            userOrganizations: true
          }
        }
      }
    });

    if (!role) {
      throw new NotFoundError('Role not found');
    }

    if (role.isSystem) {
      throw new ForbiddenError('Cannot delete system roles');
    }

    if (role._count.userOrganizations > 0) {
      throw new ConflictError('Cannot delete role with assigned users');
    }

    await prisma.role.delete({
      where: { id }
    });

    logger.info(`Role ${role.name} deleted`);
  }

  // Invite user to organization
  async inviteUser(data: InviteUserInput) {
    // Check if user already exists in organization
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        userOrganizations: {
          where: { organizationId: data.organizationId }
        }
      }
    });

    if (existingUser && existingUser.userOrganizations.length > 0) {
      throw new ConflictError('User already belongs to this organization');
    }

    // Generate invitation token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.organizationInvitation.create({
      data: {
        organizationId: data.organizationId,
        email: data.email,
        roleId: data.roleId,
        invitedById: data.invitedBy,
        token,
        expiresAt
      },
      include: {
        organization: true,
        role: true
      }
    });

    // TODO: Send invitation email
    logger.info(`Invitation sent to ${data.email} for organization ${invitation.organization.name}`);

    return invitation;
  }

  // Accept invitation
  async acceptInvitation(data: AcceptInvitationInput) {
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { token: data.token },
      include: {
        organization: true,
        role: true
      }
    });

    if (!invitation) {
      throw new NotFoundError('Invalid invitation token');
    }

    if (invitation.acceptedAt) {
      throw new ConflictError('Invitation already accepted');
    }

    if (new Date() > invitation.expiresAt) {
      throw new ValidationError('Invitation has expired');
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check if user exists
      let user = await tx.user.findUnique({
        where: { email: invitation.email }
      });

      if (!user) {
        // Create new user
        const hashedPassword = await bcrypt.hash(data.password, 10);
        user = await tx.user.create({
          data: {
            email: invitation.email,
            firstName: data.firstName,
            lastName: data.lastName,
            passwordHash: hashedPassword,
            isActive: true
          }
        });
      }

      // Add user to organization
      const userOrg = await tx.userOrganization.create({
        data: {
          userId: user.id,
          organizationId: invitation.organizationId,
          roleId: invitation.roleId,
          isDefault: !user.organizationId // Set as default if user has no primary org
        },
        include: {
          organization: true,
          role: true
        }
      });

      // Mark invitation as accepted
      await tx.organizationInvitation.update({
        where: { id: invitation.id },
        data: {
          acceptedAt: new Date()
        }
      });

      logger.info(`User ${user.email} joined organization ${userOrg.organization.name}`);

      return {
        user,
        userOrganization: userOrg
      };
    });

    return result;
  }

  // Remove user from organization
  async removeUser(userId: string, organizationId: string, removedBy: string) {
    // Check if trying to remove self
    if (userId === removedBy) {
      throw new ForbiddenError('Cannot remove yourself from organization');
    }

    // Check if user is owner
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        userId,
        organizationId
      },
      include: {
        role: true
      }
    });

    if (!userOrg) {
      throw new NotFoundError('User not found in organization');
    }

    if (userOrg.role.name === 'Owner') {
      throw new ForbiddenError('Cannot remove organization owner');
    }

    // Delete user organization relationship
    await prisma.userOrganization.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId
        }
      }
    });

    logger.info(`User ${userId} removed from organization ${organizationId}`);
  }

  // Update user role
  async updateUserRole(data: UpdateUserRoleInput) {
    // Verify role belongs to organization
    const role = await prisma.role.findFirst({
      where: {
        id: data.roleId,
        organizationId: data.organizationId
      }
    });

    if (!role) {
      throw new NotFoundError('Role not found in organization');
    }

    // Check if trying to change owner role
    const currentUserOrg = await prisma.userOrganization.findFirst({
      where: {
        userId: data.userId,
        organizationId: data.organizationId
      },
      include: {
        role: true
      }
    });

    if (!currentUserOrg) {
      throw new NotFoundError('User not found in organization');
    }

    if (currentUserOrg.role.name === 'Owner') {
      throw new ForbiddenError('Cannot change owner role');
    }

    // Update role
    const updated = await prisma.userOrganization.update({
      where: {
        userId_organizationId: {
          userId: data.userId,
          organizationId: data.organizationId
        }
      },
      data: {
        roleId: data.roleId
      },
      include: {
        user: true,
        role: true,
        organization: true
      }
    });

    logger.info(`User ${updated.user.email} role updated to ${updated.role.name} in ${updated.organization.name}`);
    return updated;
  }

  // Get organization statistics
  async getOrganizationStats(organizationId: string) {
    const [
      usersCount,
      teamsCount,
      athletesCount,
      matchesCount,
      documentsCount,
      activePayments
    ] = await Promise.all([
      prisma.userOrganization.count({
        where: { organizationId }
      }),
      prisma.team.count({
        where: { organizationId, isActive: true }
      }),
      prisma.athlete.count({
        where: { organizationId }
      }),
      prisma.match.count({
        where: { 
          homeTeam: { organizationId }
        }
      }),
      prisma.document.count({
        where: { athlete: { organizationId } }
      }),
      prisma.payment.count({
        where: { 
          athlete: { organizationId },
          status: 'PENDING'
        }
      })
    ]);

    return {
      users: usersCount,
      teams: teamsCount,
      athletes: athletesCount,
      matches: matchesCount,
      documents: documentsCount,
      pendingPayments: activePayments
    };
  }

  // Check organization limits based on plan
  async checkOrganizationLimits(organizationId: string, resource: string) {
    const org = await this.getOrganization(organizationId);

    const stats = await this.getOrganizationStats(organizationId);

    switch (resource) {
      case 'users':
        if (org.maxUsers && stats.users >= org.maxUsers) {
          throw new ForbiddenError(`User limit reached (${org.maxUsers})`);
        }
        break;
      case 'teams':
        if (org.maxTeams && stats.teams >= org.maxTeams) {
          throw new ForbiddenError(`Team limit reached (${org.maxTeams})`);
        }
        break;
      case 'athletes':
        if (org.maxAthletes && stats.athletes >= org.maxAthletes) {
          throw new ForbiddenError(`Athlete limit reached (${org.maxAthletes})`);
        }
        break;
      default:
        break;
    }

    return true;
  }

  // Get organization roles
  async getOrganizationRoles(organizationId: string) {
    const roles = await prisma.role.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: {
            userOrganizations: true
          }
        }
      },
      orderBy: [
        { isSystem: 'desc' },
        { name: 'asc' }
      ]
    });

    return roles.map(role => ({
      ...role,
      userCount: role._count.userOrganizations
    }));
  }

  // Transfer ownership
  async transferOwnership(organizationId: string, newOwnerId: string, currentOwnerId: string) {
    // Verify current owner
    const currentOwnerOrg = await prisma.userOrganization.findFirst({
      where: {
        userId: currentOwnerId,
        organizationId,
        role: {
          name: 'Owner'
        }
      }
    });

    if (!currentOwnerOrg) {
      throw new ForbiddenError('Only owner can transfer ownership');
    }

    // Verify new owner is in organization
    const newOwnerOrg = await prisma.userOrganization.findFirst({
      where: {
        userId: newOwnerId,
        organizationId
      }
    });

    if (!newOwnerOrg) {
      throw new NotFoundError('New owner must be member of organization');
    }

    // Get owner role
    const ownerRole = await prisma.role.findFirst({
      where: {
        organizationId,
        name: 'Owner'
      }
    });

    // Get admin role for previous owner
    const adminRole = await prisma.role.findFirst({
      where: {
        organizationId,
        name: 'Admin'
      }
    });

    if (!ownerRole || !adminRole) {
      throw new Error('System roles not found');
    }

    // Transfer in transaction
    await prisma.$transaction(async (tx) => {
      // Update new owner role
      await tx.userOrganization.update({
        where: {
          userId_organizationId: {
            userId: newOwnerId,
            organizationId
          }
        },
        data: {
          roleId: ownerRole.id
        }
      });

      // Update previous owner to admin
      await tx.userOrganization.update({
        where: {
          userId_organizationId: {
            userId: currentOwnerId,
            organizationId
          }
        },
        data: {
          roleId: adminRole.id
        }
      });
    });

    logger.info(`Ownership transferred from ${currentOwnerId} to ${newOwnerId} for organization ${organizationId}`);
  }

  // Get organization details (anagrafica completa)
  async getOrganizationDetails(organizationId: string) {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        code: true,
        logoUrl: true,
        fullName: true,
        address: true,
        city: true,
        province: true,
        postalCode: true,
        country: true,
        phone: true,
        email: true,
        website: true,
        fiscalCode: true,
        vatNumber: true,
        foundedYear: true,
        federationNumber: true,
        iban: true,
        bankName: true,
        primaryColor: true,
        secondaryColor: true,
        description: true,
        presidentName: true,
        presidentEmail: true,
        presidentPhone: true,
        secretaryName: true,
        secretaryEmail: true,
        secretaryPhone: true,
        socialFacebook: true,
        socialInstagram: true,
        socialTwitter: true,
        socialYoutube: true,
        _count: {
          select: {
            users: true,
            athletes: true,
            teams: true
          }
        }
      }
    });

    if (!organization) {
      throw new NotFoundError('Organization not found');
    }

    return organization;
  }

  // Update organization details (anagrafica completa)
  async updateOrganizationDetails(organizationId: string, data: any) {
    // Validate colors if provided
    if (data.primaryColor && !this.isValidHexColor(data.primaryColor)) {
      throw new ValidationError('Invalid primary color format. Use hex color (e.g. #3B82F6)');
    }
    if (data.secondaryColor && !this.isValidHexColor(data.secondaryColor)) {
      throw new ValidationError('Invalid secondary color format. Use hex color (e.g. #1E40AF)');
    }

    // Validate email formats
    if (data.email && !this.isValidEmail(data.email)) {
      throw new ValidationError('Invalid organization email format');
    }
    if (data.presidentEmail && !this.isValidEmail(data.presidentEmail)) {
      throw new ValidationError('Invalid president email format');
    }
    if (data.secretaryEmail && !this.isValidEmail(data.secretaryEmail)) {
      throw new ValidationError('Invalid secretary email format');
    }

    // Update organization
    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        ...(data.fullName !== undefined && { fullName: data.fullName }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.province !== undefined && { province: data.province }),
        ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
        ...(data.country !== undefined && { country: data.country }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.website !== undefined && { website: data.website }),
        ...(data.fiscalCode !== undefined && { fiscalCode: data.fiscalCode }),
        ...(data.vatNumber !== undefined && { vatNumber: data.vatNumber }),
        ...(data.foundedYear !== undefined && { foundedYear: data.foundedYear }),
        ...(data.federationNumber !== undefined && { federationNumber: data.federationNumber }),
        ...(data.iban !== undefined && { iban: data.iban }),
        ...(data.bankName !== undefined && { bankName: data.bankName }),
        ...(data.primaryColor !== undefined && { primaryColor: data.primaryColor }),
        ...(data.secondaryColor !== undefined && { secondaryColor: data.secondaryColor }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.presidentName !== undefined && { presidentName: data.presidentName }),
        ...(data.presidentEmail !== undefined && { presidentEmail: data.presidentEmail }),
        ...(data.presidentPhone !== undefined && { presidentPhone: data.presidentPhone }),
        ...(data.secretaryName !== undefined && { secretaryName: data.secretaryName }),
        ...(data.secretaryEmail !== undefined && { secretaryEmail: data.secretaryEmail }),
        ...(data.secretaryPhone !== undefined && { secretaryPhone: data.secretaryPhone }),
        ...(data.socialFacebook !== undefined && { socialFacebook: data.socialFacebook }),
        ...(data.socialInstagram !== undefined && { socialInstagram: data.socialInstagram }),
        ...(data.socialTwitter !== undefined && { socialTwitter: data.socialTwitter }),
        ...(data.socialYoutube !== undefined && { socialYoutube: data.socialYoutube }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
      }
    });

    logger.info(`Organization details updated for ${organizationId}`);
    return updated;
  }

  // Helper functions
  private isValidHexColor(color: string): boolean {
    return /^#[0-9A-F]{6}$/i.test(color);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

export const organizationService = new OrganizationService();
