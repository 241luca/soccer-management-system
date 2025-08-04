// Script per creare gli utenti demo nel database
// Esegui con: node create-demo-users.js

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createDemoData() {
  console.log('🚀 Creazione dati demo...');

  try {
    // 1. Crea l'organizzazione
    console.log('📦 Creazione organizzazione Demo Soccer Club...');
    const organization = await prisma.organization.upsert({
      where: { code: 'DEMO' },
      update: {},
      create: {
        id: '43c973a6-5e20-43af-a295-805f1d7c86b1',
        name: 'Demo Soccer Club',
        code: 'DEMO',
        email: 'info@demosoccerclub.com',
        phone: '02-1234567',
        address: 'Via dello Sport 10',
        city: 'Milano',
        province: 'MI',
        postalCode: '20100',
        fiscalCode: 'IT12345678901'
      }
    });
    console.log('✅ Organizzazione creata');

    // 2. Crea gli utenti con password hashate
    console.log('👤 Creazione utenti...');
    
    // Utente demo
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@soccermanager.com' },
      update: {},
      create: {
        email: 'demo@soccermanager.com',
        password: await bcrypt.hash('demo123456', 10),
        firstName: 'Demo',
        lastName: 'User',
        isActive: true,
        isSuperAdmin: false
      }
    });
    console.log('✅ Utente demo@soccermanager.com creato');

    // Utente admin
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@demosoccerclub.com' },
      update: {},
      create: {
        email: 'admin@demosoccerclub.com',
        password: await bcrypt.hash('admin123', 10),
        firstName: 'Admin',
        lastName: 'Demo',
        isActive: true,
        isSuperAdmin: false
      }
    });
    console.log('✅ Utente admin@demosoccerclub.com creato');

    // Super admin
    const superAdmin = await prisma.user.upsert({
      where: { email: 'superadmin@soccermanager.com' },
      update: {},
      create: {
        email: 'superadmin@soccermanager.com',
        password: await bcrypt.hash('superadmin123456', 10),
        firstName: 'Super',
        lastName: 'Admin',
        isActive: true,
        isSuperAdmin: true
      }
    });
    console.log('✅ Super Admin creato');

    // 3. Crea il ruolo Admin
    console.log('🔐 Creazione ruoli...');
    const adminRole = await prisma.role.upsert({
      where: {
        organizationId_name: {
          organizationId: organization.id,
          name: 'Admin'
        }
      },
      update: {},
      create: {
        organizationId: organization.id,
        name: 'Admin',
        description: 'Administrator with full permissions',
        permissions: [
          "ORGANIZATION_VIEW", "ORGANIZATION_UPDATE",
          "USER_VIEW", "USER_CREATE", "USER_UPDATE", "USER_DELETE",
          "ROLE_VIEW", "ROLE_CREATE", "ROLE_UPDATE", "ROLE_DELETE",
          "ATHLETE_VIEW", "ATHLETE_CREATE", "ATHLETE_UPDATE", "ATHLETE_DELETE",
          "TEAM_VIEW", "TEAM_CREATE", "TEAM_UPDATE", "TEAM_DELETE",
          "MATCH_VIEW", "MATCH_CREATE", "MATCH_UPDATE", "MATCH_DELETE",
          "DOCUMENT_VIEW", "DOCUMENT_CREATE", "DOCUMENT_UPDATE", "DOCUMENT_DELETE",
          "PAYMENT_VIEW", "PAYMENT_CREATE", "PAYMENT_UPDATE", "PAYMENT_DELETE",
          "NOTIFICATION_VIEW", "NOTIFICATION_CREATE",
          "TRANSPORT_VIEW", "TRANSPORT_CREATE", "TRANSPORT_UPDATE", "TRANSPORT_DELETE",
          "REPORT_VIEW", "REPORT_CREATE"
        ],
        isSystem: true
      }
    });
    console.log('✅ Ruolo Admin creato');

    // 4. Associa gli utenti all'organizzazione
    console.log('🔗 Collegamento utenti all\'organizzazione...');
    
    await prisma.userOrganization.upsert({
      where: {
        userId_organizationId: {
          userId: demoUser.id,
          organizationId: organization.id
        }
      },
      update: {},
      create: {
        userId: demoUser.id,
        organizationId: organization.id,
        roleId: adminRole.id,
        isDefault: true
      }
    });
    console.log('✅ Utente demo collegato');

    await prisma.userOrganization.upsert({
      where: {
        userId_organizationId: {
          userId: adminUser.id,
          organizationId: organization.id
        }
      },
      update: {},
      create: {
        userId: adminUser.id,
        organizationId: organization.id,
        roleId: adminRole.id,
        isDefault: true
      }
    });
    console.log('✅ Utente admin collegato');

    // 5. Crea alcune squadre di esempio
    console.log('⚽ Creazione squadre...');
    
    const teams = await Promise.all([
      prisma.team.create({
        data: {
          organizationId: organization.id,
          name: 'Under 15',
          category: 'UNDER_15',
          season: '2024/2025',
          minAge: 13,
          maxAge: 15,
          isActive: true
        }
      }),
      prisma.team.create({
        data: {
          organizationId: organization.id,
          name: 'Under 17',
          category: 'UNDER_17',
          season: '2024/2025',
          minAge: 15,
          maxAge: 17,
          isActive: true
        }
      }),
      prisma.team.create({
        data: {
          organizationId: organization.id,
          name: 'Prima Squadra',
          category: 'PRIMA_SQUADRA',
          season: '2024/2025',
          minAge: 18,
          maxAge: 99,
          isActive: true
        }
      })
    ]);
    console.log('✅ Squadre create');

    console.log('\n🎉 Setup completato con successo!');
    console.log('\n📋 Credenziali di accesso:');
    console.log('================================');
    console.log('Demo User:');
    console.log('  Email: demo@soccermanager.com');
    console.log('  Password: demo123456');
    console.log('\nAdmin:');
    console.log('  Email: admin@demosoccerclub.com');
    console.log('  Password: admin123');
    console.log('\nSuper Admin:');
    console.log('  Email: superadmin@soccermanager.com');
    console.log('  Password: superadmin123456');
    console.log('================================\n');

  } catch (error) {
    console.error('❌ Errore durante la creazione dei dati:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui lo script
createDemoData();
