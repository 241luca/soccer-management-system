import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Script di migrazione semplificato per il sistema multi-tenant esistente
 * Utilizza le tabelle già presenti nello schema Prisma
 */
async function migrateToMultiTenant() {
  try {
    logger.info('Starting simplified multi-tenant migration...');

    // 1. Create default plans
    logger.info('Creating default plans...');
    
    const basicPlan = await prisma.plan.upsert({
      where: { name: 'Basic' },
      update: {},
      create: {
        name: 'Basic',
        price: 29.99,
        maxUsers: 5,
        maxAthletes: 50,
        maxTeams: 3,
        features: {
          transport: false,
          documents: true,
          payments: true,
          notifications: true,
          reports: false
        },
        isActive: true
      }
    });

    const proPlan = await prisma.plan.upsert({
      where: { name: 'Pro' },
      update: {},
      create: {
        name: 'Pro',
        price: 79.99,
        maxUsers: 20,
        maxAthletes: 200,
        maxTeams: 10,
        features: {
          transport: true,
          documents: true,
          payments: true,
          notifications: true,
          reports: true
        },
        isActive: true
      }
    });

    const enterprisePlan = await prisma.plan.upsert({
      where: { name: 'Enterprise' },
      update: {},
      create: {
        name: 'Enterprise',
        price: 199.99,
        maxUsers: 999,
        maxAthletes: 9999,
        maxTeams: 999,
        features: {
          transport: true,
          documents: true,
          payments: true,
          notifications: true,
          reports: true,
          api: true,
          customDomain: true,
                  },
        isActive: true
      }
    });

    // 2. Check if Demo Organization exists
    logger.info('Setting up Demo Organization...');
    
    let demoOrg = await prisma.organization.findUnique({
      where: { code: 'DEMO' }
    });

    if (!demoOrg) {
      demoOrg = await prisma.organization.create({
        data: {
          name: 'Demo Soccer Club',
          code: 'DEMO',
          subdomain: 'demo',
          plan: 'Pro',
          maxUsers: proPlan.maxUsers,
          maxAthletes: proPlan.maxAthletes,
          maxTeams: proPlan.maxTeams,
          settings: {
            primaryColor: '#1976d2',
            secondaryColor: '#dc004e',
            timezone: 'Europe/Rome',
            language: 'it'
          },
          isActive: true,
          isTrial: false
        }
      });
      logger.info('Created Demo Organization');
    } else {
      logger.info('Demo Organization already exists');
    }

    // 3. Create default roles for Demo Organization
    logger.info('Creating default roles...');
    
    const ownerRole = await prisma.role.upsert({
      where: {
        organizationId_name: {
          organizationId: demoOrg.id,
          name: 'Owner'
        }
      },
      update: {},
      create: {
        organizationId: demoOrg.id,
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

    const adminRole = await prisma.role.upsert({
      where: {
        organizationId_name: {
          organizationId: demoOrg.id,
          name: 'Admin'
        }
      },
      update: {},
      create: {
        organizationId: demoOrg.id,
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

    // 4. Create demo owner user
    logger.info('Creating demo owner user...');
    
    const hashedPassword = await bcrypt.hash('demo123456', 10);
    let demoOwner = await prisma.user.findUnique({
      where: { email: 'demo@soccermanager.com' }
    });

    if (!demoOwner) {
      demoOwner = await prisma.user.create({
        data: {
          email: 'demo@soccermanager.com',
          passwordHash: hashedPassword,
          firstName: 'Demo',
          lastName: 'Owner',
          role: 'ADMIN',
          organizationId: demoOrg.id,
          isActive: true
        }
      });
      logger.info('Created demo owner user');
    } else {
      logger.info('Demo owner user already exists');
    }

    // Link demo owner to organization
    const existingLink = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: demoOwner.id,
          organizationId: demoOrg.id
        }
      }
    });

    if (!existingLink) {
      await prisma.userOrganization.create({
        data: {
          userId: demoOwner.id,
          organizationId: demoOrg.id,
          roleId: ownerRole.id,
          isDefault: true
        }
      });
      logger.info('Linked demo owner to organization');
    }

    // 5. Create super admin user
    logger.info('Creating super admin user...');
    
    const superAdminPassword = await bcrypt.hash('superadmin123456', 10);
    await prisma.superAdmin.upsert({
      where: { email: 'superadmin@soccermanager.com' },
      update: {},
      create: {
        email: 'superadmin@soccermanager.com',
        passwordHash: superAdminPassword,
        firstName: 'Super',
        lastName: 'Admin',
        isActive: true
      }
    });

    // 6. Migrate existing users to Demo Organization
    logger.info('Migrating existing users...');
    
    const existingUsers = await prisma.user.findMany({
      where: {
        AND: [
          { organizationId: null },
          {
            NOT: {
              email: {
                in: ['demo@soccermanager.com', 'superadmin@soccermanager.com']
              }
            }
          }
        ]
      }
    });

    for (const user of existingUsers) {
      // Update user to belong to demo org
      await prisma.user.update({
        where: { id: user.id },
        data: { organizationId: demoOrg.id }
      });

      // Create UserOrganization link
      await prisma.userOrganization.create({
        data: {
          userId: user.id,
          organizationId: demoOrg.id,
          roleId: adminRole.id,
          isDefault: true
        }
      });
      
      logger.info(`Migrated user ${user.email} to Demo Organization`);
    }

    // 7. Update all existing data with organizationId
    logger.info('Updating existing data with organizationId...');

    // Update Athletes
    const athletesUpdated = await prisma.athlete.updateMany({
      where: { 
        OR: [
          { organizationId: { equals: null as any } },
          { organizationId: { not: demoOrg.id } }
        ]
      },
      data: { organizationId: demoOrg.id }
    });

    // Update Teams  
    const teamsUpdated = await prisma.team.updateMany({
      where: { 
        OR: [
          { organizationId: { equals: null as any } },
          { organizationId: { not: demoOrg.id } }
        ]
      },
      data: { organizationId: demoOrg.id }
    });

    // Update Payments
    const paymentsUpdated = await prisma.payment.updateMany({
      where: { 
        OR: [
          { organizationId: { equals: null as any } },
          { organizationId: { not: demoOrg.id } }
        ]
      },
      data: { organizationId: demoOrg.id }
    });

    // Update Notifications
    const notificationsUpdated = await prisma.notification.updateMany({
      where: { 
        OR: [
          { organizationId: { equals: null as any } },
          { organizationId: { not: demoOrg.id } }
        ]
      },
      data: { organizationId: demoOrg.id }
    });

    // Get counts for verification
    const counts = {
      athletes: await prisma.athlete.count({ where: { organizationId: demoOrg.id } }),
      teams: await prisma.team.count({ where: { organizationId: demoOrg.id } }),
      documents: await prisma.document.count(),
      payments: await prisma.payment.count({ where: { organizationId: demoOrg.id } }),
      notifications: await prisma.notification.count({ where: { organizationId: demoOrg.id } })
    };

    logger.info('Migration completed successfully!');
    logger.info('Summary:');
    logger.info(`- Created ${3} plans`);
    logger.info(`- Demo Organization: ${demoOrg.name}`);
    logger.info(`- Migrated ${existingUsers.length} users`);
    logger.info(`- Updated ${athletesUpdated.count} athletes`);
    logger.info(`- Updated ${teamsUpdated.count} teams`);
    logger.info(`- Updated ${paymentsUpdated.count} payments`);
    logger.info(`- Updated ${notificationsUpdated.count} notifications`);
    logger.info('');
    logger.info('Demo credentials:');
    logger.info('- Demo Owner: demo@soccermanager.com / demo123456');
    logger.info('- Super Admin: superadmin@soccermanager.com / superadmin123456');

  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if executed directly
if (require.main === module) {
  migrateToMultiTenant()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { migrateToMultiTenant };
