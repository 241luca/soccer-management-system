-- Rimuovi isDefault per il manager così mostrerà sempre la selezione
UPDATE "UserOrganization" 
SET "isDefault" = false 
WHERE "userId" IN (
    SELECT id FROM "User" WHERE email = 'manager@soccermanager.com'
);

-- Verifica
SELECT 
    u.email,
    o.name as organization,
    uo."isDefault"
FROM "UserOrganization" uo
JOIN "User" u ON u.id = uo."userId"
JOIN "Organization" o ON o.id = uo."organizationId"
WHERE u.email = 'manager@soccermanager.com';
