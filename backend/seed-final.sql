-- Seed data for Soccer Management System - Fixed version
-- Working with actual database schema

-- Show current state
SELECT 'Organizations:' as info, COUNT(*) as count FROM "Organization";
SELECT 'Teams:' as info, COUNT(*) as count FROM "Team";
SELECT 'Athletes:' as info, COUNT(*) as count FROM "Athlete";

-- Create Athletes (without parent fields that don't exist)
INSERT INTO "Athlete" (id, "organizationId", "teamId", "firstName", "lastName", email, phone, "birthDate", 
                       address, city, province, "postalCode", "fiscalCode", status, "usesTransport", notes, "createdAt", "updatedAt")
VALUES 
-- Under 15 Athletes
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', 
 (SELECT id FROM "Team" WHERE name = 'Under 15' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Marco', 'Rossi', 'marco.rossi@email.com', '333-1234567', '2010-03-15', 
 'Via Roma 10', 'Milano', 'MI', '20100', 'RSSMRC10C15F205X', 
 'ACTIVE', true, 'Ottimo potenziale, veloce e tecnico', NOW(), NOW()),
 
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 15' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Luca', 'Bianchi', 'luca.bianchi@email.com', '333-2234567', '2010-05-22',
 'Via Milano 5', 'Milano', 'MI', '20100', 'BNCLCU10E22F205X',
 'ACTIVE', true, 'Portiere promettente', NOW(), NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 15' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Alessandro', 'Verdi', 'ale.verdi@email.com', '333-3234567', '2010-07-10',
 'Via Torino 15', 'Milano', 'MI', '20100', 'VRDLSS10L10F205X',
 'ACTIVE', false, 'Certificato medico in scadenza', NOW(), NOW()),

-- Under 17 Athletes
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 17' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Francesco', 'Neri', 'francesco.neri@email.com', '334-1234567', '2008-04-12',
 'Via Venezia 20', 'Milano', 'MI', '20100', 'NREFNC08D12F205X',
 'ACTIVE', true, 'Capitano squadra', NOW(), NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 17' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Andrea', 'Blu', 'andrea.blu@email.com', '334-2234567', '2008-06-25',
 'Via Firenze 12', 'Milano', 'MI', '20100', 'BLUNDR08H25F205X',
 'ACTIVE', false, 'Attaccante, ottimo senso del gol', NOW(), NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 17' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Davide', 'Viola', 'davide.viola@email.com', '334-4234567', '2008-02-14',
 'Via Genova 18', 'Milano', 'MI', '20100', 'VLIDVD08B14F205X',
 'INJURED', false, 'Infortunato - recupero previsto gennaio', NOW(), NOW()),

-- Under 19 Athletes
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 19' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Stefano', 'Marrone', 'stefano.marrone@email.com', '335-1234567', '2006-05-18',
 'Via Palermo 25', 'Milano', 'MI', '20100', 'MRRSFN06E18F205X',
 'ACTIVE', true, 'Centrocampista centrale', NOW(), NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 19' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Lorenzo', 'Grigio', 'lorenzo.grigio@email.com', '335-2234567', '2006-07-22',
 'Via Bari 14', 'Milano', 'MI', '20100', 'GRGLRN06L22F205X',
 'ACTIVE', false, NULL, NOW(), NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 19' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Filippo', 'Celeste', 'filippo.celeste@email.com', '335-4234567', '2006-11-30',
 'Via Messina 16', 'Milano', 'MI', '20100', 'CLSFPP06S30F205X',
 'SUSPENDED', false, 'Squalificato per 2 giornate', NOW(), NOW()),

-- Prima Squadra Athletes
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Prima Squadra' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Roberto', 'Azzurri', 'roberto.azzurri@email.com', '336-1234567', '1998-03-10',
 'Via Como 30', 'Milano', 'MI', '20100', 'ZZRRRT98C10F205X',
 'ACTIVE', false, 'Attaccante titolare', NOW(), NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Prima Squadra' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Michele', 'Verderame', 'michele.verderame@email.com', '336-2234567', '1999-06-15',
 'Via Brescia 22', 'Milano', 'MI', '20100', 'VRDMHL99H15F205X',
 'ACTIVE', false, 'Centrocampista', NOW(), NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Prima Squadra' AND "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'),
 'Antonio', 'Rossini', 'antonio.rossini@email.com', '336-4234567', '1997-08-25',
 'Via Verona 28', 'Milano', 'MI', '20100', 'RSSNTN97M25F205X',
 'ACTIVE', false, 'Certificato medico in scadenza', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create Payment Types (check schema first)
