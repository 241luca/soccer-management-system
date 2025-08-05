-- 1. CREAZIONE SQUADRE PER ASD RAVENNA CALCIO (CORRETTA)
INSERT INTO "Team" (id, "organizationId", name, category, season, "minAge", "maxAge", budget, "isActive", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Pulcini 2015', 'Pulcini', '2024-2025', 9, 10, 12000.00, true, NOW(), NOW()),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Esordienti 2013', 'Esordienti', '2024-2025', 11, 12, 14000.00, true, NOW(), NOW()),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Giovanissimi U15', 'Giovanissimi', '2024-2025', 13, 14, 16000.00, true, NOW(), NOW()),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Allievi U17', 'Allievi', '2024-2025', 15, 16, 20000.00, true, NOW(), NOW()),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Juniores U19', 'Juniores', '2024-2025', 17, 19, 25000.00, true, NOW(), NOW());

-- Verifica inserimento
SELECT o.name as org, t.name as squadra, t.id 
FROM "Team" t 
JOIN "Organization" o ON t."organizationId" = o.id 
WHERE o.id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
ORDER BY t.name;
