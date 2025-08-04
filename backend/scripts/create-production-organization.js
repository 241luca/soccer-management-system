// Script per creare la società di produzione
// File: backend/scripts/create-production-organization.js

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createProductionOrganization() {
  try {
    console.log('🏢 Creazione società di produzione...\n');

    // 1. Verifica se la società esiste già
    const existingOrg = await prisma.organization.findUnique({
      where: { code: 'RAVENNA' }
    });

    if (existingOrg) {
      console.log('⚠️  La società ASD Ravenna Calcio esiste già');
      return existingOrg;
    }

    // 2. Crea la nuova organizzazione di produzione
    const productionOrg = await prisma.organization.create({
      data: {
        name: 'ASD Ravenna Calcio',
        code: 'RAVENNA',
        subdomain: 'ravenna',
        plan: 'Enterprise', // Piano completo per produzione
        maxUsers: 999999,   // Illimitati
        maxAthletes: 999999, // Illimitati
        maxTeams: 999999,    // Illimitati
        isActive: true,
        isTrial: false,      // Non è trial, è produzione
        billingEmail: 'amministrazione@asdravennacalcio.it',
        settings: {
          theme: 'blue',
          currency: 'EUR',
          language: 'it',
          timezone: 'Europe/Rome',
          fiscalYear: 'september', // Anno sportivo da settembre
          features: {
            transport: true,
            documents: true,
            payments: true,
            matches: true,
            statistics: true,
            ai: true
          }
        }
      }
    });

    console.log('✅ Organizzazione creata:', productionOrg.name);

    // 3. Crea i ruoli per l'organizzazione
    const roles = [
      {
        name: 'Proprietario',
        code: 'OWNER',
        description: 'Accesso completo a tutte le funzionalità',
        permissions: ['*'], // Tutti i permessi
        organizationId: productionOrg.id
      },
      {
        name: 'Amministratore',
        code: 'ADMIN',
        description: 'Gestione completa eccetto fatturazione',
        permissions: [
          'ATHLETE_*', 'TEAM_*', 'MATCH_*', 'DOCUMENT_*', 
          'PAYMENT_*', 'USER_*', 'TRANSPORT_*', 'REPORT_*'
        ],
        organizationId: productionOrg.id
      },
      {
        name: 'Allenatore',
        code: 'COACH',
        description: 'Gestione squadre e atleti',
        permissions: [
          'ATHLETE_VIEW', 'ATHLETE_UPDATE',
          'TEAM_VIEW', 'TEAM_UPDATE',
          'MATCH_VIEW', 'MATCH_CREATE', 'MATCH_UPDATE',
          'DOCUMENT_VIEW', 'REPORT_VIEW'
        ],
        organizationId: productionOrg.id
      },
      {
        name: 'Segreteria',
        code: 'STAFF',
        description: 'Supporto amministrativo',
        permissions: [
          'ATHLETE_VIEW', 'TEAM_VIEW', 'MATCH_VIEW',
          'DOCUMENT_VIEW', 'DOCUMENT_CREATE', 'DOCUMENT_UPDATE',
          'PAYMENT_VIEW', 'PAYMENT_CREATE', 'PAYMENT_UPDATE',
          'TRANSPORT_VIEW'
        ],
        organizationId: productionOrg.id
      }
    ];

    for (const roleData of roles) {
      const role = await prisma.role.create({
        data: roleData
      });
      console.log(`  📋 Ruolo creato: ${role.name}`);
    }

    // 4. Crea l'utente amministratore per la società di produzione
    const hashedPassword = await bcrypt.hash('ravenna2024!', 10);
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@asdravennacalcio.it',
        passwordHash: hashedPassword,
        firstName: 'Amministratore',
        lastName: 'Ravenna',
        phone: '+39 0544 123456',
        isActive: true,
        organizationId: productionOrg.id
      }
    });

    console.log('✅ Utente amministratore creato:', adminUser.email);

    // 5. Collega l'utente all'organizzazione con ruolo Owner
    const ownerRole = await prisma.role.findFirst({
      where: {
        organizationId: productionOrg.id,
        code: 'OWNER'
      }
    });

    await prisma.userOrganization.create({
      data: {
        userId: adminUser.id,
        organizationId: productionOrg.id,
        roleId: ownerRole.id,
        isActive: true,
        isDefault: true
      }
    });

    // 6. Crea alcune squadre di esempio
    const teams = [
      { name: 'Prima Squadra', category: 'Serie D', minAge: 18, maxAge: 99, season: '2024-25' },
      { name: 'Juniores', category: 'Juniores Nazionale', minAge: 17, maxAge: 19, season: '2024-25' },
      { name: 'Allievi', category: 'Allievi Regionali', minAge: 15, maxAge: 17, season: '2024-25' },
      { name: 'Giovanissimi', category: 'Giovanissimi Regionali', minAge: 13, maxAge: 15, season: '2024-25' },
      { name: 'Esordienti', category: 'Esordienti', minAge: 11, maxAge: 13, season: '2024-25' },
      { name: 'Pulcini', category: 'Pulcini', minAge: 9, maxAge: 11, season: '2024-25' }
    ];

    for (const teamData of teams) {
      const team = await prisma.team.create({
        data: {
          ...teamData,
          organizationId: productionOrg.id,
          budget: 10000,
          isActive: true
        }
      });
      console.log(`  ⚽ Squadra creata: ${team.name}`);
    }

    // 7. Crea anche un utente che ha accesso a ENTRAMBE le società (demo e produzione)
    const multiOrgUser = await prisma.user.findUnique({
      where: { email: 'manager@soccermanager.com' }
    });

    if (!multiOrgUser) {
      const managerPassword = await bcrypt.hash('manager2024!', 10);
      const manager = await prisma.user.create({
        data: {
          email: 'manager@soccermanager.com',
          passwordHash: managerPassword,
          firstName: 'Manager',
          lastName: 'MultiSocietà',
          phone: '+39 0544 999999',
          isActive: true,
          // Non impostiamo organizationId perché ha accesso a più società
        }
      });

      // Collega a società Demo
      const demoOrg = await prisma.organization.findUnique({
        where: { code: 'DEMO' }
      });

      if (demoOrg) {
        const demoAdminRole = await prisma.role.findFirst({
          where: {
            organizationId: demoOrg.id,
            code: 'ADMIN'
          }
        });

        await prisma.userOrganization.create({
          data: {
            userId: manager.id,
            organizationId: demoOrg.id,
            roleId: demoAdminRole?.id || null,
            isActive: true,
            isDefault: false
          }
        });
        console.log('  👤 Manager collegato a Demo Soccer Club');
      }

      // Collega a società Produzione
      const prodAdminRole = await prisma.role.findFirst({
        where: {
          organizationId: productionOrg.id,
          code: 'ADMIN'
        }
      });

      await prisma.userOrganization.create({
        data: {
          userId: manager.id,
          organizationId: productionOrg.id,
          roleId: prodAdminRole.id,
          isActive: true,
          isDefault: true
        }
      });
      console.log('  👤 Manager collegato a ASD Ravenna Calcio');
      console.log('\n✅ Utente multi-società creato: manager@soccermanager.com');
    }

    console.log('\n========================================');
    console.log('✅ Setup completato con successo!');
    console.log('========================================\n');
    console.log('📝 Credenziali di accesso:\n');
    console.log('1. Admin ASD Ravenna (solo produzione):');
    console.log('   Email: admin@asdravennacalcio.it');
    console.log('   Password: ravenna2024!\n');
    console.log('2. Manager Multi-Società (demo + produzione):');
    console.log('   Email: manager@soccermanager.com');
    console.log('   Password: manager2024!\n');
    console.log('3. Admin Demo (solo demo):');
    console.log('   Email: demo@soccermanager.com');
    console.log('   Password: demo123456\n');
    console.log('========================================\n');

    return productionOrg;

  } catch (error) {
    console.error('❌ Errore durante la creazione:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui lo script
createProductionOrganization()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
