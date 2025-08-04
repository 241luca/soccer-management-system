-- Fix demo users authentication
-- Run this in PostgreSQL to ensure demo users can login

-- First, check if demo organization exists
DO $$
DECLARE
    demo_org_id UUID;
    demo_user_id UUID;
    owner_role_id UUID;
BEGIN
    -- Get or create demo organization
    SELECT id INTO demo_org_id FROM "Organization" WHERE code = 'DEMO';
    
    IF demo_org_id IS NULL THEN
        INSERT INTO "Organization" (
            id, name, code, plan, "maxUsers", "maxAthletes", "maxTeams",
            "isActive", "isTrial", settings, "createdAt", "updatedAt"
        ) VALUES (
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
        ) RETURNING id INTO demo_org_id;
        
        RAISE NOTICE 'Created Demo Organization with ID: %', demo_org_id;
    END IF;

    -- Update demo user password (bcrypt hash for 'demo123456')
    UPDATE "User" 
    SET 
        "passwordHash" = '$2a$10$KwM3Jf6l2kADxM3Mwn5sRu7rE7D8XM4Y5H9FZB8YJWnLVQX.RH2tC',
        "organizationId" = demo_org_id,
        "isActive" = true,
        "lockedUntil" = NULL,
        "failedLoginAttempts" = 0
    WHERE email = 'demo@soccermanager.com';
    
    -- Get demo user id
    SELECT id INTO demo_user_id FROM "User" WHERE email = 'demo@soccermanager.com';
    
    -- If user doesn't exist, create it
    IF demo_user_id IS NULL THEN
        INSERT INTO "User" (
            id, email, "passwordHash", role, "firstName", "lastName",
            "organizationId", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            gen_random_uuid(),
            'demo@soccermanager.com',
            '$2a$10$KwM3Jf6l2kADxM3Mwn5sRu7rE7D8XM4Y5H9FZB8YJWnLVQX.RH2tC',
            'ADMIN',
            'Demo',
            'User',
            demo_org_id,
            true,
            NOW(),
            NOW()
        ) RETURNING id INTO demo_user_id;
        
        RAISE NOTICE 'Created Demo User with ID: %', demo_user_id;
    END IF;

    -- Create owner role if doesn't exist
    SELECT id INTO owner_role_id FROM "Role" 
    WHERE "organizationId" = demo_org_id AND code = 'OWNER';
    
    IF owner_role_id IS NULL THEN
        INSERT INTO "Role" (
            id, name, code, description, permissions, "organizationId",
            "createdAt", "updatedAt"
        ) VALUES (
            gen_random_uuid(),
            'Owner',
            'OWNER',
            'Full access to everything',
            ARRAY['*'],
            demo_org_id,
            NOW(),
            NOW()
        ) RETURNING id INTO owner_role_id;
        
        RAISE NOTICE 'Created Owner Role with ID: %', owner_role_id;
    END IF;

    -- Create UserOrganization link if doesn't exist
    INSERT INTO "UserOrganization" (
        id, "userId", "organizationId", "roleId", "isActive", "isDefault",
        "createdAt", "updatedAt"
    ) 
    SELECT 
        gen_random_uuid(),
        demo_user_id,
        demo_org_id,
        owner_role_id,
        true,
        true,
        NOW(),
        NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM "UserOrganization" 
        WHERE "userId" = demo_user_id AND "organizationId" = demo_org_id
    );

    RAISE NOTICE 'Demo user setup completed successfully!';
END $$;

-- Also create/update the old admin@demosoccerclub.com for compatibility
UPDATE "User" 
SET 
    "passwordHash" = '$2a$10$QJaQBhXXPHXPI3d9.PgCe.Vb4M/3lXRFH84TtUxzSJLUKFQBpwmXy',
    "organizationId" = (SELECT id FROM "Organization" WHERE code = 'DEMO'),
    "isActive" = true
WHERE email = 'admin@demosoccerclub.com';

-- Create teams if they don't exist
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
CROSS JOIN (
    VALUES 
        ('Prima Squadra', 'Serie D', 18, 99),
        ('Under 19', 'Juniores', 17, 19),
        ('Under 17', 'Allievi', 15, 17),
        ('Under 15', 'Giovanissimi', 13, 15)
) AS t(name, category, min_age, max_age)
WHERE o.code = 'DEMO'
AND NOT EXISTS (
    SELECT 1 FROM "Team" 
    WHERE "organizationId" = o.id AND name = t.name AND season = '2024-25'
);

-- Show final status
SELECT 
    u.email,
    u."firstName",
    u."lastName",
    u."isActive",
    o.name as organization,
    o.code as org_code,
    r.name as role_name
FROM "User" u
LEFT JOIN "Organization" o ON u."organizationId" = o.id
LEFT JOIN "UserOrganization" uo ON u.id = uo."userId"
LEFT JOIN "Role" r ON uo."roleId" = r.id
WHERE u.email IN ('demo@soccermanager.com', 'admin@demosoccerclub.com', 'superadmin@soccermanager.com');
