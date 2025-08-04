// Script corretto per creare utenti
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAllUsersFixed() {
  console.log('🚀 Creazione utenti e organizzazioni (VERSIONE CORRETTA)...\n');

  try {
    // 1. Crea/verifica organizzazioni
    console.log('📦 Creazione organizzazioni...');
    
    const demoOrg = await prisma.organization.upsert({
      where: { code: 'DEMO' },
      update: { isActive: true },
      create: {
        name: 'Demo Soccer Club',
        code: 'DEMO',
        plan: 'Pro',
        maxUsers: 20,
        maxAthletes: 200,
        maxTeams: 10,
        isActive: true,
        isTrial: false,
        settings: {}
      }
    });
    console.log('✅ Demo Soccer Club: ' + demoOrg.id);

    const ravennaOrg = await prisma.organization.upsert({
      where: { code: 'RAVENNA' },
      update: { isActive: true },
      create: {
        name: 'ASD Ravenna Calcio',
        code: 'RAVENNA',
        subdomain: 'ravenna',
        plan: 'Enterprise',
        maxUsers: 999999,
        maxAthletes: 999999,
        maxTeams: 999999,
        isActive: true,
        isTrial: false,
        settings: {}
      }
    });
    console.log('✅ ASD Ravenna Calcio: ' + ravennaOrg.id);

    // 2. Crea ruoli usando organizationId e name (non code!)
    console.log('\n📦 Creazione ruoli...');
    
    const demoOwnerRole = await prisma.role.upsert({
      where: {
        organizationId_name: {
          organizationId: demoOrg.id,
          name: 'Owner'  // Usa name invece di code
        }
      },
      update: {},
      create: {
        name: 'Owner',
        description: 'Accesso completo',
        permissions: ['*'],
        organizationId: demoOrg.id
      }
    });
    console.log('✅ Demo Owner Role: ' + demoOwnerRole.id);

    const ravennaOwnerRole = await prisma.role.upsert({
      where: {
        organizationId_name: {
          organizationId: ravennaOrg.id,
          name: 'Owner'
        }
      },
      update: {},
      create: {
        name: 'Owner',
        description: 'Accesso completo',
        permissions: ['*'],
        organizationId: ravennaOrg.id
      }
    });
    console.log('✅ Ravenna Owner Role: ' + ravennaOwnerRole.id);

    // 3. Crea utenti
    console.log('\n📦 Creazione utenti...');

    // Demo user
    const demoHash = await bcrypt.hash('demo123456', 10);
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@soccermanager.com' },
      update: {
        passwordHash: demoHash,
        isActive: true,
        failedLoginAttempts: 0,
        lockedUntil: null
      },
      create: {
        email: 'demo@soccermanager.com',
        passwordHash: demoHash,
        firstName: 'Demo',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true
      }
    });
    console.log('✅ Demo user: ' + demoUser.id);

    // Admin Ravenna
    const ravennaHash = await bcrypt.hash('ravenna2024!', 10);
    const ravennaAdmin = await prisma.user.upsert({
      where: { email: 'admin@asdravennacalcio.it' },
      update: {
        passwordHash: ravennaHash,
        isActive: true,
        failedLoginAttempts: 0,
        lockedUntil: null
      },
      create: {
        email: 'admin@asdravennacalcio.it',
        passwordHash: ravennaHash,
        firstName: 'Amministratore',
        lastName: 'Ravenna',
        role: 'ADMIN',
        isActive: true
      }
    });
    console.log('✅ Admin Ravenna: ' + ravennaAdmin.id);

    // Manager multi-org
    const managerHash = await bcrypt.hash('manager2024!', 10);
    const manager = await prisma.user.upsert({
      where: { email: 'manager@soccermanager.com' },
      update: {
        passwordHash: managerHash,
        isActive: true,
        failedLoginAttempts: 0,
        lockedUntil: null
      },
      create: {
        email: 'manager@soccermanager.com',
        passwordHash: managerHash,
        firstName: 'Manager',
        lastName: 'MultiSocietà',
        role: 'ADMIN',
        isActive: true
      }
    });
    console.log('✅ Manager: ' + manager.id);

    // 4. Crea UserOrganization - ATTENZIONE: manca isActive nel modello!
    console.log('\n📦 Collegamento utenti-organizzazioni...');

    // Demo user -> Demo org
    await prisma.userOrganization.upsert({
      where: {
        userId_organizationId: {
          userId: demoUser.id,
          organizationId: demoOrg.id
        }
      },
      update: {
        roleId: demoOwnerRole.id,
        isDefault: true
      },
      create: {
        userId: demoUser.id,
        organizationId: demoOrg.id,
        roleId: demoOwnerRole.id,
        isDefault: true
      }
    });
    console.log('✅ Demo user -> Demo org');

    // Ravenna admin -> Ravenna org
    await prisma.userOrganization.upsert({
      where: {
        userId_organizationId: {
          userId: ravennaAdmin.id,
          organizationId: ravennaOrg.id
        }
      },
      update: {
        roleId: ravennaOwnerRole.id,
        isDefault: true
      },
      create: {
        userId: ravennaAdmin.id,
        organizationId: ravennaOrg.id,
        roleId: ravennaOwnerRole.id,
        isDefault: true
      }
    });
    console.log('✅ Ravenna admin -> Ravenna org');

    // Manager -> Demo org
    await prisma.userOrganization.upsert({
      where: {
        userId_organizationId: {
          userId: manager.id,
          organizationId: demoOrg.id
        }
      },
      update: {
        roleId: demoOwnerRole.id,
        isDefault: false
      },
      create: {
        userId: manager.id,
        organizationId: demoOrg.id,
        roleId: demoOwnerRole.id,
        isDefault: false
      }
    });
    console.log('✅ Manager -> Demo org');

    // Manager -> Ravenna org (default)
    await prisma.userOrganization.upsert({
      where: {
        userId_organizationId: {
          userId: manager.id,
          organizationId: ravennaOrg.id
        }
      },
      update: {
        roleId: ravennaOwnerRole.id,
        isDefault: true
      },
      create: {
        userId: manager.id,
        organizationId: ravennaOrg.id,
        roleId: ravennaOwnerRole.id,
        isDefault: true
      }
    });
    console.log('✅ Manager -> Ravenna org (default)');

    // 5. Verifica finale
    console.log('\n📊 Verifica finale:');
    
    const verifyUsers = await prisma.user.findMany({
      where: {
        email: {
          in: ['demo@soccermanager.com', 'admin@asdravennacalcio.it', 'manager@soccermanager.com']
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

    verifyUsers.forEach(user => {
      console.log(`\n👤 ${user.email}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Nome: ${user.firstName} ${user.lastName}`);
      console.log(`   Attivo: ${user.isActive ? 'SI' : 'NO'}`);
      console.log(`   Organizzazioni: ${user.userOrganizations.length}`);
      user.userOrganizations.forEach(uo => {
        console.log(`     - ${uo.organization.name} (${uo.role.name}) ${uo.isDefault ? '[DEFAULT]' : ''}`);
      });
    });

    console.log('\n========================================');
    console.log('✅ Setup completato con successo!');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Errore:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui
createAllUsersFixed()
  .then(() => {
    console.log('\n✅ Script completato');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script fallito:', error);
    process.exit(1);
  });
