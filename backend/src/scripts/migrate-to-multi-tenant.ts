// Script di migrazione multi-tenant semplificato
// Questo script è solo per riferimento, non viene compilato con il resto del backend

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function migrateToMultiTenant() {
  console.log('Starting multi-tenant migration...');
  
  try {
    // Crea piani base se non esistono
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
          payments: true
        },
        isActive: true
      }
    });
    
    console.log('Plans created successfully');
    
    // Crea organizzazione demo se non esiste
    const demoOrg = await prisma.organization.findFirst({
      where: { code: 'DEMO' }
    });
    
    if (!demoOrg) {
      const newOrg = await prisma.organization.create({
        data: {
          name: 'Demo Soccer Club',
          code: 'DEMO',
          plan: 'Basic',
          maxUsers: 5,
          maxAthletes: 50,
          maxTeams: 3,
          isActive: true,
          isTrial: false
        }
      });
      
      console.log('Demo organization created');
      
      // Crea utente demo
      const hashedPassword = await bcrypt.hash('demo123456', 10);
      const demoUser = await prisma.user.create({
        data: {
          email: 'demo@soccermanager.com',
          passwordHash: hashedPassword,
          firstName: 'Demo',
          lastName: 'User',
          role: 'ADMIN',
          organizationId: newOrg.id,
          isActive: true
        }
      });
      
      console.log('Demo user created');
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Solo se eseguito direttamente
if (require.main === module) {
  migrateToMultiTenant()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { migrateToMultiTenant };
