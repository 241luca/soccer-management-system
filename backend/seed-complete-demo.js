// Seed completo per Soccer Management System
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniziando il seed del database...\n');

  try {
    // 1. Crea organizzazione Demo
    console.log('📦 Creazione organizzazione Demo...');
    const demoOrg = await prisma.organization.upsert({
      where: { code: 'DEMO' },
      update: {},
      create: {
        name: 'Demo Soccer Club',
        code: 'DEMO',
        fullName: 'Associazione Sportiva Demo Soccer Club',
        address: 'Via dello Sport 123',
        city: 'Milano',
        province: 'MI',
        postalCode: '20100',
        country: 'IT',
        phone: '+39 02 12345678',
        email: 'info@demosoccerclub.it',
        website: 'www.demosoccerclub.it',
        fiscalCode: 'DMOSCC90A01F205X',
        vatNumber: '12345678901',
        foundedYear: 1990,
        federationNumber: 'MI12345',
        primaryColor: '#0066CC',
        secondaryColor: '#FFFFFF',
        description: 'Club storico di Milano con tradizione giovanile',
        presidentName: 'Mario Rossi',
        presidentEmail: 'presidente@demosoccerclub.it',
        presidentPhone: '+39 333 1234567',
        secretaryName: 'Luigi Bianchi',
        secretaryEmail: 'segreteria@demosoccerclub.it',
        secretaryPhone: '+39 333 7654321',
        socialFacebook: 'https://facebook.com/demosoccerclub',
        socialInstagram: '@demosoccerclub',
        subdomain: 'demo',
        plan: 'Pro',
        maxUsers: 50,
        maxAthletes: 500,
        maxTeams: 20,
        isActive: true,
        isTrial: false
      }
    });
    console.log('✅ Organizzazione Demo creata');

    // 2. Crea ruoli
    console.log('\n📦 Creazione ruoli...');
    const adminRole = await prisma.role.upsert({
      where: { 
        organizationId_name: {
          organizationId: demoOrg.id,
          name: 'Admin'
        }
      },
      update: {},
      create: {
        organizationId: demoOrg.id,
        name: 'Admin',
        description: 'Amministratore con accesso completo',
        permissions: ['*'],
        isSystem: true
      }
    });

    const coachRole = await prisma.role.upsert({
      where: { 
        organizationId_name: {
          organizationId: demoOrg.id,
          name: 'Coach'
        }
      },
      update: {},
      create: {
        organizationId: demoOrg.id,
        name: 'Coach',
        description: 'Allenatore con accesso alle squadre',
        permissions: [
          'athlete.view', 'athlete.create', 'athlete.update',
          'team.view', 'team.update',
          'match.view', 'match.create', 'match.update',
          'document.view'
        ],
        isSystem: true
      }
    });
    console.log('✅ Ruoli creati');

    // 3. Crea utente admin demo
    console.log('\n📦 Creazione utente admin demo...');
    const adminPassword = await bcrypt.hash('demo123456', 10);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@demosoccerclub.com' },
      update: { passwordHash: adminPassword },
      create: {
        email: 'admin@demosoccerclub.com',
        passwordHash: adminPassword,
        firstName: 'Admin',
        lastName: 'Demo',
        phone: '+39 333 9999999',
        organizationId: demoOrg.id,
        role: 'ADMIN',
        isActive: true
      }
    });

    // Crea UserOrganization
    await prisma.userOrganization.upsert({
      where: {
        userId_organizationId: {
          userId: adminUser.id,
          organizationId: demoOrg.id
        }
      },
      update: {},
      create: {
        userId: adminUser.id,
        organizationId: demoOrg.id,
        roleId: adminRole.id,
        isDefault: true
      }
    });
    console.log('✅ Utente admin creato');

    // 4. Crea posizioni
    console.log('\n📦 Creazione posizioni...');
    const positions = [
      { name: 'Portiere', sortOrder: 1 },
      { name: 'Difensore', sortOrder: 2 },
      { name: 'Centrocampista', sortOrder: 3 },
      { name: 'Attaccante', sortOrder: 4 }
    ];

    for (const pos of positions) {
      await prisma.position.upsert({
        where: {
          organizationId_name: {
            organizationId: demoOrg.id,
            name: pos.name
          }
        },
        update: {},
        create: {
          ...pos,
          organizationId: demoOrg.id
        }
      });
    }
    console.log('✅ Posizioni create');

    // 5. Crea squadre
    console.log('\n📦 Creazione squadre...');
    const teams = [
      { name: 'Under 15', category: 'Giovanissimi', minAge: 13, maxAge: 15 },
      { name: 'Under 17', category: 'Allievi', minAge: 15, maxAge: 17 },
      { name: 'Under 19', category: 'Juniores', minAge: 17, maxAge: 19 },
      { name: 'Prima Squadra', category: 'Prima Squadra', minAge: 16, maxAge: 99 }
    ];

    const createdTeams = [];
    for (const team of teams) {
      const created = await prisma.team.create({
        data: {
          ...team,
          organizationId: demoOrg.id,
          season: '2024-2025',
          budget: 50000,
          isActive: true
        }
      });
      createdTeams.push(created);
    }
    console.log('✅ Squadre create');

    // 6. Crea zone trasporto
    console.log('\n📦 Creazione zone trasporto...');
    const zones = [
      { name: 'Centro', distanceRange: '0-5km', monthlyFee: 30, color: '#4CAF50' },
      { name: 'Periferia Nord', distanceRange: '5-10km', monthlyFee: 50, color: '#2196F3' },
      { name: 'Periferia Sud', distanceRange: '5-10km', monthlyFee: 50, color: '#FF9800' },
      { name: 'Extra Urbano', distanceRange: '10+km', monthlyFee: 70, color: '#F44336' }
    ];

    const createdZones = [];
    for (const zone of zones) {
      const created = await prisma.transportZone.create({
        data: {
          ...zone,
          organizationId: demoOrg.id,
          description: `Zona ${zone.name} - Tariffa mensile €${zone.monthlyFee}`
        }
      });
      createdZones.push(created);
    }
    console.log('✅ Zone trasporto create');

    // 7. Crea pulmini
    console.log('\n📦 Creazione pulmini...');
    const buses = [
      { name: 'Pulmino 1', capacity: 15, plateNumber: 'MI123AB', driverName: 'Giovanni Verdi' },
      { name: 'Pulmino 2', capacity: 20, plateNumber: 'MI456CD', driverName: 'Paolo Neri' },
      { name: 'Pulmino 3', capacity: 15, plateNumber: 'MI789EF', driverName: 'Marco Blu' }
    ];

    for (const bus of buses) {
      await prisma.bus.create({
        data: {
          ...bus,
          organizationId: demoOrg.id,
          driverPhone: '+39 333 ' + Math.floor(Math.random() * 9000000 + 1000000)
        }
      });
    }
    console.log('✅ Pulmini creati');

    // 8. Crea atleti
    console.log('\n📦 Creazione atleti...');
    const firstNames = ['Marco', 'Luca', 'Alessandro', 'Francesco', 'Andrea', 'Matteo', 'Lorenzo', 'Davide', 'Giuseppe', 'Antonio'];
    const lastNames = ['Rossi', 'Bianchi', 'Verdi', 'Neri', 'Gialli', 'Blu', 'Viola', 'Rosa', 'Marrone', 'Grigio'];
    
    let athleteCount = 0;
    for (const team of createdTeams) {
      for (let i = 0; i < 20; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const birthYear = new Date().getFullYear() - team.minAge - Math.floor(Math.random() * (team.maxAge - team.minAge));
        
        await prisma.athlete.create({
          data: {
            organizationId: demoOrg.id,
            teamId: team.id,
            firstName,
            lastName,
            birthDate: new Date(birthYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            fiscalCode: `${firstName.substring(0, 3).toUpperCase()}${lastName.substring(0, 3).toUpperCase()}${birthYear.toString().substring(2)}A01F205X`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${athleteCount}@email.com`,
            phone: `333${Math.floor(Math.random() * 9000000 + 1000000)}`,
            address: `Via ${lastNames[Math.floor(Math.random() * lastNames.length)]} ${Math.floor(Math.random() * 100) + 1}`,
            city: 'Milano',
            province: 'MI',
            postalCode: '20100',
            jerseyNumber: i + 1,
            positionId: Math.floor(Math.random() * 4) + 1,
            status: Math.random() > 0.9 ? 'INJURED' : 'ACTIVE',
            usesTransport: Math.random() > 0.5,
            transportZoneId: Math.random() > 0.5 ? createdZones[Math.floor(Math.random() * createdZones.length)].id : null,
            notes: i === 0 ? 'Capitano della squadra' : null
          }
        });
        athleteCount++;
      }
    }
    console.log(`✅ ${athleteCount} atleti creati`);

    // 9. Crea tipi di documento
    console.log('\n📦 Creazione tipi documento...');
    const documentTypes = [
      { name: 'Certificato Medico', category: 'medical', isRequired: true, validityDays: 365 },
      { name: 'Documento Identità', category: 'identity', isRequired: true, validityDays: 1825 },
      { name: 'Tesseramento FIGC', category: 'federation', isRequired: true, validityDays: 365 },
      { name: 'Autorizzazione Genitori', category: 'authorization', isRequired: true, validityDays: 365 }
    ];

    for (const docType of documentTypes) {
      await prisma.documentType.create({
        data: {
          ...docType,
          organizationId: demoOrg.id,
          reminderDays: [30, 15, 7]
        }
      });
    }
    console.log('✅ Tipi documento creati');

    // 10. Crea tipi di pagamento
    console.log('\n📦 Creazione tipi pagamento...');
    const paymentTypes = [
      { name: 'Quota Iscrizione', category: 'registration', amount: 150, isRecurring: false },
      { name: 'Retta Mensile', category: 'monthly', amount: 80, isRecurring: true, frequency: 'monthly' },
      { name: 'Kit Abbigliamento', category: 'equipment', amount: 120, isRecurring: false },
      { name: 'Trasporto Mensile', category: 'transport', amount: 50, isRecurring: true, frequency: 'monthly' }
    ];

    for (const payType of paymentTypes) {
      await prisma.paymentType.create({
        data: {
          ...payType,
          organizationId: demoOrg.id
        }
      });
    }
    console.log('✅ Tipi pagamento creati');

    // 11. Crea impianti
    console.log('\n📦 Creazione impianti...');
    const venues = [
      { name: 'Campo Principale', address: 'Via dello Sport 123', capacity: 500, surfaceType: 'Erba naturale' },
      { name: 'Campo Secondario', address: 'Via dello Sport 125', capacity: 200, surfaceType: 'Erba sintetica' },
      { name: 'Palestra', address: 'Via dello Sport 127', capacity: 100, surfaceType: 'Indoor' }
    ];

    for (const venue of venues) {
      await prisma.venue.create({
        data: {
          ...venue,
          organizationId: demoOrg.id,
          city: 'Milano'
        }
      });
    }
    console.log('✅ Impianti creati');

    // 12. Crea sponsor
    console.log('\n📦 Creazione sponsor...');
    const sponsors = [
      { 
        name: 'TechSport Italia', 
        sponsorType: 'main',
        annualAmount: 50000,
        visibility: ['jersey', 'website', 'stadium']
      },
      { 
        name: 'Pizzeria Da Mario', 
        sponsorType: 'gold',
        annualAmount: 10000,
        visibility: ['website', 'materials']
      },
      { 
        name: 'Autofficina Rossi', 
        sponsorType: 'silver',
        annualAmount: 5000,
        visibility: ['website']
      }
    ];

    for (const sponsor of sponsors) {
      await prisma.sponsor.create({
        data: {
          ...sponsor,
          organizationId: demoOrg.id,
          website: `www.${sponsor.name.toLowerCase().replace(/\s+/g, '')}.it`,
          contactEmail: `info@${sponsor.name.toLowerCase().replace(/\s+/g, '')}.it`,
          contractStartDate: new Date(),
          contractEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        }
      });
    }
    console.log('✅ Sponsor creati');

    console.log('\n✨ Seed completato con successo!');
    console.log('\n📝 Credenziali di accesso:');
    console.log('Email: admin@demosoccerclub.com');
    console.log('Password: demo123456');

  } catch (error) {
    console.error('❌ Errore durante il seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
