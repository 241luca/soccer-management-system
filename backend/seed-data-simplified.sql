-- Simplified seed data script
-- Let's insert data step by step

-- First check what we have
SELECT 'Current Organization:' as info, id, name, code FROM "Organization" WHERE code = 'DEMO';
SELECT 'Current Teams:' as info, id, name FROM "Team" WHERE "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1';
SELECT 'Current Roles:' as info, id, name FROM "Role" WHERE "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1';

-- Create Athletes for existing teams
INSERT INTO "Athlete" (id, "organizationId", "teamId", "firstName", "lastName", email, phone, "birthDate", address, city, "postalCode", "fiscalCode", "parentName", "parentPhone", "parentEmail", "medicalCertificateDate", "medicalCertificateExpiry", status, "usesTransport", "transportZone", notes, "createdAt", "updatedAt")
VALUES 
-- Under 15 Athletes
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', 
 (SELECT id FROM "Team" WHERE name = 'Under 15' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Marco', 'Rossi', 'marco.rossi@email.com', '333-1234567', '2010-03-15', 'Via Roma 10', 'Milano', '20100', 'RSSMRC10C15F205X', 
 'Giovanni Rossi', '333-7654321', 'giovanni.rossi@email.com', 
 '2024-09-01', '2025-09-01', 'ACTIVE', true, 'NORD', 'Ottimo potenziale, veloce e tecnico', NOW(), NOW()),
 
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 15' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Luca', 'Bianchi', 'luca.bianchi@email.com', '333-2234567', '2010-05-22', 'Via Milano 5', 'Milano', '20100', 'BNCLCU10E22F205X',
 'Paolo Bianchi', '333-8654321', 'paolo.bianchi@email.com',
 '2024-08-15', '2025-08-15', 'ACTIVE', true, 'SUD', 'Portiere promettente', NOW(), NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 15' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Alessandro', 'Verdi', 'ale.verdi@email.com', '333-3234567', '2010-07-10', 'Via Torino 15', 'Milano', '20100', 'VRDLSS10L10F205X',
 'Maria Verdi', '333-9654321', 'maria.verdi@email.com',
 '2024-07-20', '2025-02-20', 'ACTIVE', false, NULL, 'Certificato medico in scadenza', NOW(), NOW()),

-- Under 17 Athletes
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 17' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Francesco', 'Neri', 'francesco.neri@email.com', '334-1234567', '2008-04-12', 'Via Venezia 20', 'Milano', '20100', 'NREFNC08D12F205X',
 'Roberto Neri', '334-7654321', 'roberto.neri@email.com',
 '2024-10-01', '2025-10-01', 'ACTIVE', true, 'OVEST', 'Capitano squadra', NOW(), NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 17' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Andrea', 'Blu', 'andrea.blu@email.com', '334-2234567', '2008-06-25', 'Via Firenze 12', 'Milano', '20100', 'BLUNDR08H25F205X',
 'Carla Blu', '334-8654321', 'carla.blu@email.com',
 '2024-09-15', '2025-09-15', 'ACTIVE', false, NULL, 'Attaccante, ottimo senso del gol', NOW(), NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 17' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Davide', 'Viola', 'davide.viola@email.com', '334-4234567', '2008-02-14', 'Via Genova 18', 'Milano', '20100', 'VLIDVD08B14F205X',
 'Marco Viola', '334-0654321', 'marco.viola@email.com',
 '2024-05-20', '2024-12-20', 'INJURED', false, NULL, 'Infortunato - recupero previsto gennaio', NOW(), NOW()),

-- Under 19 Athletes
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 19' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Stefano', 'Marrone', 'stefano.marrone@email.com', '335-1234567', '2006-05-18', 'Via Palermo 25', 'Milano', '20100', 'MRRSFN06E18F205X',
 'Giuseppe Marrone', '335-7654321', 'giuseppe.marrone@email.com',
 '2024-08-01', '2025-08-01', 'ACTIVE', true, 'SUD', 'Centrocampista centrale', NOW(), NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 19' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Lorenzo', 'Grigio', 'lorenzo.grigio@email.com', '335-2234567', '2006-07-22', 'Via Bari 14', 'Milano', '20100', 'GRGLRN06L22F205X',
 'Anna Grigio', '335-8654321', 'anna.grigio@email.com',
 '2024-07-15', '2025-07-15', 'ACTIVE', false, NULL, NULL, NOW(), NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 19' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Filippo', 'Celeste', 'filippo.celeste@email.com', '335-4234567', '2006-11-30', 'Via Messina 16', 'Milano', '20100', 'CLSFPP06S30F205X',
 'Elena Celeste', '335-0654321', 'elena.celeste@email.com',
 '2024-04-10', '2024-11-10', 'SUSPENDED', false, NULL, 'Squalificato per 2 giornate', NOW(), NOW()),

