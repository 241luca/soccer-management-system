// Script Node.js per creare tutti gli utenti con hash corretti
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAllUsers() {
  console.log('🚀 Creazione completa utenti e organizzazioni...\n');

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
    console.log('✅ Demo Soccer Club creata/verificata');

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
    console.log('✅ ASD Ravenna Calcio creata/verificata');

    // 2. Crea ruoli
    console.log('\n📦 Creazione ruoli...');
    
    const demoOwnerRole = await prisma.role.upsert({
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
        description: 'Accesso completo',
        permissions: ['*'],
        organizationId: demoOrg.id
      }
    });

    const ravennaOwnerRole = await prisma.role.upsert({
      where: {
        organizationId_code: {
          organizationId: ravennaOrg.id,
          code: 'OWNER'
        }
      },
      update: {},
      create: {
        name: 'Owner',
        code: 'OWNER',
        description: 'Accesso completo',
        permissions: ['*'],
        organizationId: ravennaOrg.id
      }
    });
    console.log('✅ Ruoli creati');

    // 3. Crea utenti con password hashate
    console.log('\n📦 Creazione utenti...');

    // Demo user
    const demoHash = await bcrypt.hash('demo123456', 10);
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@soccermanager.com' },
      update: {
        passwordHash: demoHash,
        isActive: true
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
    console.log('✅ Demo user creato');

    // Admin Ravenna
    const ravennaHash = await bcrypt.hash('ravenna2024!', 10);
    const ravennaAdmin = await prisma.user.upsert({
      where: { email: 'admin@asdravennacalcio.it' },
      update: {
        passwordHash: ravennaHash,
        isActive: true
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
    console.log('✅ Admin Ravenna creato');

    // Manager multi-org
    const managerHash = await bcrypt.hash('manager2024!', 10);
    const manager = await prisma.user.upsert({
      where: { email: 'manager@soccermanager.com' },
      update: {
        passwordHash: managerHash,
        isActive: true
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
    console.log('✅ Manager multi-società creato');

    // 4. Crea UserOrganization links
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
        isActive: true,
        isDefault: true
      },
      create: {
        userId: demoUser.id,
        organizationId: demoOrg.id,
        roleId: demoOwnerRole.id,
        isActive: true,
        isDefault: true
      }
    });

    // Ravenna admin -> Ravenna org
    await prisma.userOrganization.upsert({
      where: {
        userId_organizationId: {
          userId: ravennaAdmin.id,
          organizationId: ravennaOrg.id
        }
      },
      update: {
        isActive: true,
        isDefault: true
      },
      create: {
        userId: ravennaAdmin.id,
        organizationId: ravennaOrg.id,
        roleId: ravennaOwnerRole.id,
        isActive: true,
        isDefault: true
      }
    });

    // Manager -> Demo org
    await prisma.userOrganization.upsert({
      where: {
        userId_organizationId: {
          userId: manager.id,
          organizationId: demoOrg.id
        }
      },
      update: {
        isActive: true,
        isDefault: false
      },
      create: {
        userId: manager.id,
        organizationId: demoOrg.id,
        roleId: demoOwnerRole.id,
        isActive: true,
        isDefault: false
      }
    });

    // Manager -> Ravenna org (default)
    await prisma.userOrganization.upsert({
      where: {
        userId_organizationId: {
          userId: manager.id,
          organizationId: ravennaOrg.id
        }
      },
      update: {
        isActive: true,
        isDefault: true
      },
      create: {
        userId: manager.id,
        organizationId: ravennaOrg.id,
        roleId: ravennaOwnerRole.id,
        isActive: true,
        isDefault: true
      }
    });

    console.log('✅ Collegamenti completati');

    // 5. Verifica finale
    console.log('\n📊 Verifica finale:');
    
    const users = await prisma.user.findMany({
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

    users.forEach(user => {
      console.log(`\n👤 ${user.email}:`);
      console.log(`   Nome: ${user.firstName} ${user.lastName}`);
      console.log(`   Attivo: ${user.isActive ? 'SI' : 'NO'}`);
      console.log(`   Organizzazioni: ${user.userOrganizations.map(uo => uo.organization.code).join(', ')}`);
    });

    console.log('\n========================================');
    console.log('✅ Setup completato con successo!');
    console.log('========================================\n');
    console.log('📝 Credenziali di accesso:\n');
    console.log('1. Demo User (solo Demo):');
    console.log('   demo@soccermanager.com / demo123456\n');
    console.log('2. Admin Ravenna (solo Ravenna):');
    console.log('   admin@asdravennacalcio.it / ravenna2024!\n');
    console.log('3. Manager (Demo + Ravenna):');
    console.log('   manager@soccermanager.com / manager2024!\n');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Errore:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui
createAllUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
