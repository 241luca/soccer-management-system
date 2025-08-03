-- Simple working seed script - just athletes for now

-- Insert multiple athletes
INSERT INTO "Athlete" (id, "organizationId", "teamId", "firstName", "lastName", email, phone, "birthDate", 
                       address, city, province, "postalCode", "fiscalCode", status, "usesTransport", notes, "createdAt", "updatedAt")
VALUES 
-- Under 15
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1', 
 (SELECT id FROM "Team" WHERE name = 'Under 15' LIMIT 1),
 'Luca', 'Bianchi', 'luca.bianchi@email.com', '333-2234567', '2010-05-22',
 'Via Milano 5', 'Milano', 'MI', '20100', 'BNCLCU10E22F205Y',
 'ACTIVE', true, 'Portiere', NOW(), NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 15' LIMIT 1),
 'Alessandro', 'Verdi', 'ale.verdi@email.com', '333-3234567', '2010-07-10',
 'Via Torino 15', 'Milano', 'MI', '20100', 'VRDLSS10L10F205Y',
 'ACTIVE', false, 'Difensore', NOW(), NOW()),

-- Under 17
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 17' LIMIT 1),
 'Francesco', 'Neri', 'francesco.neri@email.com', '334-1234567', '2008-04-12',
 'Via Venezia 20', 'Milano', 'MI', '20100', 'NREFNC08D12F205Y',
 'ACTIVE', true, 'Capitano', NOW(), NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 17' LIMIT 1),
 'Andrea', 'Blu', 'andrea.blu@email.com', '334-2234567', '2008-06-25',
 'Via Firenze 12', 'Milano', 'MI', '20100', 'BLUNDR08H25F205Y',
 'ACTIVE', false, 'Attaccante', NOW(), NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 17' LIMIT 1),
 'Davide', 'Viola', 'davide.viola@email.com', '334-4234567', '2008-02-14',
 'Via Genova 18', 'Milano', 'MI', '20100', 'VLIDVD08B14F205Y',
 'INACTIVE', false, 'Infortunato', NOW(), NOW()),

-- Under 19
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 19' LIMIT 1),
 'Stefano', 'Marrone', 'stefano.marrone@email.com', '335-1234567', '2006-05-18',
 'Via Palermo 25', 'Milano', 'MI', '20100', 'MRRSFN06E18F205Y',
 'ACTIVE', true, 'Centrocampista', NOW(), NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Under 19' LIMIT 1),
 'Lorenzo', 'Grigio', 'lorenzo.grigio@email.com', '335-2234567', '2006-07-22',
 'Via Bari 14', 'Milano', 'MI', '20100', 'GRGLRN06L22F205Y',
 'ACTIVE', false, NULL, NOW(), NOW()),

-- Prima Squadra
(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Prima Squadra' LIMIT 1),
 'Roberto', 'Azzurri', 'roberto.azzurri@email.com', '336-1234567', '1998-03-10',
 'Via Como 30', 'Milano', 'MI', '20100', 'ZZRRRT98C10F205Y',
 'ACTIVE', false, 'Attaccante', NOW(), NOW()),

(gen_random_uuid(), '43c973a6-5e20-43af-a295-805f1d7c86b1',
 (SELECT id FROM "Team" WHERE name = 'Prima Squadra' LIMIT 1),
 'Michele', 'Verderame', 'michele.verderame@email.com', '336-2234567', '1999-06-15',
 'Via Brescia 22', 'Milano', 'MI', '20100', 'VRDMHL99H15F205Y',
 'ACTIVE', false, 'Centrocampista', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Count results
SELECT 'Athletes created:' as info, COUNT(*) as count FROM "Athlete" WHERE "organizationId" = '43c973a6-5e20-43af-a295-805f1d7c86b1';
