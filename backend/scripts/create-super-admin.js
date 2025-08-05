const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    const password = 'superadmin123456';
    const passwordHash = await bcrypt.hash(password, 10);
    
    console.log('Generated hash:', passwordHash);
    
    // Create or update Super Admin
    const superAdmin = await prisma.superAdmin.upsert({
      where: { email: 'superadmin@soccermanager.com' },
      update: {
        passwordHash: passwordHash,
        firstName: 'Super',
        lastName: 'Admin',
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        email: 'superadmin@soccermanager.com',
        passwordHash: passwordHash,
        firstName: 'Super',
        lastName: 'Admin',
        isActive: true
      }
    });
    
    console.log('Super Admin created/updated:', superAdmin);
    
    // Test the password
    const isValid = await bcrypt.compare(password, superAdmin.passwordHash);
    console.log('Password validation test:', isValid ? 'PASSED' : 'FAILED');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
