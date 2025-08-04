-- Debug: verifica esatta del problema
SELECT 
    u.id,
    u.email,
    u."isActive" as user_active,
    COUNT(uo.id) as num_user_orgs,
    ARRAY_AGG(uo.id) as userorg_ids
FROM "User" u
LEFT JOIN "UserOrganization" uo ON uo."userId" = u.id
WHERE u.email IN ('admin@asdravennacalcio.it', 'manager@soccermanager.com')
GROUP BY u.id, u.email, u."isActive";

-- Verifica se ci sono record in UserOrganization
SELECT COUNT(*) as total_user_orgs FROM "UserOrganization";

-- Mostra tutti i UserOrganization
SELECT 
    uo.id,
    u.email,
    o.code as org_code,
    uo."isActive",
    uo."createdAt"
FROM "UserOrganization" uo
JOIN "User" u ON u.id = uo."userId"
JOIN "Organization" o ON o.id = uo."organizationId"
ORDER BY uo."createdAt" DESC
LIMIT 10;
