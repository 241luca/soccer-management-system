-- Verifica lo stato attuale del database
SELECT 
    u.id,
    u.email,
    u."firstName",
    u."organizationId" as "old_organizationId",
    COUNT(uo.id) as "userOrg_count"
FROM "User" u
LEFT JOIN "UserOrganization" uo ON uo."userId" = u.id
WHERE u.email IN (
    'demo@soccermanager.com',
    'admin@asdravennacalcio.it', 
    'manager@soccermanager.com'
)
GROUP BY u.id;

-- Mostra le organizzazioni esistenti
SELECT id, name, code FROM "Organization";

-- Mostra i ruoli esistenti per organizzazione
SELECT 
    o.code as org_code,
    r.code as role_code,
    r.name as role_name,
    r.id as role_id
FROM "Role" r
JOIN "Organization" o ON o.id = r."organizationId"
ORDER BY o.code, r.code;

-- Mostra le relazioni UserOrganization esistenti
SELECT 
    u.email,
    o.code as org_code,
    r.code as role_code,
    uo."isActive",
    uo."isDefault"
FROM "UserOrganization" uo
JOIN "User" u ON u.id = uo."userId"
JOIN "Organization" o ON o.id = uo."organizationId"
LEFT JOIN "Role" r ON r.id = uo."roleId"
ORDER BY u.email, o.code;
