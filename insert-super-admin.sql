-- Elimina eventuali record esistenti
DELETE FROM "SuperAdmin" WHERE email = 'superadmin@soccermanager.com';

-- Inserisci il Super Admin con hash password per 'superadmin123456'
-- Hash generato con bcrypt (10 rounds)
INSERT INTO "SuperAdmin" (
    id,
    email,
    "passwordHash",
    "firstName",
    "lastName",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid(),
    'superadmin@soccermanager.com',
    '$2a$10$vJ5Y5rKmTt4fH8o0IzYPNeZPpGBKpMpWlLDiMxI7zQJFVIpPcPYdC',
    'Super',
    'Admin',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Verifica
SELECT id, email, "firstName", "lastName", "isActive" FROM "SuperAdmin" WHERE email = 'superadmin@soccermanager.com';
