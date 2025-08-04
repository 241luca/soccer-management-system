const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create organization
  const org = await prisma.organization.upsert({
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
  
  console.log('Organization:', org.id);
  
  // Create user
  const hash = bcrypt.hashSync('demo123456', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@soccermanager.com' },
    update: { 
      passwordHash: hash,
      organizationId: org.id,
      isActive: true
    },
    create: {
      email: 'demo@soccermanager.com',
      passwordHash: hash,
      firstName: 'Demo',
      lastName: 'User',
      role: 'ADMIN',
      organizationId: org.id,
      isActive: true
    }
  });
  
  console.log('User created:', user.email, user.id);
  
  // Test the password
  const valid = bcrypt.compareSync('demo123456', user.passwordHash);
  console.log('Password valid:', valid);
  
  await prisma.$disconnect();
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
