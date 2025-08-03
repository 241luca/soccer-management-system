-- Seed data for Soccer Management System
-- This script populates the database with test data

-- First, let's check what organization and roles we have
DO $$
DECLARE
    org_id UUID;
    admin_role_id UUID;
    coach_role_id UUID;
    staff_role_id UUID;
    team_u15_id UUID;
    team_u17_id UUID;
    team_u19_id UUID;
    team_prima_id UUID;
BEGIN
    -- Get organization
    SELECT id INTO org_id FROM "Organization" WHERE code = 'DEMO';
    
    IF org_id IS NULL THEN
        RAISE EXCEPTION 'Organization DEMO not found';
    END IF;
    
    -- Get or create roles
    SELECT id INTO admin_role_id FROM "Role" WHERE "organizationId" = org_id::UUID AND name = 'Admin';
    SELECT id INTO coach_role_id FROM "Role" WHERE "organizationId" = org_id::UUID AND name = 'Coach';
    SELECT id INTO staff_role_id FROM "Role" WHERE "organizationId" = org_id::UUID AND name = 'Staff';
    
    -- Create Coach role if not exists
    IF coach_role_id IS NULL THEN
        INSERT INTO "Role" (id, "organizationId", name, description, permissions, "isSystem", "createdAt", "updatedAt")
        VALUES (
            gen_random_uuid(),
            org_id,
            'Coach',
            'Team coach with management permissions',
            '["ATHLETE_VIEW", "ATHLETE_CREATE", "ATHLETE_UPDATE", "TEAM_VIEW", "TEAM_UPDATE", "MATCH_VIEW", "MATCH_CREATE", "MATCH_UPDATE"]'::jsonb,
            true,
            NOW(),
            NOW()
        ) RETURNING id INTO coach_role_id;
    END IF;
    
    -- Create Staff role if not exists
    IF staff_role_id IS NULL THEN
        INSERT INTO "Role" (id, "organizationId", name, description, permissions, "isSystem", "createdAt", "updatedAt")
        VALUES (
            gen_random_uuid(),
            org_id,
            'Staff',
            'Staff member with view permissions',
            '["ATHLETE_VIEW", "TEAM_VIEW", "MATCH_VIEW", "DOCUMENT_VIEW"]'::jsonb,
            true,
            NOW(),
            NOW()
        ) RETURNING id INTO staff_role_id;
    END IF;
    
    -- Get existing teams
    SELECT id INTO team_u15_id FROM "Team" WHERE "organizationId" = org_id::UUID AND name = 'Under 15';
    SELECT id INTO team_u17_id FROM "Team" WHERE "organizationId" = org_id::UUID AND name = 'Under 17';
    SELECT id INTO team_u19_id FROM "Team" WHERE "organizationId" = org_id::UUID AND name = 'Under 19';
    SELECT id INTO team_prima_id FROM "Team" WHERE "organizationId" = org_id::UUID AND name = 'Prima Squadra';
    
    -- Create Athletes
    INSERT INTO "Athlete" (id, "organizationId", "teamId", "firstName", "lastName", email, phone, "birthDate", address, city, "postalCode", "fiscalCode", "parentName", "parentPhone", "parentEmail", "medicalCertificateDate", "medicalCertificateExpiry", "sportsCertificateDate", "sportsCertificateExpiry", status, "usesTransport", "transportZone", notes, "createdAt", "updatedAt")
    VALUES 
    -- Under 15 Athletes
    (gen_random_uuid(), org_id, team_u15_id, 'Marco', 'Rossi', 'marco.rossi@email.com', '333-1234567', '2010-03-15', 'Via Roma 10', 'Milano', '20100', 'RSSMRC10C15F205X', 'Giovanni Rossi', '333-7654321', 'giovanni.rossi@email.com', '2024-09-01', '2025-09-01', '2024-09-01', '2025-09-01', 'ACTIVE', true, 'NORD', 'Ottimo potenziale, veloce e tecnico', NOW(), NOW()),
    (gen_random_uuid(), org_id, team_u15_id, 'Luca', 'Bianchi', 'luca.bianchi@email.com', '333-2234567', '2010-05-22', 'Via Milano 5', 'Milano', '20100', 'BNCLCU10E22F205X', 'Paolo Bianchi', '333-8654321', 'paolo.bianchi@email.com', '2024-08-15', '2025-08-15', '2024-08-15', '2025-08-15', 'ACTIVE', true, 'SUD', 'Portiere promettente', NOW(), NOW()),
    (gen_random_uuid(), org_id, team_u15_id, 'Alessandro', 'Verdi', 'ale.verdi@email.com', '333-3234567', '2010-07-10', 'Via Torino 15', 'Milano', '20100', 'VRDLSS10L10F205X', 'Maria Verdi', '333-9654321', 'maria.verdi@email.com', '2024-07-20', '2025-02-20', '2024-07-20', '2025-02-20', 'ACTIVE', false, NULL, 'Certificato medico in scadenza', NOW(), NOW()),
    (gen_random_uuid(), org_id, team_u15_id, 'Matteo', 'Gialli', 'matteo.gialli@email.com', '333-4234567', '2010-09-18', 'Via Napoli 8', 'Milano', '20100', 'GLLMTT10P18F205X', 'Franco Gialli', '333-0654321', 'franco.gialli@email.com', '2024-06-10', '2025-01-10', '2024-06-10', '2025-01-10', 'ACTIVE', true, 'EST', 'Certificato in scadenza a gennaio', NOW(), NOW()),
    
    -- Under 17 Athletes
    (gen_random_uuid(), org_id, team_u17_id, 'Francesco', 'Neri', 'francesco.neri@email.com', '334-1234567', '2008-04-12', 'Via Venezia 20', 'Milano', '20100', 'NREFNC08D12F205X', 'Roberto Neri', '334-7654321', 'roberto.neri@email.com', '2024-10-01', '2025-10-01', '2024-10-01', '2025-10-01', 'ACTIVE', true, 'OVEST', 'Capitano squadra', NOW(), NOW()),
    (gen_random_uuid(), org_id, team_u17_id, 'Andrea', 'Blu', 'andrea.blu@email.com', '334-2234567', '2008-06-25', 'Via Firenze 12', 'Milano', '20100', 'BLUNDR08H25F205X', 'Carla Blu', '334-8654321', 'carla.blu@email.com', '2024-09-15', '2025-09-15', '2024-09-15', '2025-09-15', 'ACTIVE', false, NULL, 'Attaccante, ottimo senso del gol', NOW(), NOW()),
    (gen_random_uuid(), org_id, team_u17_id, 'Giorgio', 'Rosa', 'giorgio.rosa@email.com', '334-3234567', '2008-08-30', 'Via Bologna 7', 'Milano', '20100', 'RSOGRG08M30F205X', 'Laura Rosa', '334-9654321', 'laura.rosa@email.com', '2024-11-01', '2025-11-01', '2024-11-01', '2025-11-01', 'ACTIVE', true, 'NORD', NULL, NOW(), NOW()),
    (gen_random_uuid(), org_id, team_u17_id, 'Davide', 'Viola', 'davide.viola@email.com', '334-4234567', '2008-02-14', 'Via Genova 18', 'Milano', '20100', 'VLIDVD08B14F205X', 'Marco Viola', '334-0654321', 'marco.viola@email.com', '2024-05-20', '2024-12-20', '2024-05-20', '2024-12-20', 'INJURED', false, NULL, 'Infortunato - recupero previsto gennaio', NOW(), NOW()),
    
    -- Under 19 Athletes
    (gen_random_uuid(), org_id, team_u19_id, 'Stefano', 'Marrone', 'stefano.marrone@email.com', '335-1234567', '2006-05-18', 'Via Palermo 25', 'Milano', '20100', 'MRRSFN06E18F205X', 'Giuseppe Marrone', '335-7654321', 'giuseppe.marrone@email.com', '2024-08-01', '2025-08-01', '2024-08-01', '2025-08-01', 'ACTIVE', true, 'SUD', 'Centrocampista centrale', NOW(), NOW()),
    (gen_random_uuid(), org_id, team_u19_id, 'Lorenzo', 'Grigio', 'lorenzo.grigio@email.com', '335-2234567', '2006-07-22', 'Via Bari 14', 'Milano', '20100', 'GRGLRN06L22F205X', 'Anna Grigio', '335-8654321', 'anna.grigio@email.com', '2024-07-15', '2025-07-15', '2024-07-15', '2025-07-15', 'ACTIVE', false, NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), org_id, team_u19_id, 'Riccardo', 'Arancio', 'riccardo.arancio@email.com', '335-3234567', '2006-09-08', 'Via Catania 9', 'Milano', '20100', 'RNCRCR06P08F205X', 'Paolo Arancio', '335-9654321', 'paolo.arancio@email.com', '2024-06-01', '2025-06-01', '2024-06-01', '2025-06-01', 'ACTIVE', true, 'EST', 'Difensore centrale', NOW(), NOW()),
    (gen_random_uuid(), org_id, team_u19_id, 'Filippo', 'Celeste', 'filippo.celeste@email.com', '335-4234567', '2006-11-30', 'Via Messina 16', 'Milano', '20100', 'CLSFPP06S30F205X', 'Elena Celeste', '335-0654321', 'elena.celeste@email.com', '2024-04-10', '2024-11-10', '2024-04-10', '2024-11-10', 'SUSPENDED', false, NULL, 'Squalificato per 2 giornate', NOW(), NOW()),
    
    -- Prima Squadra Athletes
    (gen_random_uuid(), org_id, team_prima_id, 'Roberto', 'Azzurri', 'roberto.azzurri@email.com', '336-1234567', '1998-03-10', 'Via Como 30', 'Milano', '20100', 'ZZRRRT98C10F205X', NULL, NULL, NULL, '2024-09-01', '2025-09-01', '2024-09-01', '2025-09-01', 'ACTIVE', false, NULL, 'Attaccante titolare', NOW(), NOW()),
    (gen_random_uuid(), org_id, team_prima_id, 'Michele', 'Verderame', 'michele.verderame@email.com', '336-2234567', '1999-06-15', 'Via Brescia 22', 'Milano', '20100', 'VRDMHL99H15F205X', NULL, NULL, NULL, '2024-08-15', '2025-08-15', '2024-08-15', '2025-08-15', 'ACTIVE', false, NULL, 'Centrocampista', NOW(), NOW()),
    (gen_random_uuid(), org_id, team_prima_id, 'Giovanni', 'Bianconi', 'giovanni.bianconi@email.com', '336-3234567', '2000-12-20', 'Via Bergamo 11', 'Milano', '20100', 'BNCGNN00T20F205X', NULL, NULL, NULL, '2024-07-01', '2025-07-01', '2024-07-01', '2025-07-01', 'ACTIVE', false, NULL, 'Portiere di riserva', NOW(), NOW()),
    (gen_random_uuid(), org_id, team_prima_id, 'Antonio', 'Rossini', 'antonio.rossini@email.com', '336-4234567', '1997-08-25', 'Via Verona 28', 'Milano', '20100', 'RSSNTN97M25F205X', NULL, NULL, NULL, '2024-03-15', '2024-12-15', '2024-03-15', '2024-12-15', 'ACTIVE', false, NULL, 'Certificato medico in scadenza', NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Athletes created successfully';
    
    -- Create some Payment Types if not exist
    INSERT INTO "PaymentType" (id, "organizationId", name, description, amount, "isRecurring", "recurrenceType", "isActive", "createdAt", "updatedAt")
    VALUES
    (gen_random_uuid(), org_id, 'Quota Iscrizione', 'Quota annuale di iscrizione', 250.00, false, NULL, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, 'Quota Mensile', 'Quota mensile allenamenti', 80.00, true, 'MONTHLY', true, NOW(), NOW()),
    (gen_random_uuid(), org_id, 'Kit Abbigliamento', 'Kit completo divisa gara e allenamento', 120.00, false, NULL, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, 'Trasporto', 'Quota mensile servizio trasporto', 50.00, true, 'MONTHLY', true, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Payment types created successfully';
    
    -- Create some Document Types if not exist
    INSERT INTO "DocumentType" (id, "organizationId", name, description, "isRequired", "validityDays", "reminderDays", "isActive", "createdAt", "updatedAt")
    VALUES
    (gen_random_uuid(), org_id, 'Certificato Medico Sportivo', 'Certificato medico per attività sportiva agonistica', true, 365, 30, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, 'Documento Identità', 'Carta identità o passaporto', true, NULL, NULL, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, 'Tessera Sanitaria', 'Tessera sanitaria o codice fiscale', true, NULL, NULL, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, 'Modulo Privacy', 'Consenso trattamento dati personali', true, NULL, NULL, true, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Document types created successfully';
    
    -- Create sample Payments for some athletes
    DECLARE
        athlete_cursor CURSOR FOR 
            SELECT id, "firstName", "lastName" FROM "Athlete" 
            WHERE "organizationId" = org_id 
            LIMIT 10;
        athlete_record RECORD;
        payment_type_cursor CURSOR FOR 
            SELECT id, amount FROM "PaymentType" 
            WHERE "organizationId" = org_id;
        payment_type_record RECORD;
    BEGIN
        FOR athlete_record IN athlete_cursor LOOP
            -- Create registration payment (paid)
            INSERT INTO "Payment" (id, "organizationId", "athleteId", "paymentTypeId", amount, "dueDate", "paidDate", status, "paymentMethod", notes, "createdAt", "updatedAt")
            SELECT 
                gen_random_uuid(),
                org_id,
                athlete_record.id,
                id,
                amount,
                '2024-09-01'::date,
                '2024-09-05'::date,
                'PAID',
                'BANK_TRANSFER',
                'Quota iscrizione ' || athlete_record."firstName" || ' ' || athlete_record."lastName",
                NOW(),
                NOW()
            FROM "PaymentType" 
            WHERE "organizationId" = org_id AND name = 'Quota Iscrizione'
            LIMIT 1;
            
            -- Create some monthly payments
            INSERT INTO "Payment" (id, "organizationId", "athleteId", "paymentTypeId", amount, "dueDate", "paidDate", status, "paymentMethod", notes, "createdAt", "updatedAt")
            SELECT 
                gen_random_uuid(),
                org_id,
                athlete_record.id,
                id,
                amount,
                '2024-12-01'::date,
                CASE 
                    WHEN random() > 0.3 THEN '2024-12-05'::date
                    ELSE NULL
                END,
                CASE 
                    WHEN random() > 0.3 THEN 'PAID'
                    ELSE 'PENDING'
                END,
                CASE 
                    WHEN random() > 0.5 THEN 'BANK_TRANSFER'
                    ELSE 'CASH'
                END,
                'Quota mensile dicembre',
                NOW(),
                NOW()
            FROM "PaymentType" 
            WHERE "organizationId" = org_id AND name = 'Quota Mensile'
            LIMIT 1;
        END LOOP;
    END;
    
    RAISE NOTICE 'Payments created successfully';
    
    -- Create sample Documents for athletes
    DECLARE
        athlete_cursor CURSOR FOR 
            SELECT id, "firstName", "lastName" FROM "Athlete" 
            WHERE "organizationId" = org_id 
            LIMIT 10;
        athlete_record RECORD;
    BEGIN
        FOR athlete_record IN athlete_cursor LOOP
            -- Medical certificate
            INSERT INTO "Document" (id, "organizationId", "athleteId", "documentTypeId", "documentNumber", "issueDate", "expiryDate", "uploadedBy", status, notes, "createdAt", "updatedAt")
            SELECT 
                gen_random_uuid(),
                org_id,
                athlete_record.id,
                id,
                'MED-' || SUBSTRING(athlete_record.id::text, 1, 8),
                CURRENT_DATE - INTERVAL '3 months',
                CURRENT_DATE + INTERVAL '9 months',
                '1c7aa52a-fac3-461d-8310-bd08c6f4bf4c', -- admin user ID
                'VALID',
                'Certificato medico sportivo agonistico',
                NOW(),
                NOW()
            FROM "DocumentType" 
            WHERE "organizationId" = org_id AND name LIKE 'Certificato Medico%'
            LIMIT 1;
            
            -- Identity document
            INSERT INTO "Document" (id, "organizationId", "athleteId", "documentTypeId", "documentNumber", "issueDate", "expiryDate", "uploadedBy", status, notes, "createdAt", "updatedAt")
            SELECT 
                gen_random_uuid(),
                org_id,
                athlete_record.id,
                id,
                'CI-' || SUBSTRING(athlete_record.id::text, 1, 8),
                CURRENT_DATE - INTERVAL '2 years',
                CURRENT_DATE + INTERVAL '8 years',
                '1c7aa52a-fac3-461d-8310-bd08c6f4bf4c',
                'VALID',
                'Carta identità',
                NOW(),
                NOW()
            FROM "DocumentType" 
            WHERE "organizationId" = org_id AND name = 'Documento Identità'
            LIMIT 1;
        END LOOP;
    END;
    
    RAISE NOTICE 'Documents created successfully';
    
    -- Create sample Matches
    INSERT INTO "Match" (id, "organizationId", "homeTeamId", "awayTeam", "matchDate", "matchTime", location, "matchType", status, result, notes, "createdAt", "updatedAt")
    VALUES
    -- Past matches
    (gen_random_uuid(), org_id, team_u15_id, 'FC Juventus U15', '2024-11-20', '15:00', 'Campo Sportivo Milano', 'CHAMPIONSHIP', 'COMPLETED', '2-1', 'Vittoria importante', NOW(), NOW()),
    (gen_random_uuid(), org_id, team_u17_id, 'AC Milan U17', '2024-11-22', '17:00', 'Centro Sportivo Vismara', 'CHAMPIONSHIP', 'COMPLETED', '1-1', 'Pareggio combattuto', NOW(), NOW()),
    
    -- Upcoming matches
    (gen_random_uuid(), org_id, team_u15_id, 'Inter U15', '2025-01-15', '15:00', 'Campo Sportivo Milano', 'CHAMPIONSHIP', 'SCHEDULED', NULL, 'Derby cittadino', NOW(), NOW()),
    (gen_random_uuid(), org_id, team_u17_id, 'Atalanta U17', '2025-01-17', '16:00', 'Campo Sportivo Milano', 'CHAMPIONSHIP', 'SCHEDULED', NULL, NULL, NOW(), NOW()),
    (gen_random_uuid(), org_id, team_u19_id, 'Roma U19', '2025-01-20', '18:00', 'Stadio Comunale', 'CHAMPIONSHIP', 'SCHEDULED', NULL, 'Partita importante per la classifica', NOW(), NOW()),
    (gen_random_uuid(), org_id, team_prima_id, 'Napoli', '2025-01-22', '20:00', 'Stadio San Siro', 'CUP', 'SCHEDULED', NULL, 'Ottavi di finale Coppa Italia', NOW(), NOW()),
    
    -- Friendly matches
    (gen_random_uuid(), org_id, team_u15_id, 'Torino U15', '2025-01-25', '14:00', 'Campo Sportivo Milano', 'FRIENDLY', 'SCHEDULED', NULL, 'Amichevole di preparazione', NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Matches created successfully';
    
    -- Create Notifications
    INSERT INTO "Notification" (id, "organizationId", "userId", type, title, message, priority, "isRead", data, "createdAt", "updatedAt")
    VALUES
    (gen_random_uuid(), org_id, '1c7aa52a-fac3-461d-8310-bd08c6f4bf4c', 'DOCUMENT_EXPIRING', 'Documenti in Scadenza', '3 certificati medici in scadenza nei prossimi 30 giorni', 'HIGH', false, '{"count": 3}'::jsonb, NOW(), NOW()),
    (gen_random_uuid(), org_id, '1c7aa52a-fac3-461d-8310-bd08c6f4bf4c', 'PAYMENT_OVERDUE', 'Pagamenti in Ritardo', '5 pagamenti sono scaduti', 'HIGH', false, '{"count": 5, "totalAmount": 400}'::jsonb, NOW() - INTERVAL '2 days', NOW()),
    (gen_random_uuid(), org_id, '1c7aa52a-fac3-461d-8310-bd08c6f4bf4c', 'MATCH_REMINDER', 'Prossima Partita', 'Inter U15 - Mercoledì 15 Gennaio ore 15:00', 'MEDIUM', false, '{"matchId": "123"}'::jsonb, NOW() - INTERVAL '1 day', NOW()),
    (gen_random_uuid(), org_id, '1c7aa52a-fac3-461d-8310-bd08c6f4bf4c', 'SYSTEM', 'Benvenuto!', 'Benvenuto nel sistema di gestione Soccer Manager', 'LOW', true, '{}'::jsonb, NOW() - INTERVAL '7 days', NOW())
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Notifications created successfully';
    
    RAISE NOTICE '✅ All test data created successfully!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating test data: %', SQLERRM;
        RAISE;
END $$;

-- Show summary
SELECT 'Athletes' as entity, COUNT(*) as count FROM "Athlete"
UNION ALL
SELECT 'Teams', COUNT(*) FROM "Team"
UNION ALL
SELECT 'Documents', COUNT(*) FROM "Document"
UNION ALL
SELECT 'Payments', COUNT(*) FROM "Payment"
UNION ALL
SELECT 'Matches', COUNT(*) FROM "Match"
UNION ALL
SELECT 'Notifications', COUNT(*) FROM "Notification";
