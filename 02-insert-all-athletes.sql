-- 2. INSERIMENTO ATLETI PER ENTRAMBE LE ORGANIZZAZIONI

-- Prima otteniamo gli ID delle squadre
DO $$
DECLARE
  -- Demo Soccer Club teams
  team_u15_demo UUID;
  team_u17_demo UUID;
  team_u19_demo UUID;
  team_prima_demo UUID;
  
  -- Ravenna teams
  team_pulcini UUID;
  team_esordienti UUID;
  team_giovanissimi UUID;
  team_allievi UUID;
  team_juniores UUID;
  
BEGIN
  -- Get Demo Soccer Club team IDs
  SELECT id INTO team_u15_demo FROM "Team" WHERE "organizationId" = 'c84fcaaf-4e94-4f42-b901-a080c1f2280e' AND name = 'Under 15';
  SELECT id INTO team_u17_demo FROM "Team" WHERE "organizationId" = 'c84fcaaf-4e94-4f42-b901-a080c1f2280e' AND name = 'Under 17';
  SELECT id INTO team_u19_demo FROM "Team" WHERE "organizationId" = 'c84fcaaf-4e94-4f42-b901-a080c1f2280e' AND name = 'Under 19';
  SELECT id INTO team_prima_demo FROM "Team" WHERE "organizationId" = 'c84fcaaf-4e94-4f42-b901-a080c1f2280e' AND name = 'Prima Squadra';
  
  -- Get Ravenna team IDs
  SELECT id INTO team_pulcini FROM "Team" WHERE "organizationId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND name = 'Pulcini 2015';
  SELECT id INTO team_esordienti FROM "Team" WHERE "organizationId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND name = 'Esordienti 2013';
  SELECT id INTO team_giovanissimi FROM "Team" WHERE "organizationId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND name = 'Giovanissimi U15';
  SELECT id INTO team_allievi FROM "Team" WHERE "organizationId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND name = 'Allievi U17';
  SELECT id INTO team_juniores FROM "Team" WHERE "organizationId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND name = 'Juniores U19';

  -- ATLETI DEMO SOCCER CLUB
  INSERT INTO "Athlete" (id, "organizationId", "teamId", "firstName", "lastName", "birthDate", email, phone, city, province, status, "jerseyNumber", "createdAt", "updatedAt")
  VALUES
    -- Under 15
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u15_demo, 'Marco', 'Rossi', '2010-03-15', 'marco.rossi@demo.com', '333-1234567', 'Ravenna', 'RA', 'ACTIVE', 10, NOW(), NOW()),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u15_demo, 'Luca', 'Bianchi', '2010-07-22', 'luca.bianchi@demo.com', '333-2345678', 'Ravenna', 'RA', 'ACTIVE', 7, NOW(), NOW()),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u15_demo, 'Alessandro', 'Verdi', '2009-11-08', 'ale.verdi@demo.com', '333-3456789', 'Cervia', 'RA', 'ACTIVE', 9, NOW(), NOW()),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u15_demo, 'Matteo', 'Neri', '2010-01-25', 'matteo.neri@demo.com', '333-4567890', 'Ravenna', 'RA', 'ACTIVE', 1, NOW(), NOW()),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u15_demo, 'Giovanni', 'Gialli', '2010-05-30', 'gio.gialli@demo.com', '333-5678901', 'Faenza', 'RA', 'ACTIVE', 5, NOW(), NOW()),
    
    -- Under 17
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u17_demo, 'Davide', 'Marrone', '2008-04-10', 'davide.marrone@demo.com', '334-1234567', 'Ravenna', 'RA', 'ACTIVE', 10, NOW(), NOW()),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u17_demo, 'Simone', 'Viola', '2008-08-15', 'simone.viola@demo.com', '334-2345678', 'Ravenna', 'RA', 'ACTIVE', 8, NOW(), NOW()),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u17_demo, 'Lorenzo', 'Arancio', '2007-12-20', 'lorenzo.arancio@demo.com', '334-3456789', 'Cervia', 'RA', 'ACTIVE', 4, NOW(), NOW()),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u17_demo, 'Riccardo', 'Grigio', '2008-06-05', 'riccardo.grigio@demo.com', '334-4567890', 'Ravenna', 'RA', 'ACTIVE', 6, NOW(), NOW()),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u17_demo, 'Filippo', 'Celeste', '2008-03-28', 'filippo.celeste@demo.com', '334-5678901', 'Faenza', 'RA', 'ACTIVE', 2, NOW(), NOW()),
    
    -- Under 19
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u19_demo, 'Stefano', 'Bianco', '2006-05-12', 'stefano.bianco@demo.com', '335-1234567', 'Ravenna', 'RA', 'ACTIVE', 9, NOW(), NOW()),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u19_demo, 'Michele', 'Nero', '2006-09-25', 'michele.nero@demo.com', '335-2345678', 'Ravenna', 'RA', 'ACTIVE', 7, NOW(), NOW()),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u19_demo, 'Paolo', 'Verde', '2005-11-30', 'paolo.verde@demo.com', '335-3456789', 'Cervia', 'RA', 'ACTIVE', 11, NOW(), NOW()),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u19_demo, 'Roberto', 'Rosso', '2006-02-14', 'roberto.rosso@demo.com', '335-4567890', 'Ravenna', 'RA', 'ACTIVE', 5, NOW(), NOW()),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u19_demo, 'Emanuele', 'Giallo', '2006-07-08', 'emanuele.giallo@demo.com', '335-5678901', 'Lugo', 'RA', 'ACTIVE', 3, NOW(), NOW()),
    
    -- Prima Squadra
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_prima_demo, 'Federico', 'Santini', '1995-03-22', 'federico.santini@demo.com', '336-1234567', 'Ravenna', 'RA', 'ACTIVE', 10, NOW(), NOW()),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_prima_demo, 'Giacomo', 'Martini', '1998-07-15', 'giacomo.martini@demo.com', '336-2345678', 'Ravenna', 'RA', 'ACTIVE', 7, NOW(), NOW()),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_prima_demo, 'Alberto', 'Ricci', '1997-11-28', 'alberto.ricci@demo.com', '336-3456789', 'Cervia', 'RA', 'ACTIVE', 9, NOW(), NOW()),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_prima_demo, 'Enrico', 'Conti', '1996-05-10', 'enrico.conti@demo.com', '336-4567890', 'Ravenna', 'RA', 'ACTIVE', 1, NOW(), NOW()),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_prima_demo, 'Nicola', 'Ferrari', '1999-09-18', 'nicola.ferrari@demo.com', '336-5678901', 'Faenza', 'RA', 'ACTIVE', 4, NOW(), NOW());

  -- ATLETI ASD RAVENNA CALCIO
  INSERT INTO "Athlete" (id, "organizationId", "teamId", "firstName", "lastName", "birthDate", email, phone, city, province, status, "jerseyNumber", "createdAt", "updatedAt")
  VALUES
    -- Pulcini
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_pulcini, 'Tommaso', 'Benedetti', '2015-03-10', 'tommaso.benedetti@ravenna.com', '337-1234567', 'Ravenna', 'RA', 'ACTIVE', 7, NOW(), NOW()),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_pulcini, 'Leonardo', 'Fabbri', '2015-06-22', 'leonardo.fabbri@ravenna.com', '337-2345678', 'Ravenna', 'RA', 'ACTIVE', 10, NOW(), NOW()),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_pulcini, 'Mattia', 'Gatti', '2015-09-15', 'mattia.gatti@ravenna.com', '337-3456789', 'Cervia', 'RA', 'ACTIVE', 5, NOW(), NOW()),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_pulcini, 'Diego', 'Moretti', '2015-01-28', 'diego.moretti@ravenna.com', '337-4567890', 'Ravenna', 'RA', 'ACTIVE', 1, NOW(), NOW()),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_pulcini, 'Samuele', 'Barbieri', '2015-04-12', 'samuele.barbieri@ravenna.com', '337-5678901', 'Faenza', 'RA', 'ACTIVE', 8, NOW(), NOW()),
    
    -- Esordienti
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_esordienti, 'Christian', 'Colombo', '2013-04-15', 'christian.colombo@ravenna.com', '338-1234567', 'Ravenna', 'RA', 'ACTIVE', 9, NOW(), NOW()),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_esordienti, 'Daniel', 'Rizzo', '2013-08-20', 'daniel.rizzo@ravenna.com', '338-2345678', 'Ravenna', 'RA', 'ACTIVE', 7, NOW(), NOW()),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_esordienti, 'Alessio', 'Greco', '2013-12-10', 'alessio.greco@ravenna.com', '338-3456789', 'Cervia', 'RA', 'ACTIVE', 10, NOW(), NOW()),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_esordienti, 'Manuel', 'Bruno', '2013-03-05', 'manuel.bruno@ravenna.com', '338-4567890', 'Ravenna', 'RA', 'ACTIVE', 5, NOW(), NOW()),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_esordienti, 'Jacopo', 'Costa', '2013-06-18', 'jacopo.costa@ravenna.com', '338-5678901', 'Faenza', 'RA', 'ACTIVE', 3, NOW(), NOW()),
    
    -- Giovanissimi
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_giovanissimi, 'Fabio', 'De Luca', '2011-05-20', 'fabio.deluca@ravenna.com', '339-1234567', 'Ravenna', 'RA', 'ACTIVE', 10, NOW(), NOW()),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_giovanissimi, 'Sergio', 'Mancini', '2011-09-15', 'sergio.mancini@ravenna.com', '339-2345678', 'Ravenna', 'RA', 'ACTIVE', 7, NOW(), NOW()),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_giovanissimi, 'Carlo', 'Leone', '2010-12-28', 'carlo.leone@ravenna.com', '339-3456789', 'Cervia', 'RA', 'ACTIVE', 9, NOW(), NOW()),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_giovanissimi, 'Luigi', 'Martinelli', '2011-02-10', 'luigi.martinelli@ravenna.com', '339-4567890', 'Ravenna', 'RA', 'ACTIVE', 4, NOW(), NOW()),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_giovanissimi, 'Antonio', 'Vitale', '2011-06-05', 'antonio.vitale@ravenna.com', '339-5678901', 'Faenza', 'RA', 'ACTIVE', 6, NOW(), NOW()),
    
    -- Allievi
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_allievi, 'Daniele', 'Battaglia', '2009-04-12', 'daniele.battaglia@ravenna.com', '340-1234567', 'Ravenna', 'RA', 'ACTIVE', 9, NOW(), NOW()),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_allievi, 'Gianni', 'Fiore', '2009-08-25', 'gianni.fiore@ravenna.com', '340-2345678', 'Ravenna', 'RA', 'ACTIVE', 10, NOW(), NOW()),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_allievi, 'Mauro', 'Rinaldi', '2008-11-30', 'mauro.rinaldi@ravenna.com', '340-3456789', 'Cervia', 'RA', 'ACTIVE', 7, NOW(), NOW()),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_allievi, 'Franco', 'Carbone', '2009-02-18', 'franco.carbone@ravenna.com', '340-4567890', 'Ravenna', 'RA', 'ACTIVE', 5, NOW(), NOW()),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_allievi, 'Luca', 'D Angelo', '2009-06-10', 'luca.dangelo@ravenna.com', '340-5678901', 'Faenza', 'RA', 'ACTIVE', 3, NOW(), NOW()),
    
    -- Juniores
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_juniores, 'Raffaele', 'Sala', '2007-05-15', 'raffaele.sala@ravenna.com', '341-1234567', 'Ravenna', 'RA', 'ACTIVE', 10, NOW(), NOW()),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_juniores, 'Pasquale', 'Guerra', '2007-09-20', 'pasquale.guerra@ravenna.com', '341-2345678', 'Ravenna', 'RA', 'ACTIVE', 7, NOW(), NOW()),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_juniores, 'Gennaro', 'Amato', '2006-12-08', 'gennaro.amato@ravenna.com', '341-3456789', 'Cervia', 'RA', 'ACTIVE', 9, NOW(), NOW()),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_juniores, 'Gaetano', 'Pagano', '2007-02-25', 'gaetano.pagano@ravenna.com', '341-4567890', 'Ravenna', 'RA', 'ACTIVE', 11, NOW(), NOW()),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_juniores, 'Ciro', 'Piras', '2007-06-18', 'ciro.piras@ravenna.com', '341-5678901', 'Faenza', 'RA', 'ACTIVE', 5, NOW(), NOW());

END $$;

-- Verifica inserimento
SELECT o.name as organizzazione, COUNT(a.id) as num_atleti
FROM "Organization" o
LEFT JOIN "Athlete" a ON o.id = a."organizationId"
GROUP BY o.id, o.name
ORDER BY o.name;
