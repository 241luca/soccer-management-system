-- Fix definitivo per tutti gli utenti
-- Questo script sistema TUTTO da zero

BEGIN;

-- 1. Crea/verifica organizzazioni
INSERT INTO "Organization" (id, name, code, plan, "maxUsers", "maxAthletes", "maxTeams", "isActive", "isTrial", settings, "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid(), 'Demo Soccer Club', 'DEMO', 'Pro', 20, 200, 10, true, false, '{}', NOW(), NOW()),
    (gen_random_uuid(), 'ASD Ravenna Calcio', 'RAVENNA', 'Enterprise', 999999, 999999, 999999, true, false, '{}', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- 2. Crea ruoli per ogni organizzazione
WITH orgs AS (
    SELECT id, code FROM "Organization" WHERE code IN ('DEMO', 'RAVENNA')
)
INSERT INTO "Role" (id, name, code, description, permissions, "organizationId", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    'Owner',
    'OWNER',
    'Accesso completo',
    ARRAY['*'],
    o.id,
    NOW(),
    NOW()
FROM orgs o
WHERE NOT EXISTS (
    SELECT 1 FROM "Role" r WHERE r."organizationId" = o.id AND r.code = 'OWNER'
);

-- 3. Fix utente demo@soccermanager.com
DO $$
DECLARE
    v_user_id UUID;
    v_demo_org_id UUID;
    v_demo_role_id UUID;
BEGIN
    -- Get IDs
    SELECT id INTO v_demo_org_id FROM "Organization" WHERE code = 'DEMO';
    SELECT id INTO v_demo_role_id FROM "Role" WHERE "organizationId" = v_demo_org_id AND code = 'OWNER';
    SELECT id INTO v_user_id FROM "User" WHERE email = 'demo@soccermanager.com';
    
    -- Create UserOrganization if not exists
    IF v_user_id IS NOT NULL AND v_demo_org_id IS NOT NULL AND v_demo_role_id IS NOT NULL THEN
        INSERT INTO "UserOrganization" (id, "userId", "organizationId", "roleId", "isActive", "isDefault", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), v_user_id, v_demo_org_id, v_demo_role_id, true, true, NOW(), NOW())
        ON CONFLICT ("userId", "organizationId") DO UPDATE
        SET "roleId" = v_demo_role_id, "isActive" = true, "isDefault" = true;
        
        RAISE NOTICE 'Fixed demo@soccermanager.com';
    END IF;
END $$;

-- 4. Fix utente admin@asdravennacalcio.it
DO $$
DECLARE
    v_user_id UUID;
    v_ravenna_org_id UUID;
    v_ravenna_role_id UUID;
BEGIN
    -- Get IDs
    SELECT id INTO v_ravenna_org_id FROM "Organization" WHERE code = 'RAVENNA';
    SELECT id INTO v_ravenna_role_id FROM "Role" WHERE "organizationId" = v_ravenna_org_id AND code = 'OWNER';
    SELECT id INTO v_user_id FROM "User" WHERE email = 'admin@asdravennacalcio.it';
    
    -- Create UserOrganization if not exists
    IF v_user_id IS NOT NULL AND v_ravenna_org_id IS NOT NULL AND v_ravenna_role_id IS NOT NULL THEN
        INSERT INTO "UserOrganization" (id, "userId", "organizationId", "roleId", "isActive", "isDefault", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), v_user_id, v_ravenna_org_id, v_ravenna_role_id, true, true, NOW(), NOW())
        ON CONFLICT ("userId", "organizationId") DO UPDATE
        SET "roleId" = v_ravenna_role_id, "isActive" = true, "isDefault" = true;
        
        RAISE NOTICE 'Fixed admin@asdravennacalcio.it';
    END IF;
END $$;

-- 5. Fix utente manager@soccermanager.com (multi-org)
DO $$
DECLARE
    v_user_id UUID;
    v_demo_org_id UUID;
    v_demo_role_id UUID;
    v_ravenna_org_id UUID;
    v_ravenna_role_id UUID;
BEGIN
    -- Get IDs
    SELECT id INTO v_demo_org_id FROM "Organization" WHERE code = 'DEMO';
    SELECT id INTO v_demo_role_id FROM "Role" WHERE "organizationId" = v_demo_org_id AND code = 'OWNER';
    SELECT id INTO v_ravenna_org_id FROM "Organization" WHERE code = 'RAVENNA';
    SELECT id INTO v_ravenna_role_id FROM "Role" WHERE "organizationId" = v_ravenna_org_id AND code = 'OWNER';
    SELECT id INTO v_user_id FROM "User" WHERE email = 'manager@soccermanager.com';
    
    -- Create UserOrganization for DEMO
    IF v_user_id IS NOT NULL AND v_demo_org_id IS NOT NULL AND v_demo_role_id IS NOT NULL THEN
        INSERT INTO "UserOrganization" (id, "userId", "organizationId", "roleId", "isActive", "isDefault", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), v_user_id, v_demo_org_id, v_demo_role_id, true, false, NOW(), NOW())
        ON CONFLICT ("userId", "organizationId") DO UPDATE
        SET "roleId" = v_demo_role_id, "isActive" = true, "isDefault" = false;
    END IF;
    
    -- Create UserOrganization for RAVENNA (default)
    IF v_user_id IS NOT NULL AND v_ravenna_org_id IS NOT NULL AND v_ravenna_role_id IS NOT NULL THEN
        INSERT INTO "UserOrganization" (id, "userId", "organizationId", "roleId", "isActive", "isDefault", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), v_user_id, v_ravenna_org_id, v_ravenna_role_id, true, true, NOW(), NOW())
        ON CONFLICT ("userId", "organizationId") DO UPDATE
        SET "roleId" = v_ravenna_role_id, "isActive" = true, "isDefault" = true;
        
        RAISE NOTICE 'Fixed manager@soccermanager.com';
    END IF;
END $$;

-- 6. Rimuovi organizationId legacy dalla tabella User (non più necessario)
UPDATE "User" SET "organizationId" = NULL WHERE email IN (
    'admin@asdravennacalcio.it',
    'manager@soccermanager.com'
);

-- 7. Verifica finale
SELECT 
    u.email,
    COUNT(DISTINCT uo."organizationId") as num_orgs,
    STRING_AGG(o.code, ', ' ORDER BY o.code) as organizations,
    BOOL_OR(uo."isDefault") as has_default
FROM "User" u
LEFT JOIN "UserOrganization" uo ON uo."userId" = u.id
LEFT JOIN "Organization" o ON o.id = uo."organizationId"
WHERE u.email IN (
    'demo@soccermanager.com',
    'admin@asdravennacalcio.it',
    'manager@soccermanager.com'
)
GROUP BY u.id, u.email
ORDER BY u.email;

COMMIT;
