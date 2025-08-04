-- Verifica setup società di produzione
SELECT 
    o.name as "Organizzazione",
    o.code as "Codice",
    o.plan as "Piano",
    COUNT(DISTINCT t.id) as "Squadre",
    COUNT(DISTINCT uo."userId") as "Utenti"
FROM "Organization" o
LEFT JOIN "Team" t ON t."organizationId" = o.id
LEFT JOIN "UserOrganization" uo ON uo."organizationId" = o.id
WHERE o.code IN ('DEMO', 'RAVENNA')
GROUP BY o.id, o.name, o.code, o.plan;

-- Mostra utenti con accesso multiplo
SELECT 
    u.email,
    u."firstName" || ' ' || u."lastName" as "Nome",
    STRING_AGG(o.name, ', ') as "Accesso a società"
FROM "User" u
JOIN "UserOrganization" uo ON uo."userId" = u.id
JOIN "Organization" o ON o.id = uo."organizationId"
GROUP BY u.id, u.email, u."firstName", u."lastName"
HAVING COUNT(DISTINCT o.id) > 1;

-- Mostra tutti gli utenti di produzione
SELECT 
    u.email,
    u."firstName" || ' ' || u."lastName" as "Nome",
    o.name as "Società",
    r.name as "Ruolo"
FROM "User" u
JOIN "UserOrganization" uo ON uo."userId" = u.id
JOIN "Organization" o ON o.id = uo."organizationId"
LEFT JOIN "Role" r ON r.id = uo."roleId"
WHERE o.code = 'RAVENNA';
