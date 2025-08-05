-- Script per creare due società complete con tutti i dati
-- 1. Demo Soccer Club (esistente)
-- 2. ASD Ravenna Calcio (nuova)

-- Prima puliamo i dati esistenti per evitare duplicati
DELETE FROM "Athlete" WHERE "organizationId" IN (
  'c84fcaaf-4e94-4f42-b901-a080c1f2280e',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
);

-- Creiamo la seconda organizzazione: ASD Ravenna Calcio
INSERT INTO "Organization" (
    id,
    name,
    code,
    "fullName",
    address,
    city,
    province,
    "postalCode",
    country,
    email,
    phone,
    website,
    "logoUrl",
    "primaryColor",
    "secondaryColor",
    subdomain,
    plan,
    "maxUsers",
    "maxAthletes",
    "maxTeams",
    "isActive",
    "isTrial",
    "createdAt",
    "updatedAt"
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'ASD Ravenna Calcio',
    'RAVC',
    'Associazione Sportiva Dilettantistica Ravenna Calcio',
    'Via Calcio 100',
    'Ravenna',
    'RA',
    '48121',
    'IT',
    'info@asdravennacalcio.it',
    '+39 0544 987654',
    'https://asdravennacalcio.it',
    'https://ui-avatars.com/api/?name=Ravenna+Calcio&background=DC2626&color=fff&size=200&rounded=true&bold=true',
    '#DC2626',
    '#7F1D1D',
    'ravenna',
    'professional',
    50,
    300,
    15,
    true,
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    "isActive" = true;

-- Creiamo le squadre per ASD Ravenna Calcio
INSERT INTO "Team" (id, "organizationId", name, category, season, "minAge", "maxAge", budget, "isActive")
VALUES 
  ('t1-ravenna', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Pulcini 2015', 'Pulcini', '2024-25', 9, 10, 12000, true),
  ('t2-ravenna', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Esordienti 2013', 'Esordienti', '2024-25', 11, 12, 14000, true),
  ('t3-ravenna', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Giovanissimi U15', 'Giovanissimi', '2024-25', 13, 14, 16000, true),
  ('t4-ravenna', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Allievi U17', 'Allievi', '2024-25', 15, 16, 20000, true),
  ('t5-ravenna', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Juniores U19', 'Juniores', '2024-25', 17, 19, 25000, true)
ON CONFLICT DO NOTHING;

-- Popoliamo gli atleti per entrambe le società
DO $$
DECLARE
  -- Demo Soccer Club teams
  team_u15_demo UUID;
  team_u17_demo UUID;
  team_u19_demo UUID;
  team_prima_demo UUID;
  
  -- Ravenna teams
  team_pulcini UUID := 't1-ravenna';
  team_esordienti UUID := 't2-ravenna';
  team_giovanissimi UUID := 't3-ravenna';
  team_allievi UUID := 't4-ravenna';
  team_juniores UUID := 't5-ravenna';
  
BEGIN
  -- Get Demo Soccer Club team IDs
  SELECT id INTO team_u15_demo FROM "Team" WHERE "organizationId" = 'c84fcaaf-4e94-4f42-b901-a080c1f2280e' AND name = 'Under 15' LIMIT 1;
  SELECT id INTO team_u17_demo FROM "Team" WHERE "organizationId" = 'c84fcaaf-4e94-4f42-b901-a080c1f2280e' AND name = 'Under 17' LIMIT 1;
  SELECT id INTO team_u19_demo FROM "Team" WHERE "organizationId" = 'c84fcaaf-4e94-4f42-b901-a080c1f2280e' AND name = 'Under 19' LIMIT 1;
  SELECT id INTO team_prima_demo FROM "Team" WHERE "organizationId" = 'c84fcaaf-4e94-4f42-b901-a080c1f2280e' AND name = 'Prima Squadra' LIMIT 1;

  -- ATLETI DEMO SOCCER CLUB
  -- Under 15
  INSERT INTO "Athlete" (id, "organizationId", "teamId", "firstName", "lastName", "birthDate", email, phone, city, province, status, "jerseyNumber", "usesTransport", notes)
  VALUES
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u15_demo, 'Marco', 'Rossi', '2010-03-15', 'marco.rossi@demo.com', '333-1234567', 'Ravenna', 'RA', 'ACTIVE', 10, true, 'Ottimo centrocampista'),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u15_demo, 'Luca', 'Bianchi', '2010-07-22', 'luca.bianchi@demo.com', '333-2345678', 'Ravenna', 'RA', 'ACTIVE', 7, false, 'Veloce sulla fascia'),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u15_demo, 'Alessandro', 'Verdi', '2009-11-08', 'ale.verdi@demo.com', '333-3456789', 'Cervia', 'RA', 'ACTIVE', 9, true, 'Bomber naturale'),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u15_demo, 'Matteo', 'Neri', '2010-01-25', 'matteo.neri@demo.com', '333-4567890', 'Ravenna', 'RA', 'ACTIVE', 1, false, 'Portiere affidabile'),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u15_demo, 'Giovanni', 'Gialli', '2010-05-30', 'gio.gialli@demo.com', '333-5678901', 'Faenza', 'RA', 'ACTIVE', 5, true, 'Difensore centrale'),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u15_demo, 'Francesco', 'Rosa', '2009-09-12', 'fra.rosa@demo.com', '333-6789012', 'Ravenna', 'RA', 'ACTIVE', 3, false, 'Terzino sinistro'),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u15_demo, 'Andrea', 'Blu', '2010-02-18', 'andrea.blu@demo.com', '333-7890123', 'Lugo', 'RA', 'ACTIVE', 11, true, 'Ala destra'),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u15_demo, 'Stefano', 'Arancio', '2009-12-05', 'stefano.arancio@demo.com', '333-8901234', 'Ravenna', 'RA', 'ACTIVE', 8, false, 'Centrocampista'),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u15_demo, 'Paolo', 'Viola', '2010-04-20', 'paolo.viola@demo.com', '333-9012345', 'Cervia', 'RA', 'ACTIVE', 4, true, 'Difensore');

  -- Under 17
  INSERT INTO "Athlete" (id, "organizationId", "teamId", "firstName", "lastName", "birthDate", email, phone, city, province, status, "jerseyNumber", "usesTransport")
  VALUES
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u17_demo, 'Davide', 'Marrone', '2008-04-10', 'davide.marrone@demo.com', '334-1234567', 'Ravenna', 'RA', 'ACTIVE', 10, false),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u17_demo, 'Simone', 'Viola', '2008-08-15', 'simone.viola@demo.com', '334-2345678', 'Ravenna', 'RA', 'ACTIVE', 8, true),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u17_demo, 'Lorenzo', 'Arancio', '2007-12-20', 'lorenzo.arancio@demo.com', '334-3456789', 'Cervia', 'RA', 'ACTIVE', 4, true),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u17_demo, 'Riccardo', 'Grigio', '2008-06-05', 'riccardo.grigio@demo.com', '334-4567890', 'Ravenna', 'RA', 'ACTIVE', 6, false),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u17_demo, 'Filippo', 'Celeste', '2008-03-28', 'filippo.celeste@demo.com', '334-5678901', 'Faenza', 'RA', 'ACTIVE', 2, true),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u17_demo, 'Mattia', 'Verde', '2008-01-15', 'mattia.verde@demo.com', '334-6789012', 'Ravenna', 'RA', 'ACTIVE', 11, false),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u17_demo, 'Nicola', 'Rosso', '2007-11-30', 'nicola.rosso@demo.com', '334-7890123', 'Lugo', 'RA', 'ACTIVE', 9, true);

  -- Under 19
  INSERT INTO "Athlete" (id, "organizationId", "teamId", "firstName", "lastName", "birthDate", email, phone, city, province, status, "jerseyNumber", "usesTransport")
  VALUES
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u19_demo, 'Stefano', 'Bianco', '2006-05-12', 'stefano.bianco@demo.com', '335-1234567', 'Ravenna', 'RA', 'ACTIVE', 9, true),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u19_demo, 'Michele', 'Nero', '2006-09-25', 'michele.nero@demo.com', '335-2345678', 'Ravenna', 'RA', 'ACTIVE', 7, false),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u19_demo, 'Paolo', 'Verde', '2005-11-30', 'paolo.verde@demo.com', '335-3456789', 'Cervia', 'RA', 'ACTIVE', 11, true),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u19_demo, 'Roberto', 'Rosso', '2006-02-14', 'roberto.rosso@demo.com', '335-4567890', 'Ravenna', 'RA', 'ACTIVE', 5, false),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u19_demo, 'Emanuele', 'Giallo', '2006-07-08', 'emanuele.giallo@demo.com', '335-5678901', 'Lugo', 'RA', 'ACTIVE', 3, true),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_u19_demo, 'Alberto', 'Blu', '2006-03-22', 'alberto.blu@demo.com', '335-6789012', 'Faenza', 'RA', 'ACTIVE', 8, false);

  -- Prima Squadra
  INSERT INTO "Athlete" (id, "organizationId", "teamId", "firstName", "lastName", "birthDate", email, phone, city, province, status, "jerseyNumber", "usesTransport")
  VALUES
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_prima_demo, 'Federico', 'Santini', '1995-03-22', 'federico.santini@demo.com', '336-1234567', 'Ravenna', 'RA', 'ACTIVE', 10, false),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_prima_demo, 'Giacomo', 'Martini', '1998-07-15', 'giacomo.martini@demo.com', '336-2345678', 'Ravenna', 'RA', 'ACTIVE', 7, false),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_prima_demo, 'Alberto', 'Ricci', '1997-11-28', 'alberto.ricci@demo.com', '336-3456789', 'Cervia', 'RA', 'ACTIVE', 9, true),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_prima_demo, 'Enrico', 'Conti', '1996-05-10', 'enrico.conti@demo.com', '336-4567890', 'Ravenna', 'RA', 'ACTIVE', 1, false),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_prima_demo, 'Nicola', 'Ferrari', '1999-09-18', 'nicola.ferrari@demo.com', '336-5678901', 'Faenza', 'RA', 'ACTIVE', 4, true),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_prima_demo, 'Massimo', 'Romano', '1994-12-05', 'massimo.romano@demo.com', '336-6789012', 'Ravenna', 'RA', 'ACTIVE', 6, false),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_prima_demo, 'Claudio', 'Galli', '2000-02-25', 'claudio.galli@demo.com', '336-7890123', 'Lugo', 'RA', 'ACTIVE', 8, true),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', team_prima_demo, 'Mario', 'Lombardi', '1997-08-18', 'mario.lombardi@demo.com', '336-8901234', 'Ravenna', 'RA', 'ACTIVE', 3, false);

  -- ATLETI ASD RAVENNA CALCIO
  -- Pulcini
  INSERT INTO "Athlete" (id, "organizationId", "teamId", "firstName", "lastName", "birthDate", email, phone, city, province, status, "jerseyNumber", "usesTransport", notes)
  VALUES
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_pulcini, 'Tommaso', 'Benedetti', '2015-03-10', 'tommaso.benedetti@ravenna.com', '337-1234567', 'Ravenna', 'RA', 'ACTIVE', 7, true, 'Promettente attaccante'),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_pulcini, 'Leonardo', 'Fabbri', '2015-06-22', 'leonardo.fabbri@ravenna.com', '337-2345678', 'Ravenna', 'RA', 'ACTIVE', 10, false, 'Ottima visione di gioco'),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_pulcini, 'Mattia', 'Gatti', '2015-09-15', 'mattia.gatti@ravenna.com', '337-3456789', 'Cervia', 'RA', 'ACTIVE', 5, true, 'Difensore solido'),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_pulcini, 'Diego', 'Moretti', '2015-01-28', 'diego.moretti@ravenna.com', '337-4567890', 'Ravenna', 'RA', 'ACTIVE', 1, false, 'Portiere promettente'),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_pulcini, 'Samuele', 'Barbieri', '2015-04-12', 'samuele.barbieri@ravenna.com', '337-5678901', 'Faenza', 'RA', 'ACTIVE', 8, true, 'Centrocampista tecnico'),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_pulcini, 'Gabriele', 'Montanari', '2015-07-30', 'gabriele.montanari@ravenna.com', '337-6789012', 'Ravenna', 'RA', 'ACTIVE', 11, false, 'Veloce sulla fascia'),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_pulcini, 'Edoardo', 'Pellegrini', '2015-02-18', 'edoardo.pellegrini@ravenna.com', '337-7890123', 'Lugo', 'RA', 'ACTIVE', 4, true, 'Difensore laterale');

  -- Esordienti
  INSERT INTO "Athlete" (id, "organizationId", "teamId", "firstName", "lastName", "birthDate", email, phone, city, province, status, "jerseyNumber", "usesTransport")
  VALUES
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_esordienti, 'Christian', 'Colombo', '2013-04-15', 'christian.colombo@ravenna.com', '338-1234567', 'Ravenna', 'RA', 'ACTIVE', 9, true),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_esordienti, 'Daniel', 'Rizzo', '2013-08-20', 'daniel.rizzo@ravenna.com', '338-2345678', 'Ravenna', 'RA', 'ACTIVE', 7, false),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_esordienti, 'Alessio', 'Greco', '2013-12-10', 'alessio.greco@ravenna.com', '338-3456789', 'Cervia', 'RA', 'ACTIVE', 10, true),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_esordienti, 'Manuel', 'Bruno', '2013-03-05', 'manuel.bruno@ravenna.com', '338-4567890', 'Ravenna', 'RA', 'ACTIVE', 5, false),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_esordienti, 'Jacopo', 'Costa', '2013-06-18', 'jacopo.costa@ravenna.com', '338-5678901', 'Faenza', 'RA', 'ACTIVE', 3, true),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_esordienti, 'Valerio', 'Fontana', '2013-09-25', 'valerio.fontana@ravenna.com', '338-6789012', 'Ravenna', 'RA', 'ACTIVE', 8, false),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_esordienti, 'Pietro', 'Caruso', '2013-01-12', 'pietro.caruso@ravenna.com', '338-7890123', 'Lugo', 'RA', 'ACTIVE', 1, true),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_esordienti, 'Gianluca', 'Marini', '2013-05-28', 'gianluca.marini@ravenna.com', '338-8901234', 'Ravenna', 'RA', 'ACTIVE', 11, false);

  -- Giovanissimi
  INSERT INTO "Athlete" (id, "organizationId", "teamId", "firstName", "lastName", "birthDate", email, phone, city, province, status, "jerseyNumber", "usesTransport")
  VALUES
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_giovanissimi, 'Fabio', 'De Luca', '2011-05-20', 'fabio.deluca@ravenna.com', '339-1234567', 'Ravenna', 'RA', 'ACTIVE', 10, true),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_giovanissimi, 'Sergio', 'Mancini', '2011-09-15', 'sergio.mancini@ravenna.com', '339-2345678', 'Ravenna', 'RA', 'ACTIVE', 7, false),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_giovanissimi, 'Carlo', 'Leone', '2010-12-28', 'carlo.leone@ravenna.com', '339-3456789', 'Cervia', 'RA', 'ACTIVE', 9, true),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_giovanissimi, 'Luigi', 'Martinelli', '2011-02-10', 'luigi.martinelli@ravenna.com', '339-4567890', 'Ravenna', 'RA', 'ACTIVE', 4, false),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_giovanissimi, 'Antonio', 'Vitale', '2011-06-05', 'antonio.vitale@ravenna.com', '339-5678901', 'Faenza', 'RA', 'ACTIVE', 6, true),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_giovanissimi, 'Vincenzo', 'Silvestri', '2011-08-22', 'vincenzo.silvestri@ravenna.com', '339-6789012', 'Ravenna', 'RA', 'ACTIVE', 8, false),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_giovanissimi, 'Salvatore', 'Serra', '2010-11-15', 'salvatore.serra@ravenna.com', '339-7890123', 'Lugo', 'RA', 'ACTIVE', 11, true),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_giovanissimi, 'Domenico', 'Gentile', '2011-03-30', 'domenico.gentile@ravenna.com', '339-8901234', 'Ravenna', 'RA', 'ACTIVE', 1, false),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_giovanissimi, 'Angelo', 'Palumbo', '2011-01-08', 'angelo.palumbo@ravenna.com', '339-9012345', 'Cervia', 'RA', 'ACTIVE', 3, true);

  -- Allievi
  INSERT INTO "Athlete" (id, "organizationId", "teamId", "firstName", "lastName", "birthDate", email, phone, city, province, status, "jerseyNumber", "usesTransport")
  VALUES
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_allievi, 'Daniele', 'Battaglia', '2009-04-12', 'daniele.battaglia@ravenna.com', '340-1234567', 'Ravenna', 'RA', 'ACTIVE', 9, false),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_allievi, 'Gianni', 'Fiore', '2009-08-25', 'gianni.fiore@ravenna.com', '340-2345678', 'Ravenna', 'RA', 'ACTIVE', 10, true),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_allievi, 'Mauro', 'Rinaldi', '2008-11-30', 'mauro.rinaldi@ravenna.com', '340-3456789', 'Cervia', 'RA', 'ACTIVE', 7, true),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_allievi, 'Franco', 'Carbone', '2009-02-18', 'franco.carbone@ravenna.com', '340-4567890', 'Ravenna', 'RA', 'ACTIVE', 5, false),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_allievi, 'Luca', 'D Angelo', '2009-06-10', 'luca.dangelo@ravenna.com', '340-5678901', 'Faenza', 'RA', 'ACTIVE', 3, true),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_allievi, 'Giorgio', 'Ferri', '2009-09-05', 'giorgio.ferri@ravenna.com', '340-6789012', 'Ravenna', 'RA', 'ACTIVE', 8, false),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_allievi, 'Piero', 'Messina', '2008-12-20', 'piero.messina@ravenna.com', '340-7890123', 'Lugo', 'RA', 'ACTIVE', 11, true),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_allievi, 'Alessandro', 'Villa', '2009-03-15', 'alessandro.villa@ravenna.com', '340-8901234', 'Ravenna', 'RA', 'ACTIVE', 1, false),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_allievi, 'Bruno', 'Coppola', '2009-07-28', 'bruno.coppola@ravenna.com', '340-9012345', 'Cervia', 'RA', 'ACTIVE', 4, true),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_allievi, 'Vito', 'De Santis', '2009-01-05', 'vito.desantis@ravenna.com', '340-0123456', 'Ravenna', 'RA', 'ACTIVE', 6, false);

  -- Juniores
  INSERT INTO "Athlete" (id, "organizationId", "teamId", "firstName", "lastName", "birthDate", email, phone, city, province, status, "jerseyNumber", "usesTransport")
  VALUES
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_juniores, 'Raffaele', 'Sala', '2007-05-15', 'raffaele.sala@ravenna.com', '341-1234567', 'Ravenna', 'RA', 'ACTIVE', 10, true),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_juniores, 'Pasquale', 'Guerra', '2007-09-20', 'pasquale.guerra@ravenna.com', '341-2345678', 'Ravenna', 'RA', 'ACTIVE', 7, false),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_juniores, 'Gennaro', 'Amato', '2006-12-08', 'gennaro.amato@ravenna.com', '341-3456789', 'Cervia', 'RA', 'ACTIVE', 9, true),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_juniores, 'Gaetano', 'Pagano', '2007-02-25', 'gaetano.pagano@ravenna.com', '341-4567890', 'Ravenna', 'RA', 'ACTIVE', 11, false),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_juniores, 'Ciro', 'Piras', '2007-06-18', 'ciro.piras@ravenna.com', '341-5678901', 'Faenza', 'RA', 'ACTIVE', 5, true),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_juniores, 'Rosario', 'Pellegrino', '2007-08-30', 'rosario.pellegrino@ravenna.com', '341-6789012', 'Ravenna', 'RA', 'ACTIVE', 3, false),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_juniores, 'Carmelo', 'Longo', '2006-11-12', 'carmelo.longo@ravenna.com', '341-7890123', 'Lugo', 'RA', 'ACTIVE', 8, true),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_juniores, 'Nunzio', 'Ferrara', '2007-04-05', 'nunzio.ferrara@ravenna.com', '341-8901234', 'Ravenna', 'RA', 'ACTIVE', 1, false),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_juniores, 'Enzo', 'Basile', '2007-01-22', 'enzo.basile@ravenna.com', '341-9012345', 'Cervia', 'RA', 'ACTIVE', 4, true),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_juniores, 'Umberto', 'Cattaneo', '2007-07-10', 'umberto.cattaneo@ravenna.com', '341-0123456', 'Ravenna', 'RA', 'ACTIVE', 6, false),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', team_juniores, 'Alfredo', 'Sanna', '2006-10-28', 'alfredo.sanna@ravenna.com', '341-1234568', 'Faenza', 'RA', 'ACTIVE', 2, true);

