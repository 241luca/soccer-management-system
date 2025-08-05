const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Generate hash
    const password = 'superadmin123456';
    const hash = await bcrypt.hash(password, 10);
    
    console.log('Password:', password);
    console.log('Generated hash:', hash);
    
    // Delete existing
    await prisma.superAdmin.deleteMany({
      where: { email: 'superadmin@soccermanager.com' }
    });
    
    // Create new
    const superAdmin = await prisma.superAdmin.create({
      data: {
        email: 'superadmin@soccermanager.com',
        passwordHash: hash,
        firstName: 'Super',
        lastName: 'Admin',
        isActive: true
      }
    });
    
    console.log('Created Super Admin:', superAdmin);
    
    // Test password
    const valid = await bcrypt.compare(password, superAdmin.passwordHash);
    console.log('Password test:', valid ? 'PASSED' : 'FAILED');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
