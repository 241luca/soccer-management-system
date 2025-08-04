import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setupDemo() {
  console.log('🚀 Setting up demo data...');
  
  try {
    // Create demo organization
    const demoOrg = await prisma.organization.upsert({
      where: { code: 'DEMO' },
      update: {},
      create: {
        name: 'Demo Soccer Club',
        code: 'DEMO',
        plan: 'basic',
        maxUsers: 10,
        maxAthletes: 100,
        maxTeams: 10,
        isActive: true,
        isTrial: false
      }
    });
    
    console.log('✅ Demo organization created/updated');
    
    // Create demo user
    const hashedPassword = await bcrypt.hash('demo123456', 10);
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@soccermanager.com' },
      update: {},
      create: {
        email: 'demo@soccermanager.com',
        passwordHash: hashedPassword,
        firstName: 'Demo',
        lastName: 'User',
        role: 'ADMIN',
        organizationId: demoOrg.id,
        isActive: true
      }
    });
    
    console.log('✅ Demo user created/updated');
    
    // Create super admin
    const superAdminHash = await bcrypt.hash('superadmin123456', 10);
    const superAdmin = await prisma.user.upsert({
      where: { email: 'superadmin@soccermanager.com' },
      update: {},
      create: {
        email: 'superadmin@soccermanager.com',
        passwordHash: superAdminHash,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'ADMIN',
        organizationId: demoOrg.id,
        isActive: true
      }
    });
    
    console.log('✅ Super admin created/updated');
    
    // Create a demo team
    const demoTeam = await prisma.team.upsert({
      where: {
        organizationId_name_season: {
          organizationId: demoOrg.id,
          name: 'Under 16',
          season: '2024/2025'
        }
      },
      update: {},
      create: {
        organizationId: demoOrg.id,
        name: 'Under 16',
        category: 'Giovanili',
        season: '2024/2025',
        minAge: 14,
        maxAge: 16,
        isActive: true
      }
    });
    
    console.log('✅ Demo team created/updated');
    
    // Create some demo athletes
    const athletes = [
      { firstName: 'Mario', lastName: 'Rossi', birthDate: new Date('2008-03-15') },
      { firstName: 'Luca', lastName: 'Bianchi', birthDate: new Date('2008-07-22') },
      { firstName: 'Giuseppe', lastName: 'Verdi', birthDate: new Date('2009-01-10') },
      { firstName: 'Antonio', lastName: 'Russo', birthDate: new Date('2008-11-05') },
      { firstName: 'Francesco', lastName: 'Ferrari', birthDate: new Date('2009-02-28') }
    ];
    
    for (const athlete of athletes) {
      await prisma.athlete.create({
        data: {
          ...athlete,
          organizationId: demoOrg.id,
          teamId: demoTeam.id,
          status: 'ACTIVE',
          jerseyNumber: Math.floor(Math.random() * 99) + 1
        }
      }).catch(() => {
        // Ignore if already exists
      });
    }
    
    console.log('✅ Demo athletes created');
    
    console.log('\n📋 Demo Setup Complete!');
    console.log('========================');
    console.log('Demo User:');
    console.log('  Email: demo@soccermanager.com');
    console.log('  Password: demo123456');
    console.log('');
    console.log('Super Admin:');
    console.log('  Email: superadmin@soccermanager.com');
    console.log('  Password: superadmin123456');
    console.log('========================\n');
    
  } catch (error) {
    console.error('❌ Error setting up demo data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupDemo()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
