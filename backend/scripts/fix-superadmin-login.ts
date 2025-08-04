// Fix per il login del superadmin
// backend/scripts/fix-superadmin-login.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function fixSuperAdminLogin() {
  console.log('🔧 Fixing SuperAdmin login...\n');

  try {
    // 1. Prima assicuriamoci che il superadmin esista nella tabella User
    const superAdminPassword = await bcrypt.hash('superadmin123456', 10);
    
    const superAdmin = await prisma.user.upsert({
      where: { email: 'superadmin@soccermanager.com' },
      update: {
        passwordHash: superAdminPassword,
        isActive: true,
        role: 'ADMIN'
      },
      create: {
        email: 'superadmin@soccermanager.com',
        passwordHash: superAdminPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'ADMIN',
        isActive: true
      }
    });

    console.log('✅ SuperAdmin user created/updated in User table');

    // 2. Modifica il file auth.service.ts per gestire superadmin dalla tabella User
    const authServicePath = path.join(process.cwd(), 'src/services/auth.service.ts');
    let authServiceContent = fs.readFileSync(authServicePath, 'utf8');

    // Trova e sostituisci il metodo loginSuperAdmin
    const newLoginSuperAdminMethod = `  async loginSuperAdmin(email: string, password: string) {
    // Check if it's a valid superadmin email
    const SUPER_ADMIN_EMAILS = ['superadmin@soccermanager.com'];
    
    if (!SUPER_ADMIN_EMAILS.includes(email)) {
      throw new UnauthorizedError('Invalid super admin credentials');
    }

    // Find user in regular User table
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate super admin token without organization context
    const payload = {
      userId: user.id,
      email: user.email,
      isSuperAdmin: true,
      permissions: ['*'] // All permissions
    };

    const accessToken = jwt.sign(
      payload,
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      payload,
      this.JWT_REFRESH_SECRET,
      { expiresIn: this.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
    );

    logger.info(\`Super admin \${user.email} logged in\`);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: 'SUPER_ADMIN',
        isSuperAdmin: true
      },
      accessToken,
      refreshToken
    };
  }`;

    // Sostituisci il metodo esistente
    const methodStart = authServiceContent.indexOf('async loginSuperAdmin(email: string, password: string)');
    if (methodStart > -1) {
      const methodEnd = authServiceContent.indexOf('\n  }', methodStart) + 4;
      const beforeMethod = authServiceContent.substring(0, methodStart);
      const afterMethod = authServiceContent.substring(methodEnd);
      
      authServiceContent = beforeMethod + newLoginSuperAdminMethod + afterMethod;
      
      // Salva il file modificato
      fs.writeFileSync(authServicePath, authServiceContent);
      console.log('✅ auth.service.ts patched successfully');
    }

    console.log('\n✅ SuperAdmin login fix completed!');
    console.log('\n📝 You can now login with:');
    console.log('   Email: superadmin@soccermanager.com');
    console.log('   Password: superadmin123456\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixSuperAdminLogin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
