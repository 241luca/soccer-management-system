-- Script SQL per creare il Super Admin
-- Password: superadmin123456

-- Crea il Super Admin nella tabella SuperAdmin
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
    '9f4f4f37-d6f1-428b-b50e-875de7601eb6',
    'superadmin@soccermanager.com',
    '$2a$10$zHqiJ0eJ7QLrHGQzUP5Lz.hJQJ5KqA.yrTDqJH3lrq8lH6R7Cq.UqQBXzCp5Ky',
    'Super',
    'Admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    "passwordHash" = EXCLUDED."passwordHash",
    "firstName" = EXCLUDED."firstName",
    "lastName" = EXCLUDED."lastName",
    "isActive" = EXCLUDED."isActive",
    "updatedAt" = NOW();

-- Verifica
SELECT id, email, "firstName", "lastName" FROM "SuperAdmin" WHERE email = 'superadmin@soccermanager.com';
