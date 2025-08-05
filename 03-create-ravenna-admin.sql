-- 3. CREAZIONE UTENTE ADMIN PER ASD RAVENNA

-- Prima creiamo il ruolo Admin per Ravenna se non esiste
INSERT INTO "Role" (id, "organizationId", name, description, permissions, "isSystem", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Admin',
    'Amministratore con accesso completo',
    '["*"]'::jsonb,
    true,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Creiamo l'utente admin
INSERT INTO "User" (
    id,
    email,
    "passwordHash",
    "firstName", 
    "lastName",
    role,
    "organizationId",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid(),
    'admin@asdravennacalcio.it',
    '$2a$10$K5KxJL5C8eZ3Hqz6yYBxVOl2rUqGPKm8e5A.DxZRMBQBVhRtV5oNa', -- password: ravenna2024!
    'Admin',
    'Ravenna',
    'ADMIN',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    true,
    NOW(),
    NOW()
);

-- Colleghiamo l'utente all'organizzazione
INSERT INTO "UserOrganization" (id, "userId", "organizationId", "roleId", "isDefault", "joinedAt")
SELECT 
    gen_random_uuid(),
    u.id,
    u."organizationId",
    r.id,
    true,
    NOW()
FROM "User" u
JOIN "Role" r ON r."organizationId" = u."organizationId" AND r.name = 'Admin'
WHERE u.email = 'admin@asdravennacalcio.it';

-- Verifica
SELECT 
    o.name as organizzazione,
    u.email,
    u.role,
    u."isActive"
FROM "User" u
JOIN "Organization" o ON u."organizationId" = o.id
ORDER BY o.name, u.email;
