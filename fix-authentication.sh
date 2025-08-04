#!/bin/bash

echo "🔧 Fixing Soccer Management System Authentication"
echo "================================================"

cd /Users/lucamambelli/Desktop/soccer-management-system/backend

# 1. Generate fresh password hashes
echo ""
echo "📝 Generating password hashes..."
cat > temp-hash-generator.js << 'EOF'
const bcrypt = require('bcryptjs');

async function main() {
  const hash1 = await bcrypt.hash('demo123456', 10);
  const hash2 = await bcrypt.hash('admin123', 10);
  const hash3 = await bcrypt.hash('superadmin123456', 10);
  
  console.log('demo@soccermanager.com:', hash1);
  console.log('admin@demosoccerclub.com:', hash2);
  console.log('superadmin@soccermanager.com:', hash3);
}

main();
EOF

node temp-hash-generator.js > hashes.txt

# 2. Create SQL script with the correct hashes
echo ""
echo "📝 Creating SQL fix script..."
DEMO_HASH=$(grep "demo@soccermanager.com:" hashes.txt | cut -d' ' -f2)
ADMIN_HASH=$(grep "admin@demosoccerclub.com:" hashes.txt | cut -d' ' -f2)
SUPER_HASH=$(grep "superadmin@soccermanager.com:" hashes.txt | cut -d' ' -f2)

cat > fix-auth-final.sql << EOF
-- Fix authentication for all demo users

-- 1. Ensure demo organization exists
INSERT INTO "Organization" (
    id, name, code, plan, "maxUsers", "maxAthletes", "maxTeams",
    "isActive", "isTrial", settings, "createdAt", "updatedAt"
) 
SELECT 
    gen_random_uuid(), 
    'Demo Soccer Club', 
    'DEMO', 
    'Pro',
    20,
    200,
    10,
    true,
    false,
    '{}',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM "Organization" WHERE code = 'DEMO'
);

-- 2. Create/Update demo user
INSERT INTO "User" (
    id, email, "passwordHash", role, "firstName", "lastName",
    "organizationId", "isActive", "createdAt", "updatedAt"
)
SELECT
    gen_random_uuid(),
    'demo@soccermanager.com',
    '${DEMO_HASH}',
    'ADMIN',
    'Demo',
    'User',
    (SELECT id FROM "Organization" WHERE code = 'DEMO'),
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM "User" WHERE email = 'demo@soccermanager.com'
);

UPDATE "User" 
SET 
    "passwordHash" = '${DEMO_HASH}',
    "organizationId" = (SELECT id FROM "Organization" WHERE code = 'DEMO'),
    "isActive" = true,
    "lockedUntil" = NULL,
    "failedLoginAttempts" = 0
WHERE email = 'demo@soccermanager.com';

-- 3. Create/Update admin legacy user
INSERT INTO "User" (
    id, email, "passwordHash", role, "firstName", "lastName",
    "organizationId", "isActive", "createdAt", "updatedAt"
)
SELECT
    gen_random_uuid(),
    'admin@demosoccerclub.com',
    '${ADMIN_HASH}',
    'ADMIN',
    'Admin',
    'Demo',
    (SELECT id FROM "Organization" WHERE code = 'DEMO'),
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM "User" WHERE email = 'admin@demosoccerclub.com'
);

UPDATE "User" 
SET 
    "passwordHash" = '${ADMIN_HASH}',
    "organizationId" = (SELECT id FROM "Organization" WHERE code = 'DEMO'),
    "isActive" = true,
    "lockedUntil" = NULL,
    "failedLoginAttempts" = 0
WHERE email = 'admin@demosoccerclub.com';

-- 4. Show results
SELECT email, "firstName", "lastName", "isActive", "organizationId" IS NOT NULL as has_org
FROM "User" 
WHERE email IN ('demo@soccermanager.com', 'admin@demosoccerclub.com');
EOF

# 3. Execute SQL
echo ""
echo "📊 Executing SQL fix..."
psql -U lucamambelli -d soccer_management -f fix-auth-final.sql

# 4. Clean up
rm temp-hash-generator.js hashes.txt fix-auth-final.sql

echo ""
echo "✅ Authentication fixed!"
echo ""
echo "📝 You can now login with:"
echo "   - demo@soccermanager.com / demo123456"
echo "   - admin@demosoccerclub.com / admin123"
echo ""
echo "🔄 Please restart the backend server if it's running"