-- Prima Squadra Athletes
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Prima Squadra' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Roberto', 'Azzurri', 'roberto.azzurri@email.com', '336-1234567', '1998-03-10', 'Via Como 30', 'Milano', '20100', 'ZZRRRT98C10F205X',
 NULL, NULL, NULL,
 '2024-09-01', '2025-09-01', 'ACTIVE', false, NULL, 'Attaccante titolare', NOW(), NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Prima Squadra' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Michele', 'Verderame', 'michele.verderame@email.com', '336-2234567', '1999-06-15', 'Via Brescia 22', 'Milano', '20100', 'VRDMHL99H15F205X',
 NULL, NULL, NULL,
 '2024-08-15', '2025-08-15', 'ACTIVE', false, NULL, 'Centrocampista', NOW(), NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Prima Squadra' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Antonio', 'Rossini', 'antonio.rossini@email.com', '336-4234567', '1997-08-25', 'Via Verona 28', 'Milano', '20100', 'RSSNTN97M25F205X',
 NULL, NULL, NULL,
 '2024-03-15', '2024-12-15', 'ACTIVE', false, NULL, 'Certificato medico in scadenza', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create Payment Types
INSERT INTO "PaymentType" (id, "organizationId", name, description, amount, "isRecurring", "recurrenceType", "isActive", "createdAt", "updatedAt")
VALUES
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', 'Quota Iscrizione', 'Quota annuale di iscrizione', 250.00, false, NULL, true, NOW(), NOW()),
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', 'Quota Mensile', 'Quota mensile allenamenti', 80.00, true, 'MONTHLY', true, NOW(), NOW()),
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', 'Kit Abbigliamento', 'Kit completo divisa gara e allenamento', 120.00, false, NULL, true, NOW(), NOW()),
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', 'Trasporto', 'Quota mensile servizio trasporto', 50.00, true, 'MONTHLY', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create Document Types
INSERT INTO "DocumentType" (id, "organizationId", name, description, "isRequired", "validityDays", "reminderDays", "isActive", "createdAt", "updatedAt")
VALUES
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', 'Certificato Medico Sportivo', 'Certificato medico per attività sportiva agonistica', true, 365, 30, true, NOW(), NOW()),
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', 'Documento Identità', 'Carta identità o passaporto', true, NULL, NULL, true, NOW(), NOW()),
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', 'Tessera Sanitaria', 'Tessera sanitaria o codice fiscale', true, NULL, NULL, true, NOW(), NOW()),
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', 'Modulo Privacy', 'Consenso trattamento dati personali', true, NULL, NULL, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create sample Payments
INSERT INTO "Payment" (id, "organizationId", "athleteId", "paymentTypeId", amount, "dueDate", "paidDate", status, "paymentMethod", notes, "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    '43c973a6-5e20-43af-a295-805f1d7c86b1',
    a.id,
    pt.id,
    pt.amount,
    '2024-12-01'::date,
    CASE WHEN random() > 0.5 THEN '2024-12-05'::date ELSE NULL END,
    CASE WHEN random() > 0.5 THEN 'PAID' ELSE 'PENDING' END,
    CASE WHEN random() > 0.5 THEN 'BANK_TRANSFER' ELSE 'CASH' END,
    'Quota mensile dicembre - ' || a."firstName" || ' ' || a."lastName",
    NOW(),
    NOW()
FROM "Athlete" a
CROSS JOIN "PaymentType" pt
WHERE a."organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'
  AND pt."organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'
  AND pt.name = 'Quota Mensile'
LIMIT 10;

-- Create sample Documents
INSERT INTO "Document" (id, "organizationId", "athleteId", "documentTypeId", "documentNumber", "issueDate", "expiryDate", "uploadedBy", status, notes, "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    '43c973a6-5e20-43af-a295-805f1d7c86b1',
    a.id,
    dt.id,
    'MED-' || SUBSTRING(a.id::text, 1, 8),
    CURRENT_DATE - INTERVAL '3 months',
    CASE 
        WHEN random() > 0.7 THEN CURRENT_DATE + INTERVAL '1 month'  -- Some expiring soon
        ELSE CURRENT_DATE + INTERVAL '9 months'
    END,
    '1c7aa52a-fac3-461d-8310-bd08c6f4bf4c',
    'VALID',
    'Certificato medico sportivo - ' || a."firstName" || ' ' || a."lastName",
    NOW(),
    NOW()
FROM "Athlete" a
CROSS JOIN "DocumentType" dt
WHERE a."organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'
  AND dt."organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'
  AND dt.name LIKE 'Certificato Medico%'
LIMIT 10;

-- Create sample Matches
INSERT INTO "Match" (id, "organizationId", "homeTeamId", "awayTeam", "matchDate", "matchTime", location, "matchType", status, result, notes, "createdAt", "updatedAt")
VALUES
-- Past matches
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 15' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'FC Juventus U15', '2024-11-20', '15:00', 'Campo Sportivo Milano', 'CHAMPIONSHIP', 'COMPLETED', '2-1', 'Vittoria importante', NOW(), NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 17' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'AC Milan U17', '2024-11-22', '17:00', 'Centro Sportivo Vismara', 'CHAMPIONSHIP', 'COMPLETED', '1-1', 'Pareggio combattuto', NOW(), NOW()),

-- Upcoming matches
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 15' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Inter U15', '2025-01-15', '15:00', 'Campo Sportivo Milano', 'CHAMPIONSHIP', 'SCHEDULED', NULL, 'Derby cittadino', NOW(), NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 17' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Atalanta U17', '2025-01-17', '16:00', 'Campo Sportivo Milano', 'CHAMPIONSHIP', 'SCHEDULED', NULL, NULL, NOW(), NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 19' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Roma U19', '2025-01-20', '18:00', 'Stadio Comunale', 'CHAMPIONSHIP', 'SCHEDULED', NULL, 'Partita importante per la classifica', NOW(), NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Prima Squadra' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Napoli', '2025-01-22', '20:00', 'Stadio San Siro', 'CUP', 'SCHEDULED', NULL, 'Ottavi di finale Coppa Italia', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create Notifications
INSERT INTO "Notification" (id, "organizationId", "userId", type, title, message, priority, "isRead", data, "createdAt", "updatedAt")
VALUES
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', '1c7aa52a-fac3-461d-8310-bd08c6f4bf4c', 
 'DOCUMENT_EXPIRING', 'Documenti in Scadenza', '3 certificati medici in scadenza nei prossimi 30 giorni', 
 'HIGH', false, '{"count": 3}'::jsonb, NOW(), NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', '1c7aa52a-fac3-461d-8310-bd08c6f4bf4c',
 'PAYMENT_OVERDUE', 'Pagamenti in Ritardo', '5 pagamenti sono scaduti',
 'HIGH', false, '{"count": 5, "totalAmount": 400}'::jsonb, NOW() - INTERVAL '2 days', NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', '1c7aa52a-fac3-461d-8310-bd08c6f4bf4c',
 'MATCH_REMINDER', 'Prossima Partita', 'Inter U15 - Mercoledì 15 Gennaio ore 15:00',
 'MEDIUM', false, '{"matchId": "123"}'::jsonb, NOW() - INTERVAL '1 day', NOW())
ON CONFLICT DO NOTHING;

-- Show summary
SELECT 'Athletes' as entity, COUNT(*) as count FROM "Athlete" WHERE "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'
UNION ALL
SELECT 'Teams', COUNT(*) FROM "Team" WHERE "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'
UNION ALL
SELECT 'Documents', COUNT(*) FROM "Document" WHERE "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'
UNION ALL
SELECT 'Payments', COUNT(*) FROM "Payment" WHERE "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'
UNION ALL
SELECT 'Matches', COUNT(*) FROM "Match" WHERE "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'
UNION ALL
SELECT 'Notifications', COUNT(*) FROM "Notification" WHERE "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'
UNION ALL
SELECT 'Payment Types', COUNT(*) FROM "PaymentType" WHERE "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'
UNION ALL
SELECT 'Document Types', COUNT(*) FROM "DocumentType" WHERE "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1';
