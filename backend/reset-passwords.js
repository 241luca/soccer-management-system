// Script per resettare la password dell'utente admin
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    console.log('🔐 Resetting password per admin@demosoccerclub.com...');
    
    // Hash della nuova password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Aggiorna la password
    const user = await prisma.user.update({
      where: { email: 'admin@demosoccerclub.com' },
      data: { 
        passwordHash: hashedPassword,
        failedLoginAttempts: 0,
        lockedUntil: null
      }
    });
    
    console.log('✅ Password resettata con successo!');
    console.log('Email:', user.email);
    console.log('Password: admin123');
    
    // Verifica che l'utente sia collegato all'organizzazione
    const userOrg = await prisma.userOrganization.findFirst({
      where: { userId: user.id },
      include: { 
        organization: true,
        role: true
      }
    });
    
    if (!userOrg) {
      console.log('⚠️  Utente non collegato a nessuna organizzazione!');
      
      // Trova l'organizzazione e collega l'utente
      const org = await prisma.organization.findFirst({
        where: { code: 'DEMO' }
      });
      
      if (org) {
        // Crea o trova il ruolo Admin
        let adminRole = await prisma.role.findFirst({
          where: { 
            organizationId: org.id,
            name: 'Admin'
          }
        });
        
        if (!adminRole) {
          adminRole = await prisma.role.create({
            data: {
              organizationId: org.id,
              name: 'Admin',
              description: 'Administrator',
              permissions: [
                "ORGANIZATION_VIEW", "ORGANIZATION_UPDATE",
                "USER_VIEW", "USER_CREATE", "USER_UPDATE", "USER_DELETE",
                "ATHLETE_VIEW", "ATHLETE_CREATE", "ATHLETE_UPDATE", "ATHLETE_DELETE",
                "TEAM_VIEW", "TEAM_CREATE", "TEAM_UPDATE", "TEAM_DELETE",
                "MATCH_VIEW", "MATCH_CREATE", "MATCH_UPDATE", "MATCH_DELETE",
                "DOCUMENT_VIEW", "DOCUMENT_CREATE", "DOCUMENT_UPDATE", "DOCUMENT_DELETE",
                "PAYMENT_VIEW", "PAYMENT_CREATE", "PAYMENT_UPDATE", "PAYMENT_DELETE",
                "NOTIFICATION_VIEW", "NOTIFICATION_CREATE",
                "TRANSPORT_VIEW", "TRANSPORT_CREATE", "TRANSPORT_UPDATE", "TRANSPORT_DELETE"
              ],
              isSystem: true
            }
          });
        }
        
        // Collega utente all'organizzazione
        await prisma.userOrganization.create({
          data: {
            userId: user.id,
            organizationId: org.id,
            roleId: adminRole.id,
            isDefault: true
          }
        });
        
        console.log('✅ Utente collegato all\'organizzazione:', org.name);
      }
    } else {
      console.log('✅ Utente già collegato a:', userOrg.organization.name);
      console.log('   Ruolo:', userOrg.role.name);
    }
    
    // Crea anche l'utente demo se non esiste
    console.log('\n📦 Creazione utente demo@soccermanager.com...');
    
    const demoPassword = await bcrypt.hash('demo123456', 10);
    const org = await prisma.organization.findFirst({ where: { code: 'DEMO' } });
    const adminRole = await prisma.role.findFirst({ 
      where: { 
        organizationId: org.id,
        name: 'Admin'
      }
    });
    
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@soccermanager.com' },
      update: {
        passwordHash: demoPassword,
        failedLoginAttempts: 0,
        lockedUntil: null
      },
      create: {
        email: 'demo@soccermanager.com',
        passwordHash: demoPassword,
        firstName: 'Demo',
        lastName: 'User',
        role: 'ADMIN',
        organizationId: org.id,
        isActive: true
      }
    });
    
    // Collega demo user all'organizzazione
    await prisma.userOrganization.upsert({
      where: {
        userId_organizationId: {
          userId: demoUser.id,
          organizationId: org.id
        }
      },
      update: {},
      create: {
        userId: demoUser.id,
        organizationId: org.id,
        roleId: adminRole.id,
        isDefault: true
      }
    });
    
    console.log('✅ Utente demo creato/aggiornato!');
    console.log('Email: demo@soccermanager.com');
    console.log('Password: demo123456');
    
    console.log('\n📋 Credenziali disponibili:');
    console.log('================================');
    console.log('1. admin@demosoccerclub.com / admin123');
    console.log('2. demo@soccermanager.com / demo123456');
    console.log('3. superadmin@soccermanager.com / superadmin123456');
    console.log('================================');
    
  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
