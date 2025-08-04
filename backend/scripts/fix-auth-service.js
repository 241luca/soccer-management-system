// Patch per il servizio di autenticazione
// backend/scripts/fix-auth-service.js

import fs from 'fs';
import path from 'path';

const authServicePath = path.join(process.cwd(), 'src/services/auth.service.ts');

// Leggi il file
let content = fs.readFileSync(authServicePath, 'utf8');

// Trova la sezione di login che gestisce le organizzazioni
const loginMethodStart = content.indexOf('async login(data: LoginInput)');
const loginMethodEnd = content.indexOf('async register', loginMethodStart);

if (loginMethodStart > -1 && loginMethodEnd > -1) {
  const beforeMethod = content.substring(0, loginMethodStart);
  const afterMethod = content.substring(loginMethodEnd);
  
  // Nuovo metodo login che gestisce sia UserOrganization che organizationId legacy
  const newLoginMethod = `async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        userOrganizations: {
          include: {
            organization: true,
            role: true
          }
        },
        organization: true // Include direct organization for legacy support
      }
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedError('Account is locked. Please try again later.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      // Increment failed login attempts
      await this.handleFailedLogin(user.id);
      throw new UnauthorizedError('Invalid credentials');
    }

    // Determine organization context
    let organizationId: string;
    let organization: Organization;
    let userRole: any;

    // Check if user has UserOrganization records (new multi-tenant)
    if (user.userOrganizations && user.userOrganizations.length > 0) {
      if (data.organizationId) {
        // Specific organization requested
        const userOrg = user.userOrganizations.find(uo => 
          uo.organizationId === data.organizationId
        );

        if (!userOrg) {
          throw new ForbiddenError('User does not belong to this organization');
        }

        organizationId = userOrg.organizationId;
        organization = userOrg.organization;
        userRole = userOrg.role;
      } else if (user.userOrganizations.length === 1) {
        // Single organization - use it
        const userOrg = user.userOrganizations[0];
        organizationId = userOrg.organizationId;
        organization = userOrg.organization;
        userRole = userOrg.role;
      } else {
        // Multiple organizations - return list for selection
        return {
          requiresOrganizationSelection: true,
          organizations: user.userOrganizations.map(uo => ({
            id: uo.organizationId,
            name: uo.organization.name,
            role: uo.role?.name || 'Member'
          }))
        };
      }
    } else if (user.organizationId && user.organization) {
      // Legacy: User has direct organizationId
      organizationId = user.organizationId;
      organization = user.organization;
      // Create a default role for legacy users
      userRole = {
        id: 'legacy-admin',
        name: 'Administrator',
        permissions: ['*'] // Full permissions for legacy admin users
      };
    } else {
      throw new UnauthorizedError('User has no organization access');
    }

    // Reset failed login attempts
    await this.resetFailedLogins(user.id);

    // Generate tokens
    const payload = {
      userId: user.id,
      email: user.email,
      organizationId,
      roleId: userRole?.id,
      permissions: userRole?.permissions || []
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // Store refresh token (optional - for token revocation)
    await this.storeRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: userRole?.name || user.role,
        organizationId
      },
      organization: {
        id: organization.id,
        name: organization.name,
        plan: organization.plan
      }
    };
  }

  `;
  
  content = beforeMethod + newLoginMethod + afterMethod;
  
  // Scrivi il file aggiornato
  fs.writeFileSync(authServicePath, content);
  console.log('✅ Auth service patched successfully!');
} else {
  console.error('❌ Could not find login method in auth service');
}
