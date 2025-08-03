import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

export async function initializeDatabase() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    // Run any initialization logic here
    await initializeDefaultData();
    
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
}

async function initializeDefaultData() {
  try {
    // Skip default data creation - handled by setup:multi-tenant script
    logger.info('Skipping default data creation - use npm run setup:multi-tenant');
    return;

    // Check if we need to create default organization
    const orgCount = await prisma.organization.count();
    
    if (orgCount === 0) {
      logger.info('Creating default organization...');
      
      const defaultOrg = await prisma.organization.create({
        data: {
          name: 'Demo Soccer Club',
          code: 'DEMO',
          settings: {
            primaryColor: '#1e40af',
            secondaryColor: '#dc2626',
            logoUrl: null,
            contactEmail: 'info@demosoccerclub.com',
            contactPhone: '+39 0544 123456',
            address: 'Via Demo 1, 48121 Ravenna (RA)',
            website: 'https://demosoccerclub.com'
          }
        }
      });

      // Create default admin user
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      await prisma.user.create({
        data: {
          email: 'admin@demosoccerclub.com',
          passwordHash,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          organizationId: defaultOrg.id
        }
      });

      // Create default positions
      const positions = [
        { name: 'Portiere', sortOrder: 1 },
        { name: 'Difensore Centrale', sortOrder: 2 },
        { name: 'Difensore Laterale', sortOrder: 3 },
        { name: 'Centrocampista Difensivo', sortOrder: 4 },
        { name: 'Centrocampista Centrale', sortOrder: 5 },
        { name: 'Centrocampista Offensivo', sortOrder: 6 },
        { name: 'Ala Destra', sortOrder: 7 },
        { name: 'Ala Sinistra', sortOrder: 8 },
        { name: 'Punta Centrale', sortOrder: 9 }
      ];

      for (const position of positions) {
        await prisma.position.create({
          data: {
            ...position,
            organizationId: defaultOrg.id
          }
        });
      }

      // Create default document types
      const documentTypes = [
        { name: 'Certificato Medico', category: 'medical', isRequired: true, validityDays: 365 },
        { name: 'Assicurazione', category: 'insurance', isRequired: true, validityDays: 365 },
        { name: 'Modulo Iscrizione', category: 'administrative', isRequired: true, validityDays: 365 },
        { name: 'Liberatoria Foto', category: 'administrative', isRequired: false, validityDays: 1095 },
        { name: 'Consenso Privacy', category: 'administrative', isRequired: true, validityDays: 1095 }
      ];

      for (const docType of documentTypes) {
        await prisma.documentType.create({
          data: {
            ...docType,
            organizationId: defaultOrg.id
          }
        });
      }

      // Create default payment types
      const paymentTypes = [
        { name: 'Quota Sociale Annuale', amount: 200, frequency: 'annual', category: 'membership' },
        { name: 'Trasporto Mensile', amount: 30, frequency: 'monthly', category: 'transport' },
        { name: 'Kit Divise', amount: 80, frequency: 'annual', category: 'equipment' },
        { name: 'Torneo', amount: 50, frequency: 'one-time', category: 'events' }
      ];

      for (const paymentType of paymentTypes) {
        await prisma.paymentType.create({
          data: {
            ...paymentType,
            organizationId: defaultOrg.id
          }
        });
      }

      // Create default teams
      const teams = [
        { name: 'Under 15', category: 'Giovanili', season: '2024-25', minAge: 13, maxAge: 15, budget: 15000 },
        { name: 'Under 17', category: 'Giovanili', season: '2024-25', minAge: 15, maxAge: 17, budget: 18000 },
        { name: 'Under 19', category: 'Giovanili', season: '2024-25', minAge: 17, maxAge: 19, budget: 20000 },
        { name: 'Prima Squadra', category: 'Seniores', season: '2024-25', minAge: 18, maxAge: 99, budget: 45000 }
      ];

      for (const team of teams) {
        await prisma.team.create({
          data: {
            ...team,
            organizationId: defaultOrg.id
          }
        });
      }

      // Create transport zones
      const zones = [
        { id: 'A', name: 'Centro Città', distanceRange: '0-5km', monthlyFee: 30, color: 'green' },
        { id: 'B', name: 'Prima Periferia', distanceRange: '5-15km', monthlyFee: 45, color: 'blue' },
        { id: 'C', name: 'Seconda Periferia', distanceRange: '15-25km', monthlyFee: 60, color: 'orange' },
        { id: 'D', name: 'Comuni Limitrofi', distanceRange: '25km+', monthlyFee: 80, color: 'red' }
      ];

      for (const zone of zones) {
        await prisma.transportZone.create({
          data: {
            ...zone,
            organizationId: defaultOrg.id
          }
        });
      }

      logger.info('✅ Default data created successfully');
      logger.info('📧 Default admin login: admin@demosoccerclub.com / admin123');
    }
  } catch (error) {
    logger.error('Error initializing default data:', error);
    // Don't throw - allow app to start even if default data fails
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma };
