#!/bin/bash

echo "🔧 Setup utenti demo per Soccer Management System"
echo "=================================================="
echo ""

# Vai nella directory backend
cd backend

# Verifica se il database è accessibile
echo "📊 Verifica connessione database..."
npx prisma db push

# Crea uno script per verificare e creare gli utenti
cat > scripts/fix-demo-users.js << 'EOF'
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixDemoUsers() {
  try {
    console.log('🔍 Verifica utenti esistenti...\n');

    // 1. Verifica se esiste l'organizzazione Demo
    let demoOrg = await prisma.organization.findUnique({
      where: { code: 'DEMO' }
    });

    if (!demoOrg) {
      console.log('📦 Creazione organizzazione Demo...');
      demoOrg = await prisma.organization.create({
        data: {
          name: 'Demo Soccer Club',
          code: 'DEMO',
          subdomain: 'demo',
          plan: 'Pro',
          maxUsers: 20,
          maxAthletes: 200,
          maxTeams: 10,
          isActive: true,
          isTrial: false,
          settings: {}
        }
      });
      console.log('✅ Organizzazione Demo creata');
    } else {
      console.log('✅ Organizzazione Demo già esistente');
    }

    // 2. Crea o aggiorna l'utente demo@soccermanager.com
    const demoPassword = await bcrypt.hash('demo123456', 10);
    
    let demoUser = await prisma.user.findUnique({
      where: { email: 'demo@soccermanager.com' }
    });

    if (!demoUser) {
      console.log('\n📦 Creazione utente demo...');
      demoUser = await prisma.user.create({
        data: {
          email: 'demo@soccermanager.com',
          passwordHash: demoPassword,
          firstName: 'Demo',
          lastName: 'User',
          role: 'ADMIN',
          isActive: true,
          organizationId: demoOrg.id
        }
      });
      console.log('✅ Utente demo creato');
    } else {
      console.log('\n🔄 Aggiornamento password utente demo...');
      await prisma.user.update({
        where: { id: demoUser.id },
        data: { 
          passwordHash: demoPassword,
          isActive: true,
          organizationId: demoOrg.id
        }
      });
      console.log('✅ Password utente demo aggiornata');
    }

    // 3. Verifica/crea ruolo per l'organizzazione
    let ownerRole = await prisma.role.findFirst({
      where: {
        organizationId: demoOrg.id,
        code: 'OWNER'
      }
    });

    if (!ownerRole) {
      console.log('\n📦 Creazione ruolo Owner...');
      ownerRole = await prisma.role.create({
        data: {
          name: 'Owner',
          code: 'OWNER',
          description: 'Proprietario con accesso completo',
          permissions: ['*'],
          organizationId: demoOrg.id
        }
      });
      console.log('✅ Ruolo Owner creato');
    }

    // 4. Collega utente all'organizzazione
    const userOrgExists = await prisma.userOrganization.findFirst({
      where: {
        userId: demoUser.id,
        organizationId: demoOrg.id
      }
    });

    if (!userOrgExists) {
      console.log('\n📦 Collegamento utente-organizzazione...');
      await prisma.userOrganization.create({
        data: {
          userId: demoUser.id,
          organizationId: demoOrg.id,
          roleId: ownerRole.id,
          isActive: true,
          isDefault: true
        }
      });
      console.log('✅ Utente collegato all\'organizzazione');
    }

    // 5. Verifica/crea squadre demo
    const existingTeams = await prisma.team.count({
      where: { organizationId: demoOrg.id }
    });

    if (existingTeams === 0) {
      console.log('\n📦 Creazione squadre demo...');
      const teams = [
        { name: 'Under 15', category: 'Giovanili', minAge: 13, maxAge: 15 },
        { name: 'Under 17', category: 'Giovanili', minAge: 15, maxAge: 17 },
        { name: 'Under 19', category: 'Giovanili', minAge: 17, maxAge: 19 },
        { name: 'Prima Squadra', category: 'Seniores', minAge: 18, maxAge: 99 }
      ];

      for (const team of teams) {
        await prisma.team.create({
          data: {
            ...team,
            season: '2024-25',
            budget: 10000,
            isActive: true,
            organizationId: demoOrg.id
          }
        });
        console.log(`  ✅ Squadra ${team.name} creata`);
      }
    } else {
      console.log(`\n✅ Squadre già esistenti: ${existingTeams}`);
    }

    // 6. Crea anche l'utente admin@demosoccerclub.com per retrocompatibilità
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    let adminUser = await prisma.user.findUnique({
      where: { email: 'admin@demosoccerclub.com' }
    });

    if (!adminUser) {
      console.log('\n📦 Creazione utente admin legacy...');
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@demosoccerclub.com',
          passwordHash: adminPassword,
          firstName: 'Admin',
          lastName: 'Demo',
          role: 'ADMIN',
          isActive: true,
          organizationId: demoOrg.id
        }
      });
      
      await prisma.userOrganization.create({
        data: {
          userId: adminUser.id,
          organizationId: demoOrg.id,
          roleId: ownerRole.id,
          isActive: true,
          isDefault: true
        }
      });
      console.log('✅ Utente admin legacy creato');
    }

    console.log('\n========================================');
    console.log('✅ Setup completato con successo!');
    console.log('========================================\n');
    console.log('📝 Credenziali demo funzionanti:\n');
    console.log('1. demo@soccermanager.com / demo123456');
    console.log('2. admin@demosoccerclub.com / admin123\n');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Errore:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixDemoUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
EOF

# Esegui lo script
echo ""
echo "🚀 Esecuzione fix utenti demo..."
echo ""
node scripts/fix-demo-users.js

echo ""
echo "✅ Setup completato!"
echo ""
echo "📝 Ora puoi accedere con:"
echo "   - demo@soccermanager.com / demo123456"
echo "   - admin@demosoccerclub.com / admin123"
echo ""
