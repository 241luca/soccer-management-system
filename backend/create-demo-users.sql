-- Crea utenti demo per Soccer Management System
-- Questo script crea tutto il necessario per iniziare

-- 1. Crea l'organizzazione DEMO
INSERT INTO "Organization" (id, name, code, email, phone, address, city, province, "postalCode", "fiscalCode", "createdAt", "updatedAt")
VALUES (
    '43c973a6-5e20-43af-a295-805f1d7c86b1',
    'Demo Soccer Club',
    'DEMO',
    'info@demosoccerclub.com',
    '02-1234567',
    'Via dello Sport 10',
    'Milano',
    'MI',
    '20100',
    'IT12345678901',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. Crea l'utente demo@soccermanager.com
INSERT INTO "User" (id, email, password, "firstName", "lastName", "isActive", "isSuperAdmin", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid(),
    'demo@soccermanager.com',
    -- Password: demo123456 (già hashata con bcrypt)
    '$2b$10$YourHashedPasswordHere',
    'Demo',
    'User',
    true,
    false,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- 3. Crea l'utente admin@demosoccerclub.com  
INSERT INTO "User" (id, email, password, "firstName", "lastName", "isActive", "isSuperAdmin", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid(),
    'admin@demosoccerclub.com',
    -- Password: admin123 (già hashata con bcrypt)
    '$2b$10$YourHashedPasswordHere',
    'Admin',
    'Demo',
    true,
    false,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- 4. Crea l'utente superadmin
INSERT INTO "User" (id, email, password, "firstName", "lastName", "isActive", "isSuperAdmin", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid(),
    'superadmin@soccermanager.com',
    -- Password: superadmin123456 (già hashata con bcrypt)
    '$2b$10$YourHashedPasswordHere',
    'Super',
    'Admin',
    true,
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- 5. Crea il ruolo Admin per l'organizzazione
INSERT INTO "Role" (id, "organizationId", name, description, permissions, "isSystem", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid(),
    '43c973a6-5e20-43af-a295-805f1d7c86b1',
    'Admin',
    'Administrator with full permissions',
    '["ORGANIZATION_VIEW", "ORGANIZATION_UPDATE", "USER_VIEW", "USER_CREATE", "USER_UPDATE", "USER_DELETE", "ROLE_VIEW", "ROLE_CREATE", "ROLE_UPDATE", "ROLE_DELETE", "ATHLETE_VIEW", "ATHLETE_CREATE", "ATHLETE_UPDATE", "ATHLETE_DELETE", "TEAM_VIEW", "TEAM_CREATE", "TEAM_UPDATE", "TEAM_DELETE", "MATCH_VIEW", "MATCH_CREATE", "MATCH_UPDATE", "MATCH_DELETE", "DOCUMENT_VIEW", "DOCUMENT_CREATE", "DOCUMENT_UPDATE", "DOCUMENT_DELETE", "PAYMENT_VIEW", "PAYMENT_CREATE", "PAYMENT_UPDATE", "PAYMENT_DELETE", "NOTIFICATION_VIEW", "NOTIFICATION_CREATE", "TRANSPORT_VIEW", "TRANSPORT_CREATE", "TRANSPORT_UPDATE", "TRANSPORT_DELETE", "REPORT_VIEW", "REPORT_CREATE"]',
    true,
    NOW(),
    NOW()
) ON CONFLICT ("organizationId", name) DO NOTHING;

-- 6. Collega gli utenti all'organizzazione con il ruolo Admin
INSERT INTO "UserOrganization" ("userId", "organizationId", "roleId", "isDefault", "joinedAt")
SELECT 
    u.id,
    '43c973a6-5e20-43af-a295-805f1d7c86b1',
    r.id,
    true,
    NOW()
FROM "User" u, "Role" r
WHERE u.email IN ('demo@soccermanager.com', 'admin@demosoccerclub.com')
AND r."organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'
AND r.name = 'Admin'
ON CONFLICT ("userId", "organizationId") DO NOTHING;

-- 7. Crea alcune squadre di esempio
INSERT INTO "Team" (id, "organizationId", name, category, season, "minAge", "maxAge", "isActive", "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', 'Under 15', 'UNDER_15', '2024/2025', 13, 15, true, NOW(), NOW()),
    (gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', 'Under 17', 'UNDER_17', '2024/2025', 15, 17, true, NOW(), NOW()),
    (gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', 'Prima Squadra', 'PRIMA_SQUADRA', '2024/2025', 18, 99, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Mostra il risultato
SELECT 'Utenti creati:' as info;
SELECT email, "firstName", "lastName", "isSuperAdmin" FROM "User";

SELECT 'Organizzazioni create:' as info;
SELECT name, code FROM "Organization";

SELECT 'Squadre create:' as info;
SELECT name, category FROM "Team";
