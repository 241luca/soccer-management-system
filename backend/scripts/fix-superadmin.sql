-- Fix SuperAdmin authentication
-- Inserisce il superadmin nella tabella SuperAdmin

-- Crea il superadmin se non esiste
INSERT INTO "SuperAdmin" (
    id, 
    email, 
    "passwordHash", 
    "firstName", 
    "lastName", 
    "isActive", 
    "createdAt", 
    "updatedAt"
)
SELECT 
    gen_random_uuid(),
    'superadmin@soccermanager.com',
    '$2a$10$KZR2tVDa8r5FXrJ1TKDMaOWJVQBhM.0hKpZt9cYVxH5xF7j3GXkHG', -- hash per superadmin123456
    'Super',
    'Admin',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM "SuperAdmin" WHERE email = 'superadmin@soccermanager.com'
);

-- Se esiste, aggiorna la password
UPDATE "SuperAdmin"
SET 
    "passwordHash" = '$2a$10$KZR2tVDa8r5FXrJ1TKDMaOWJVQBhM.0hKpZt9cYVxH5xF7j3GXkHG',
    "isActive" = true,
    "updatedAt" = NOW()
WHERE email = 'superadmin@soccermanager.com';

-- Mostra il risultato
SELECT id, email, "firstName", "lastName", "isActive" 
FROM "SuperAdmin" 
WHERE email = 'superadmin@soccermanager.com';
