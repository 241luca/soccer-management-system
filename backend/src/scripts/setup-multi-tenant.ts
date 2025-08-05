import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Script di migrazione ultra-semplificato per il sistema multi-tenant
 * Crea solo i dati essenziali senza toccare i dati esistenti
 */
async function setupMultiTenant() {
  try {
    logger.info('Starting multi-tenant setup...');

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

    logger.info(`Created/Updated plans: Basic, Pro, Enterprise`);

    // 2. Check if any organization exists
    const existingOrgCount = await prisma.organization.count();
    
    if (existingOrgCount === 0) {
      logger.info('No organizations found. Creating Demo Organization...');
      
      // Create Demo Organization
      const demoOrg = await prisma.organization.create({
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
      
      logger.info(`Created Demo Organization: ${demoOrg.name} (${demoOrg.code})`);

      // Create default roles for Demo Organization
      const ownerRole = await prisma.role.create({
        data: {
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

      const adminRole = await prisma.role.create({
        data: {
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

      logger.info('Created default roles: Owner and Admin');

      // Create demo owner user
      const hashedPassword = await bcrypt.hash('demo123456', 10);
      const demoOwner = await prisma.user.create({
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

      // Link demo owner to organization
      await prisma.userOrganization.create({
        data: {
          userId: demoOwner.id,
          organizationId: demoOrg.id,
          roleId: ownerRole.id,
          isDefault: true
        }
      });

      logger.info('Created demo owner user: demo@soccermanager.com');
    } else {
      logger.info(`Found ${existingOrgCount} existing organization(s). Skipping Demo Organization creation.`);
    }

    // 3. Create super admin user
    logger.info('Creating/Updating super admin user...');
    
    const superAdminPassword = await bcrypt.hash('superadmin123456', 10);
    const superAdmin = await prisma.superAdmin.upsert({
      where: { email: 'superadmin@soccermanager.com' },
      update: {
        passwordHash: superAdminPassword,
        isActive: true
      },
      create: {
        email: 'superadmin@soccermanager.com',
        passwordHash: superAdminPassword,
        firstName: 'Super',
        lastName: 'Admin',
        isActive: true
      }
    });

    logger.info('Super admin ready: superadmin@soccermanager.com');

    // 4. Summary
    const summary = {
      plans: await prisma.plan.count(),
      organizations: await prisma.organization.count(),
      users: await prisma.user.count(),
      superAdmins: await prisma.superAdmin.count()
    };

    logger.info('');
    logger.info('Setup completed successfully!');
    logger.info('=================================');
    logger.info(`Plans created: ${summary.plans}`);
    logger.info(`Organizations: ${summary.organizations}`);
    logger.info(`Users: ${summary.users}`);
    logger.info(`Super Admins: ${summary.superAdmins}`);
    logger.info('');
    logger.info('Credentials:');
    logger.info('------------');
    if (existingOrgCount === 0) {
      logger.info('Demo Owner: demo@soccermanager.com / demo123456');
    }
    logger.info('Super Admin: superadmin@soccermanager.com / superadmin123456');
    logger.info('');
    logger.info('Next steps:');
    logger.info('1. Start the server: npm run dev');
    logger.info('2. Test login with the credentials above');
    logger.info('3. Access /api/v1/organizations/current to verify');

  } catch (error) {
    logger.error('Setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run setup if executed directly
if (require.main === module) {
  setupMultiTenant()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { setupMultiTenant };
