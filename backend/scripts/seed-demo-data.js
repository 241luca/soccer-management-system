// Script per popolare correttamente il database con utenti demo
// backend/scripts/seed-demo-data.js

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedDemoData() {
  try {
    console.log('🌱 Seeding demo data...\n');

    // 1. Create Demo Organization
    console.log('📦 Creating Demo Organization...');
    const demoOrg = await prisma.organization.upsert({
      where: { code: 'DEMO' },
      update: {},
      create: {
        name: 'Demo Soccer Club',
        code: 'DEMO',
        subdomain: 'demo',
        plan: 'Pro',
        maxUsers: 20,
        maxAthletes: 200,
        maxTeams: 10,
        isActive: true,
        isTrial: false,
        settings: {
          theme: 'blue',
          currency: 'EUR',
          language: 'it'
        }
      }
    });
    console.log('✅ Demo Organization created/verified');

    // 2. Create Roles for Demo Organization
    console.log('\n📦 Creating Roles...');
    const ownerRole = await prisma.role.upsert({
      where: { 
        organizationId_code: {
          organizationId: demoOrg.id,
          code: 'OWNER'
        }
      },
      update: {},
      create: {
        name: 'Owner',
        code: 'OWNER',
        description: 'Full access to everything',
        permissions: ['*'],
        organizationId: demoOrg.id
      }
    });

    const adminRole = await prisma.role.upsert({
      where: { 
        organizationId_code: {
          organizationId: demoOrg.id,
          code: 'ADMIN'
        }
      },
      update: {},
      create: {
        name: 'Administrator',
        code: 'ADMIN',
        description: 'Administrative access',
        permissions: [
          'ATHLETE_VIEW', 'ATHLETE_CREATE', 'ATHLETE_UPDATE', 'ATHLETE_DELETE',
          'TEAM_VIEW', 'TEAM_CREATE', 'TEAM_UPDATE', 'TEAM_DELETE',
          'MATCH_VIEW', 'MATCH_CREATE', 'MATCH_UPDATE', 'MATCH_DELETE',
          'DOCUMENT_VIEW', 'DOCUMENT_CREATE', 'DOCUMENT_UPDATE', 'DOCUMENT_DELETE',
          'PAYMENT_VIEW', 'PAYMENT_CREATE', 'PAYMENT_UPDATE',
          'USER_VIEW', 'USER_CREATE', 'USER_UPDATE',
          'TRANSPORT_VIEW', 'TRANSPORT_CREATE', 'TRANSPORT_UPDATE'
        ],
        organizationId: demoOrg.id
      }
    });
    console.log('✅ Roles created');

    // 3. Create Demo User with correct password
    console.log('\n📦 Creating Demo User...');
    const demoPassword = await bcrypt.hash('demo123456', 10);
    
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@soccermanager.com' },
      update: {
        passwordHash: demoPassword,
        isActive: true
      },
      create: {
        email: 'demo@soccermanager.com',
        passwordHash: demoPassword,
        firstName: 'Demo',
        lastName: 'Owner',
        role: 'ADMIN',
        isActive: true
      }
    });
    console.log('✅ Demo user created/updated');

    // 4. Link user to organization with proper role
    console.log('\n📦 Linking user to organization...');
    await prisma.userOrganization.upsert({
      where: {
        userId_organizationId: {
          userId: demoUser.id,
          organizationId: demoOrg.id
        }
      },
      update: {
        roleId: ownerRole.id,
        isActive: true,
        isDefault: true
      },
      create: {
        userId: demoUser.id,
        organizationId: demoOrg.id,
        roleId: ownerRole.id,
        isActive: true,
        isDefault: true
      }
    });
    console.log('✅ User linked to organization');

    // 5. Create some demo teams
    console.log('\n📦 Creating Demo Teams...');
    const teams = [
      { name: 'Prima Squadra', category: 'Serie D', minAge: 18, maxAge: 99 },
      { name: 'Under 19', category: 'Juniores', minAge: 17, maxAge: 19 },
      { name: 'Under 17', category: 'Allievi', minAge: 15, maxAge: 17 },
      { name: 'Under 15', category: 'Giovanissimi', minAge: 13, maxAge: 15 }
    ];

    for (const teamData of teams) {
      await prisma.team.upsert({
        where: {
          organizationId_name_season: {
            organizationId: demoOrg.id,
            name: teamData.name,
            season: '2024-25'
          }
        },
        update: {},
        create: {
          ...teamData,
          season: '2024-25',
          budget: 10000,
          isActive: true,
          organizationId: demoOrg.id
        }
      });
    }
    console.log('✅ Teams created');

    // 6. Create some demo athletes
    console.log('\n📦 Creating Demo Athletes...');
    const athletes = [
      { firstName: 'Mario', lastName: 'Rossi', birthDate: new Date('2006-05-15'), teamId: null },
      { firstName: 'Luigi', lastName: 'Bianchi', birthDate: new Date('2007-08-22'), teamId: null },
      { firstName: 'Giovanni', lastName: 'Verdi', birthDate: new Date('2008-03-10'), teamId: null },
      { firstName: 'Francesco', lastName: 'Russo', birthDate: new Date('2005-11-28'), teamId: null },
      { firstName: 'Alessandro', lastName: 'Romano', birthDate: new Date('2006-09-17'), teamId: null }
    ];

    const createdTeams = await prisma.team.findMany({
      where: { organizationId: demoOrg.id }
    });

    for (let i = 0; i < athletes.length; i++) {
      const athlete = athletes[i];
      const team = createdTeams[i % createdTeams.length];
      
      await prisma.athlete.create({
        data: {
          ...athlete,
          teamId: team.id,
          organizationId: demoOrg.id,
          status: 'ACTIVE',
          jerseyNumber: i + 10,
          email: `${athlete.firstName.toLowerCase()}.${athlete.lastName.toLowerCase()}@example.com`,
          phone: `+39 333 ${1000000 + i}`,
          address: `Via Demo ${i + 1}`,
          city: 'Ravenna',
          province: 'RA',
          postalCode: '48121'
        }
      });
    }
    console.log('✅ Athletes created');

    // 7. Create Super Admin (if not exists)
    console.log('\n📦 Creating Super Admin...');
    const superAdminPassword = await bcrypt.hash('superadmin123456', 10);
    
    await prisma.user.upsert({
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
        role: 'ADMIN',
        isActive: true
      }
    });
    console.log('✅ Super Admin created');

    console.log('\n========================================');
    console.log('✅ Demo data seeded successfully!');
    console.log('========================================\n');
    console.log('📝 Login credentials:\n');
    console.log('Demo User:');
    console.log('  Email: demo@soccermanager.com');
    console.log('  Password: demo123456\n');
    console.log('Super Admin:');
    console.log('  Email: superadmin@soccermanager.com');
    console.log('  Password: superadmin123456\n');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedDemoData()
  .then(() => {
    console.log('✅ Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