INSERT INTO "PaymentType" (id, "organizationId", name, amount, "isRecurring", "recurrenceType", "isActive", "createdAt", "updatedAt")
VALUES
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', 'Quota Iscrizione', 250.00, false, NULL, true, NOW(), NOW()),
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', 'Quota Mensile', 80.00, true, 'MONTHLY', true, NOW(), NOW()),
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', 'Kit Abbigliamento', 120.00, false, NULL, true, NOW(), NOW()),
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', 'Trasporto', 50.00, true, 'MONTHLY', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create Document Types
INSERT INTO "DocumentType" (id, "organizationId", name, "isRequired", "validityDays", "reminderDays", "isActive", "createdAt", "updatedAt")
VALUES
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', 'Certificato Medico Sportivo', true, 365, 30, true, NOW(), NOW()),
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', 'Documento Identità', true, NULL, NULL, true, NOW(), NOW()),
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', 'Tessera Sanitaria', true, NULL, NULL, true, NOW(), NOW()),
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', 'Modulo Privacy', true, NULL, NULL, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create sample Payments with proper enum values
INSERT INTO "Payment" (id, "organizationId", "athleteId", "paymentTypeId", amount, "dueDate", "paidDate", status, "paymentMethod", notes, "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    '43c973a6-5e20-43af-a295-805f1d7c86b1',
    a.id,
    pt.id,
    pt.amount,
    '2024-12-01'::date,
    CASE WHEN random() > 0.5 THEN '2024-12-05'::date ELSE NULL END,
    CASE WHEN random() > 0.5 THEN 'PAID'::"PaymentStatus" ELSE 'PENDING'::"PaymentStatus" END,
    CASE WHEN random() > 0.5 THEN 'BANK_TRANSFER'::"PaymentMethod" ELSE 'CASH'::"PaymentMethod" END,
    'Quota mensile dicembre - ' || a."firstName" || ' ' || a."lastName",
    NOW(),
    NOW()
FROM "Athlete" a
CROSS JOIN "PaymentType" pt
WHERE a."organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'
  AND pt."organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'
  AND pt.name = 'Quota Mensile'
LIMIT 10;

-- Create Notifications (check actual schema)
INSERT INTO "Notification" (id, "organizationId", "userId", type, title, message, "isRead", data, "createdAt", "updatedAt")
VALUES
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', '1c7aa52a-fac3-461d-8310-bd08c6f4bf4c', 
 'DOCUMENT_EXPIRING', 'Documenti in Scadenza', '3 certificati medici in scadenza nei prossimi 30 giorni', 
 false, '{"count": 3}'::jsonb, NOW(), NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', '1c7aa52a-fac3-461d-8310-bd08c6f4bf4c',
 'PAYMENT_OVERDUE', 'Pagamenti in Ritardo', '5 pagamenti sono scaduti',
 false, '{"count": 5, "totalAmount": 400}'::jsonb, NOW() - INTERVAL '2 days', NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', '1c7aa52a-fac3-461d-8310-bd08c6f4bf4c',
 'MATCH_REMINDER', 'Prossima Partita', 'Inter U15 - Mercoledì 15 Gennaio ore 15:00',
 false, '{"matchId": "123"}'::jsonb, NOW() - INTERVAL '1 day', NOW())
ON CONFLICT DO NOTHING;

-- Show final summary
SELECT 'Final Summary:' as info;
SELECT 'Athletes' as entity, COUNT(*) as count FROM "Athlete" WHERE "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'
UNION ALL
SELECT 'Teams', COUNT(*) FROM "Team" WHERE "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'
UNION ALL
SELECT 'Payments', COUNT(*) FROM "Payment" WHERE "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'
UNION ALL
SELECT 'Payment Types', COUNT(*) FROM "PaymentType" WHERE "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'
UNION ALL
SELECT 'Document Types', COUNT(*) FROM "DocumentType" WHERE "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1'
UNION ALL
SELECT 'Notifications', COUNT(*) FROM "Notification" WHERE "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1';
