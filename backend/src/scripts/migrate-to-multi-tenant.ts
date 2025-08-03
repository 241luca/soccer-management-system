import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Script di migrazione per trasformare il sistema esistente in multi-tenant
 * Tutti i dati esistenti verranno assegnati a una "Demo Organization"
 */
async function migrateToMultiTenant() {
  try {
    logger.info('Starting multi-tenant migration...');

    // 1. Create default plans
    logger.info('Creating default plans...');
    
    const basicPlan = await prisma.plan.upsert({
      where: { name: 'Basic' },
      update: {},
      create: {
        name: 'Basic',
        description: 'Piano base per piccole società',
        price: 29.99,
        interval: 'MONTHLY',
        features: [
          'Fino a 50 atleti',
          'Fino a 3 squadre',
          'Gestione documenti base',
          'Calendario partite',
          'Notifiche email'
        ],
        limits: {
          maxUsers: 5,
          maxTeams: 3,
          maxAthletes: 50,
          maxStorage: 5 // GB
        },
        isActive: true
      }
    });

    const proPlan = await prisma.plan.upsert({
      where: { name: 'Pro' },
      update: {},
      create: {
        name: 'Pro',
        description: 'Piano professionale per società medie',
        price: 79.99,
        interval: 'MONTHLY',
        features: [
          'Fino a 200 atleti',
          'Fino a 10 squadre',
          'Gestione documenti avanzata',
          'Calendario partite',
          'Notifiche email e SMS',
          'Report e statistiche',
          'Gestione trasporti'
        ],
        limits: {
          maxUsers: 20,
          maxTeams: 10,
          maxAthletes: 200,
          maxStorage: 50 // GB
        },
        isActive: true
      }
    });

    const enterprisePlan = await prisma.plan.upsert({
      where: { name: 'Enterprise' },
      update: {},
      create: {
        name: 'Enterprise',
        description: 'Piano enterprise per grandi società',
        price: 199.99,
        interval: 'MONTHLY',
        features: [
          'Atleti illimitati',
          'Squadre illimitate',
          'Gestione documenti avanzata',
          'Calendario partite',
          'Notifiche email, SMS e push',
          'Report e statistiche avanzate',
          'Gestione trasporti',
          'API access',
          'Supporto prioritario',
          'Backup automatici'
        ],
        limits: {
          maxUsers: -1, // unlimited
          maxTeams: -1,
          maxAthletes: -1,
          maxStorage: -1
        },
        isActive: true
      }
    });

    // 2. Create Demo Organization
    logger.info('Creating Demo Organization...');
    
    const demoOrg = await prisma.organization.upsert({
      where: { slug: 'demo' },
      update: {},
      create: {
        name: 'Demo Soccer Club',
        slug: 'demo',
        description: 'Organizzazione demo per test e sviluppo',
        logoUrl: '/images/demo-logo.png',
        settings: {
          primaryColor: '#1976d2',
          secondaryColor: '#dc004e',
          timezone: 'Europe/Rome',
          language: 'it'
        },
        planId: proPlan.id,
        isActive: true
      }
    });

    // 3. Create default roles for Demo Organization
    logger.info('Creating default roles...');
    
    const ownerRole = await prisma.organizationRole.upsert({
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

    const adminRole = await prisma.organizationRole.upsert({
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
    const demoOwner = await prisma.user.upsert({
      where: { email: 'demo@soccermanager.com' },
      update: {},
      create: {
        email: 'demo@soccermanager.com',
        name: 'Demo Owner',
        password: hashedPassword,
        isActive: true,
        isSuperAdmin: false
      }
    });

    // Link demo owner to organization
    await prisma.userOrganization.upsert({
      where: {
        userId_organizationId: {
          userId: demoOwner.id,
          organizationId: demoOrg.id
        }
      },
      update: {},
      create: {
        userId: demoOwner.id,
        organizationId: demoOrg.id,
        roleId: ownerRole.id,
        isActive: true
      }
    });

    // 5. Create super admin user
    logger.info('Creating super admin user...');
    
    const superAdminPassword = await bcrypt.hash('superadmin123456', 10);
    await prisma.user.upsert({
      where: { email: 'superadmin@soccermanager.com' },
      update: {},
      create: {
        email: 'superadmin@soccermanager.com',
        name: 'Super Admin',
        password: superAdminPassword,
        isActive: true,
        isSuperAdmin: true
      }
    });

    // 6. Migrate existing users to Demo Organization
    logger.info('Migrating existing users...');
    
    const existingUsers = await prisma.user.findMany({
      where: {
        NOT: {
          email: {
            in: ['demo@soccermanager.com', 'superadmin@soccermanager.com']
          }
        }
      }
    });

    for (const user of existingUsers) {
      // Check if user already has organization link
      const existingLink = await prisma.userOrganization.findFirst({
        where: {
          userId: user.id,
          organizationId: demoOrg.id
        }
      });

      if (!existingLink) {
        await prisma.userOrganization.create({
          data: {
            userId: user.id,
            organizationId: demoOrg.id,
            roleId: adminRole.id, // Give existing users admin role
            isActive: true
          }
        });
        logger.info(`Migrated user ${user.email} to Demo Organization`);
      }
    }

    // 7. Update all existing data with organizationId
    logger.info('Updating existing data with organizationId...');

    // Update Athletes
    await prisma.athlete.updateMany({
      where: { organizationId: null },
      data: { organizationId: demoOrg.id }
    });

    // Update Teams
    await prisma.team.updateMany({
      where: { organizationId: null },
      data: { organizationId: demoOrg.id }
    });

    // Update Documents
    await prisma.document.updateMany({
      where: { organizationId: null },
      data: { organizationId: demoOrg.id }
    });

    // Update Payments
    await prisma.payment.updateMany({
      where: { organizationId: null },
      data: { organizationId: demoOrg.id }
    });

    // Update Notifications
    await prisma.notification.updateMany({
      where: { organizationId: null },
      data: { organizationId: demoOrg.id }
    });

    // Update Transports
    await prisma.transport.updateMany({
      where: { organizationId: null },
      data: { organizationId: demoOrg.id }
    });

    // Get counts for verification
    const counts = {
      athletes: await prisma.athlete.count({ where: { organizationId: demoOrg.id } }),
      teams: await prisma.team.count({ where: { organizationId: demoOrg.id } }),
      documents: await prisma.document.count({ where: { organizationId: demoOrg.id } }),
      payments: await prisma.payment.count({ where: { organizationId: demoOrg.id } }),
      notifications: await prisma.notification.count({ where: { organizationId: demoOrg.id } }),
      transports: await prisma.transport.count({ where: { organizationId: demoOrg.id } })
    };

    logger.info('Migration completed successfully!');
    logger.info('Summary:');
    logger.info(`- Created ${3} plans`);
    logger.info(`- Created Demo Organization`);
    logger.info(`- Migrated ${existingUsers.length} users`);
    logger.info(`- Updated ${counts.athletes} athletes`);
    logger.info(`- Updated ${counts.teams} teams`);
    logger.info(`- Updated ${counts.documents} documents`);
    logger.info(`- Updated ${counts.payments} payments`);
    logger.info(`- Updated ${counts.notifications} notifications`);
    logger.info(`- Updated ${counts.transports} transports`);
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