END $$;

-- Creiamo un utente admin per la seconda organizzazione
INSERT INTO "User" (
    id,
    email,
    "passwordHash",
    "firstName", 
    "lastName",
    role,
    "organizationId",
    "isActive"
) VALUES (
    gen_random_uuid(),
    'admin@asdravennacalcio.it',
    '$2a$10$K5KxJL5C8eZ3Hqz6yYBxVOl2rUqGPKm8e5A.DxZRMBQBVhRtV5oNa', -- password: ravenna2024!
    'Admin',
    'Ravenna',
    'ADMIN',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    true
) ON CONFLICT (email) DO NOTHING;

-- Creiamo le zone trasporto per entrambe le organizzazioni
INSERT INTO "TransportZone" (id, "organizationId", name, description, "distanceRange", "monthlyFee", color)
VALUES
  -- Demo Soccer Club
  ('z1-demo', 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Centro Città', 'Zone centrali di Ravenna', '0-5km', 30, '#22C55E'),
  ('z2-demo', 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Prima Periferia', 'Zone periferiche', '5-15km', 45, '#3B82F6'),
  ('z3-demo', 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Comuni Limitrofi', 'Comuni vicini', '15km+', 60, '#F59E0B'),
  -- ASD Ravenna
  ('z1-ravenna', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Zona A - Centro', 'Centro storico e zone limitrofe', '0-3km', 25, '#10B981'),
  ('z2-ravenna', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Zona B - Periferia', 'Zone periferiche della città', '3-10km', 40, '#6366F1'),
  ('z3-ravenna', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Zona C - Extra', 'Comuni esterni', '10km+', 55, '#EF4444')
ON CONFLICT DO NOTHING;

-- Creiamo i bus per entrambe le organizzazioni
INSERT INTO "Bus" (id, "organizationId", name, capacity, "plateNumber", "driverName", "driverPhone", notes)
VALUES
  -- Demo Soccer Club
  ('b1-demo', 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Bus 1 - Centro', 30, 'RA 123 AB', 'Giuseppe Verdi', '333-1111111', 'Copre zone centrali'),
  ('b2-demo', 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Bus 2 - Periferia', 35, 'RA 456 CD', 'Mario Rossi', '333-2222222', 'Copre zone periferiche'),
  -- ASD Ravenna
  ('b1-ravenna', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Pullman A', 40, 'RA 789 EF', 'Carlo Bianchi', '333-3333333', 'Linea principale'),
  ('b2-ravenna', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Pullman B', 35, 'RA 012 GH', 'Luigi Neri', '333-4444444', 'Linea secondaria'),
  ('b3-ravenna', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Minibus C', 20, 'RA 345 IL', 'Paolo Gialli', '333-5555555', 'Per gruppi piccoli')
ON CONFLICT DO NOTHING;

-- Verifica finale
SELECT '=== RIEPILOGO DATI INSERITI ===' as info;

SELECT o.name as organizzazione, 
       COUNT(DISTINCT a.id) as atleti,
       COUNT(DISTINCT t.id) as squadre,
       COUNT(DISTINCT z.id) as zone,
       COUNT(DISTINCT b.id) as bus
FROM "Organization" o
LEFT JOIN "Athlete" a ON o.id = a."organizationId"
LEFT JOIN "Team" t ON o.id = t."organizationId"
LEFT JOIN "TransportZone" z ON o.id = z."organizationId"
LEFT JOIN "Bus" b ON o.id = b."organizationId"
GROUP BY o.id, o.name
ORDER BY o.name;

-- Dettaglio atleti per squadra
SELECT '=== ATLETI PER SQUADRA ===' as info;
SELECT o.name as organizzazione, t.name as squadra, COUNT(a.id) as num_atleti
FROM "Team" t
JOIN "Organization" o ON t."organizationId" = o.id
LEFT JOIN "Athlete" a ON t.id = a."teamId"
GROUP BY o.name, t.name
ORDER BY o.name, t.name;
