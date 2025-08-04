import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating demo data...');
  
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
  
  // Create user
  const hash = await bcrypt.hash('demo123456', 10);
  await prisma.user.upsert({
    where: { email: 'demo@soccermanager.com' },
    update: {},
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
  
  console.log('✅ Demo user created!');
  console.log('Email: demo@soccermanager.com');
  console.log('Password: demo123456');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
