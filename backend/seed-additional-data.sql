-- Seed dati aggiuntivi per Soccer Management System
-- Da eseguire DOPO npm run setup:multi-tenant

-- Verifica organizzazione esistente
DO $$
DECLARE
    org_id UUID;
    team_u15_id UUID;
    team_u17_id UUID;
    team_prima_id UUID;
BEGIN
    -- Ottieni l'ID dell'organizzazione DEMO
    SELECT id INTO org_id FROM "Organization" WHERE code = 'DEMO';
    
    IF org_id IS NULL THEN
        RAISE NOTICE 'Organizzazione DEMO non trovata. Esegui prima: npm run setup:multi-tenant';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Trovata organizzazione: %', org_id;
    
    -- Crea le squadre
    INSERT INTO "Team" (id, "organizationId", name, category, season, "minAge", "maxAge", "isActive", "createdAt", "updatedAt")
    VALUES 
        (gen_random_uuid(), org_id, 'Under 15', 'UNDER_15', '2024/2025', 13, 15, true, NOW(), NOW()),
        (gen_random_uuid(), org_id, 'Under 17', 'UNDER_17', '2024/2025', 15, 17, true, NOW(), NOW()),
        (gen_random_uuid(), org_id, 'Prima Squadra', 'PRIMA_SQUADRA', '2024/2025', 18, 99, true, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    -- Ottieni gli ID delle squadre create
    SELECT id INTO team_u15_id FROM "Team" WHERE "organizationId" = org_id AND name = 'Under 15';
    SELECT id INTO team_u17_id FROM "Team" WHERE "organizationId" = org_id AND name = 'Under 17';
    SELECT id INTO team_prima_id FROM "Team" WHERE "organizationId" = org_id AND name = 'Prima Squadra';
    
    -- Crea alcuni atleti di esempio
    INSERT INTO "Athlete" ("organizationId", "teamId", "firstName", "lastName", email, phone, "birthDate", 
                          address, city, "postalCode", "fiscalCode", status, "usesTransport", notes, "createdAt", "updatedAt")
    VALUES 
    -- Under 15
    (org_id, team_u15_id, 'Marco', 'Rossi', 'marco.rossi@email.com', '333-1234567', '2010-03-15'::date, 
     'Via Roma 10', 'Milano', '20100', 'RSSMRC10C15F205X', 'ACTIVE', true, 'Ottimo potenziale', NOW(), NOW()),
    (org_id, team_u15_id, 'Luca', 'Bianchi', 'luca.bianchi@email.com', '333-2234567', '2010-05-22'::date,
     'Via Milano 5', 'Milano', '20100', 'BNCLCU10E22F205X', 'ACTIVE', true, 'Portiere promettente', NOW(), NOW()),
    (org_id, team_u15_id, 'Alessandro', 'Verdi', 'ale.verdi@email.com', '333-3234567', '2010-07-10'::date,
     'Via Torino 15', 'Milano', '20100', 'VRDLSS10L10F205X', 'ACTIVE', false, 'Certificato in scadenza', NOW(), NOW()),
    
    -- Under 17
    (org_id, team_u17_id, 'Francesco', 'Neri', 'francesco.neri@email.com', '334-1234567', '2008-04-12'::date,
     'Via Venezia 20', 'Milano', '20100', 'NREFNC08D12F205X', 'ACTIVE', true, 'Capitano squadra', NOW(), NOW()),
    (org_id, team_u17_id, 'Andrea', 'Blu', 'andrea.blu@email.com', '334-2234567', '2008-06-25'::date,
     'Via Firenze 12', 'Milano', '20100', 'BLUNDR08H25F205X', 'ACTIVE', false, 'Attaccante', NOW(), NOW()),
    
    -- Prima Squadra
    (org_id, team_prima_id, 'Roberto', 'Azzurri', 'roberto.azzurri@email.com', '336-1234567', '1998-03-10'::date,
     'Via Como 30', 'Milano', '20100', 'ZZRRRT98C10F205X', 'ACTIVE', false, 'Attaccante titolare', NOW(), NOW()),
    (org_id, team_prima_id, 'Michele', 'Verdemare', 'michele.verdemare@email.com', '336-2234567', '1999-06-15'::date,
     'Via Brescia 22', 'Milano', '20100', 'VRDMHL99H15F205X', 'ACTIVE', false, 'Centrocampista', NOW(), NOW());
    
    RAISE NOTICE 'Atleti creati con successo!';
    
    -- Crea zone trasporto
    INSERT INTO "TransportZone" ("organizationId", name, description, "createdAt", "updatedAt")
    VALUES
    (org_id, 'NORD', 'Zona Nord - Milano Nord', NOW(), NOW()),
    (org_id, 'SUD', 'Zona Sud - Milano Sud', NOW(), NOW()),
    (org_id, 'EST', 'Zona Est - Milano Est', NOW(), NOW()),
    (org_id, 'OVEST', 'Zona Ovest - Milano Ovest', NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Zone trasporto create!';
    
    -- Crea pulmini
    INSERT INTO "Bus" ("organizationId", name, "plateNumber", capacity, "driverName", "driverPhone", "isActive", "createdAt", "updatedAt")
    VALUES
    (org_id, 'Pulmino 1', 'AB123CD', 8, 'Giuseppe Verdi', '333-9876543', true, NOW(), NOW()),
    (org_id, 'Pulmino 2', 'EF456GH', 8, 'Mario Rossi', '334-1234567', true, NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Pulmini creati!';
    
END $$;

-- Mostra riepilogo
SELECT 'Riepilogo Dati:' as info;
SELECT 'Organizzazioni' as entity, COUNT(*) as count FROM "Organization"
UNION ALL
SELECT 'Utenti', COUNT(*) FROM "User"
UNION ALL
SELECT 'Teams', COUNT(*) FROM "Team"
UNION ALL
SELECT 'Atleti', COUNT(*) FROM "Athlete"
UNION ALL
SELECT 'Zone Trasporto', COUNT(*) FROM "TransportZone"
UNION ALL
SELECT 'Pulmini', COUNT(*) FROM "Bus";
