#!/bin/bash

echo "🔧 Fix immediato per utenti di produzione"
echo "=========================================="

cd /Users/lucamambelli/Desktop/soccer-management-system/backend

# 1. Genera gli hash delle password
cat > generate-prod-hashes.js << 'EOF'
const bcrypt = require('bcryptjs');

async function generateHashes() {
  const hash1 = await bcrypt.hash('ravenna2024!', 10);
  const hash2 = await bcrypt.hash('manager2024!', 10);
  
  console.log(`RAVENNA_HASH='${hash1}'`);
  console.log(`MANAGER_HASH='${hash2}'`);
}

generateHashes();
EOF

# Esegui e salva gli hash
node generate-prod-hashes.js > prod-hashes.sh
source prod-hashes.sh

# 2. Crea SQL per sistemare tutto
cat > fix-production-users.sql << EOF
-- 1. Assicurati che l'organizzazione Ravenna esista
INSERT INTO "Organization" (
    id, name, code, subdomain, plan, "maxUsers", "maxAthletes", "maxTeams",
    "isActive", "isTrial", settings, "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid(), 
    'ASD Ravenna Calcio', 
    'RAVENNA',
    'ravenna',
    'Enterprise',
    999999,
    999999,
    999999,
    true,
    false,
    '{"theme":"blue","currency":"EUR","language":"it"}',
    NOW(),
    NOW()
) ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    plan = EXCLUDED.plan,
    "isActive" = true;

-- 2. Crea ruoli per Ravenna
INSERT INTO "Role" (
    id, name, code, description, permissions, "organizationId", "createdAt", "updatedAt"
)
SELECT 
    gen_random_uuid(),
    'Proprietario',
    'OWNER',
    'Accesso completo',
    ARRAY['*'],
    o.id,
    NOW(),
    NOW()
FROM "Organization" o
WHERE o.code = 'RAVENNA'
AND NOT EXISTS (
    SELECT 1 FROM "Role" r 
    WHERE r."organizationId" = o.id AND r.code = 'OWNER'
);

-- 3. Crea/aggiorna admin Ravenna
INSERT INTO "User" (
    id, email, "passwordHash", role, "firstName", "lastName",
    "isActive", "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid(),
    'admin@asdravennacalcio.it',
    '${RAVENNA_HASH}',
    'ADMIN',
    'Amministratore',
    'Ravenna',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    "passwordHash" = EXCLUDED."passwordHash",
    "isActive" = true;

-- 4. Collega admin a Ravenna
INSERT INTO "UserOrganization" (
    id, "userId", "organizationId", "roleId", "isActive", "isDefault", "createdAt", "updatedAt"
)
SELECT 
    gen_random_uuid(),
    u.id,
    o.id,
    r.id,
    true,
    true,
    NOW(),
    NOW()
FROM "User" u
CROSS JOIN "Organization" o
CROSS JOIN "Role" r
WHERE u.email = 'admin@asdravennacalcio.it'
AND o.code = 'RAVENNA'
AND r."organizationId" = o.id AND r.code = 'OWNER'
AND NOT EXISTS (
    SELECT 1 FROM "UserOrganization" uo
    WHERE uo."userId" = u.id AND uo."organizationId" = o.id
);

-- 5. Crea/aggiorna Manager multi-società
INSERT INTO "User" (
    id, email, "passwordHash", role, "firstName", "lastName",
    "isActive", "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid(),
    'manager@soccermanager.com',
    '${MANAGER_HASH}',
    'ADMIN',
    'Manager',
    'MultiSocietà',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    "passwordHash" = EXCLUDED."passwordHash",
    "isActive" = true;

-- 6. Collega Manager a DEMO
INSERT INTO "UserOrganization" (
    id, "userId", "organizationId", "roleId", "isActive", "isDefault", "createdAt", "updatedAt"
)
SELECT 
    gen_random_uuid(),
    u.id,
    o.id,
    r.id,
    true,
    false,
    NOW(),
    NOW()
FROM "User" u
CROSS JOIN "Organization" o
CROSS JOIN "Role" r
WHERE u.email = 'manager@soccermanager.com'
AND o.code = 'DEMO'
AND r."organizationId" = o.id AND r.code = 'OWNER'
AND NOT EXISTS (
    SELECT 1 FROM "UserOrganization" uo
    WHERE uo."userId" = u.id AND uo."organizationId" = o.id
);

-- 7. Collega Manager a RAVENNA
INSERT INTO "UserOrganization" (
    id, "userId", "organizationId", "roleId", "isActive", "isDefault", "createdAt", "updatedAt"
)
SELECT 
    gen_random_uuid(),
    u.id,
    o.id,
    r.id,
    true,
    true,
    NOW(),
    NOW()
FROM "User" u
CROSS JOIN "Organization" o
CROSS JOIN "Role" r
WHERE u.email = 'manager@soccermanager.com'
AND o.code = 'RAVENNA'
AND r."organizationId" = o.id AND r.code = 'OWNER'
AND NOT EXISTS (
    SELECT 1 FROM "UserOrganization" uo
    WHERE uo."userId" = u.id AND uo."organizationId" = o.id
);

-- 8. Crea squadre per Ravenna
INSERT INTO "Team" (
    id, "organizationId", name, category, season, "minAge", "maxAge", 
    budget, "isActive", "createdAt", "updatedAt"
)
SELECT 
    gen_random_uuid(),
    o.id,
    t.name,
    t.category,
    '2024-25',
    t.min_age,
    t.max_age,
    10000,
    true,
    NOW(),
    NOW()
FROM "Organization" o
CROSS JOIN (VALUES 
    ('Prima Squadra', 'Serie D', 18, 99),
    ('Juniores', 'Juniores Nazionale', 17, 19),
    ('Allievi', 'Allievi Regionali', 15, 17),
    ('Giovanissimi', 'Giovanissimi Regionali', 13, 15),
    ('Esordienti', 'Esordienti', 11, 13),
    ('Pulcini', 'Pulcini', 9, 11)
) AS t(name, category, min_age, max_age)
WHERE o.code = 'RAVENNA'
AND NOT EXISTS (
    SELECT 1 FROM "Team" 
    WHERE "organizationId" = o.id AND name = t.name
);

-- 9. Verifica risultati
SELECT 
    u.email,
    u."firstName" || ' ' || u."lastName" as nome,
    COUNT(DISTINCT o.code) as num_societa,
    STRING_AGG(o.code, ', ') as societa
FROM "User" u
JOIN "UserOrganization" uo ON uo."userId" = u.id
JOIN "Organization" o ON o.id = uo."organizationId"
WHERE u.email IN ('admin@asdravennacalcio.it', 'manager@soccermanager.com')
GROUP BY u.id, u.email, u."firstName", u."lastName";
EOF

# 3. Esegui SQL
echo ""
echo "📊 Esecuzione fix SQL..."
psql -U lucamambelli -d soccer_management -f fix-production-users.sql

# 4. Cleanup
rm generate-prod-hashes.js prod-hashes.sh fix-production-users.sql

echo ""
echo "✅ Fix completato!"
echo ""
echo "📝 Credenziali funzionanti:"
echo "   1. admin@asdravennacalcio.it / ravenna2024!"
echo "   2. manager@soccermanager.com / manager2024!"
echo ""
