-- Fix admin@demosoccerclub.com user setup
-- This script creates the necessary roles and UserOrganization record

-- Get the organization ID
DO $$
DECLARE
    org_id UUID;
    user_id UUID;
    admin_role_id UUID;
BEGIN
    -- Get organization ID
    SELECT id INTO org_id FROM "Organization" WHERE code = 'DEMO';
    
    -- Get user ID
    SELECT id INTO user_id FROM "User" WHERE email = 'admin@demosoccerclub.com';
    
    -- Create Admin role if it doesn't exist
    INSERT INTO "Role" (id, "organizationId", name, description, permissions, "isSystem", "createdAt", "updatedAt")
    VALUES (
        gen_random_uuid(),
        org_id,
        'Admin',
        'Administrator with full permissions',
        '["ORGANIZATION_VIEW", "ORGANIZATION_UPDATE", "USER_VIEW", "USER_CREATE", "USER_UPDATE", "USER_DELETE", "ROLE_VIEW", "ROLE_CREATE", "ROLE_UPDATE", "ROLE_DELETE", "ATHLETE_VIEW", "ATHLETE_CREATE", "ATHLETE_UPDATE", "ATHLETE_DELETE", "TEAM_VIEW", "TEAM_CREATE", "TEAM_UPDATE", "TEAM_DELETE", "MATCH_VIEW", "MATCH_CREATE", "MATCH_UPDATE", "MATCH_DELETE", "DOCUMENT_VIEW", "DOCUMENT_CREATE", "DOCUMENT_UPDATE", "DOCUMENT_DELETE", "PAYMENT_VIEW", "PAYMENT_CREATE", "PAYMENT_UPDATE", "PAYMENT_DELETE", "NOTIFICATION_VIEW", "NOTIFICATION_CREATE", "TRANSPORT_VIEW", "TRANSPORT_CREATE", "TRANSPORT_UPDATE", "TRANSPORT_DELETE", "REPORT_VIEW", "REPORT_CREATE"]',
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO admin_role_id;
    
    -- If role already existed, get its ID
    IF admin_role_id IS NULL THEN
        SELECT id INTO admin_role_id FROM "Role" WHERE "organizationId" = org_id AND name = 'Admin';
    END IF;
    
    -- Create other default roles
    INSERT INTO "Role" ("organizationId", name, description, permissions, "isSystem", "createdAt", "updatedAt")
    VALUES 
    (
        org_id,
        'Coach',
        'Coach with team management permissions',
        '["ATHLETE_VIEW", "ATHLETE_CREATE", "ATHLETE_UPDATE", "TEAM_VIEW", "TEAM_UPDATE", "MATCH_VIEW", "MATCH_CREATE", "MATCH_UPDATE", "DOCUMENT_VIEW", "DOCUMENT_CREATE"]',
        true,
        NOW(),
        NOW()
    ),
    (
        org_id,
        'Staff',
        'Staff with view permissions',
        '["ATHLETE_VIEW", "TEAM_VIEW", "MATCH_VIEW", "DOCUMENT_VIEW"]',
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT DO NOTHING;
    
    -- Create UserOrganization record
    INSERT INTO "UserOrganization" (id, "userId", "organizationId", "roleId", "isDefault", "joinedAt")
    VALUES (
        gen_random_uuid(),
        user_id,
        org_id,
        admin_role_id,
        true,
        NOW()
    )
    ON CONFLICT ("userId", "organizationId") DO NOTHING;
    
    RAISE NOTICE 'Setup completed for admin@demosoccerclub.com';
END $$;
