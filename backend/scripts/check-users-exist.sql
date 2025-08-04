-- Verifica se gli utenti esistono
SELECT 
    email, 
    "firstName", 
    "lastName", 
    "isActive",
    CASE WHEN "passwordHash" IS NOT NULL THEN 'SI' ELSE 'NO' END as has_password
FROM "User" 
WHERE email IN (
    'demo@soccermanager.com',
    'admin@asdravennacalcio.it',
    'manager@soccermanager.com'
);
