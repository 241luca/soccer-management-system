-- Script per creare dati demo per Demo Soccer Club
-- Organization ID: c84fcaaf-4e94-4f42-b901-a080c1f2280e

-- Prima creiamo le squadre se non esistono
INSERT INTO "Team" (id, "organizationId", name, category, season, "minAge", "maxAge", budget, "isActive")
VALUES 
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Under 15', 'Giovanili', '2024-25', 13, 15, 15000, true),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Under 17', 'Giovanili', '2024-25', 15, 17, 18000, true),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Under 19', 'Giovanili', '2024-25', 17, 19, 20000, true),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Prima Squadra', 'Seniores', '2024-25', 18, 99, 45000, true)
ON CONFLICT DO NOTHING;

-- Recuperiamo gli ID delle squadre
DO $$
DECLARE
  team_u15_id UUID;
  team_u17_id UUID;
  team_u19_id UUID;
  team_prima_id UUID;
  org_id UUID := 'c84fcaaf-4e94-4f42-b901-a080c1f2280e';
BEGIN
  -- Get team IDs
  SELECT id INTO team_u15_id FROM "Team" WHERE "organizationId" = org_id AND name = 'Under 15' LIMIT 1;
  SELECT id INTO team_u17_id FROM "Team" WHERE "organizationId" = org_id AND name = 'Under 17' LIMIT 1;
  SELECT id INTO team_u19_id FROM "Team" WHERE "organizationId" = org_id AND name = 'Under 19' LIMIT 1;
  SELECT id INTO team_prima_id FROM "Team" WHERE "organizationId" = org_id AND name = 'Prima Squadra' LIMIT 1;

  -- Inserisci atleti per Under 15
  INSERT INTO "Athlete" (id, "organizationId", "teamId", "firstName", "lastName", "birthDate", email, phone, city, province, status, "jerseyNumber")
  VALUES
    (gen_random_uuid(), org_id, team_u15_id, 'Marco', 'Rossi', '2010-03-15', 'marco.rossi@demo.com', '333-1234567', 'Ravenna', 'RA', 'ACTIVE', 10),
    (gen_random_uuid(), org_id, team_u15_id, 'Luca', 'Bianchi', '2010-07-22', 'luca.bianchi@demo.com', '333-2345678', 'Ravenna', 'RA', 'ACTIVE', 7),
    (gen_random_uuid(), org_id, team_u15_id, 'Alessandro', 'Verdi', '2009-11-08', 'ale.verdi@demo.com', '333-3456789', 'Cervia', 'RA', 'ACTIVE', 9),
    (gen_random_uuid(), org_id, team_u15_id, 'Matteo', 'Neri', '2010-01-25', 'matteo.neri@demo.com', '333-4567890', 'Ravenna', 'RA', 'ACTIVE', 1),
    (gen_random_uuid(), org_id, team_u15_id, 'Giovanni', 'Gialli', '2010-05-30', 'gio.gialli@demo.com', '333-5678901', 'Faenza', 'RA', 'ACTIVE', 5),
    (gen_random_uuid(), org_id, team_u15_id, 'Francesco', 'Rosa', '2009-09-12', 'fra.rosa@demo.com', '333-6789012', 'Ravenna', 'RA', 'ACTIVE', 3),
    (gen_random_uuid(), org_id, team_u15_id, 'Andrea', 'Blu', '2010-02-18', 'andrea.blu@demo.com', '333-7890123', 'Lugo', 'RA', 'ACTIVE', 11);

  -- Inserisci atleti per Under 17
  INSERT INTO "Athlete" (id, "organizationId", "teamId", "firstName", "lastName", "birthDate", email, phone, city, province, status, "jerseyNumber")
  VALUES
    (gen_random_uuid(), org_id, team_u17_id, 'Davide', 'Marrone', '2008-04-10', 'davide.marrone@demo.com', '334-1234567', 'Ravenna', 'RA', 'ACTIVE', 10),
    (gen_random_uuid(), org_id, team_u17_id, 'Simone', 'Viola', '2008-08-15', 'simone.viola@demo.com', '334-2345678', 'Ravenna', 'RA', 'ACTIVE', 8),
    (gen_random_uuid(), org_id, team_u17_id, 'Lorenzo', 'Arancio', '2007-12-20', 'lorenzo.arancio@demo.com', '334-3456789', 'Cervia', 'RA', 'ACTIVE', 4),
    (gen_random_uuid(), org_id, team_u17_id, 'Riccardo', 'Grigio', '2008-06-05', 'riccardo.grigio@demo.com', '334-4567890', 'Ravenna', 'RA', 'ACTIVE', 6),
    (gen_random_uuid(), org_id, team_u17_id, 'Filippo', 'Celeste', '2008-03-28', 'filippo.celeste@demo.com', '334-5678901', 'Faenza', 'RA', 'ACTIVE', 2);

  -- Inserisci atleti per Under 19
  INSERT INTO "Athlete" (id, "organizationId", "teamId", "firstName", "lastName", "birthDate", email, phone, city, province, status, "jerseyNumber")
  VALUES
    (gen_random_uuid(), org_id, team_u19_id, 'Stefano', 'Bianco', '2006-05-12', 'stefano.bianco@demo.com', '335-1234567', 'Ravenna', 'RA', 'ACTIVE', 9),
    (gen_random_uuid(), org_id, team_u19_id, 'Michele', 'Nero', '2006-09-25', 'michele.nero@demo.com', '335-2345678', 'Ravenna', 'RA', 'ACTIVE', 7),
    (gen_random_uuid(), org_id, team_u19_id, 'Paolo', 'Verde', '2005-11-30', 'paolo.verde@demo.com', '335-3456789', 'Cervia', 'RA', 'ACTIVE', 11),
    (gen_random_uuid(), org_id, team_u19_id, 'Roberto', 'Rosso', '2006-02-14', 'roberto.rosso@demo.com', '335-4567890', 'Ravenna', 'RA', 'ACTIVE', 5),
    (gen_random_uuid(), org_id, team_u19_id, 'Emanuele', 'Giallo', '2006-07-08', 'emanuele.giallo@demo.com', '335-5678901', 'Lugo', 'RA', 'ACTIVE', 3);

  -- Inserisci atleti per Prima Squadra
  INSERT INTO "Athlete" (id, "organizationId", "teamId", "firstName", "lastName", "birthDate", email, phone, city, province, status, "jerseyNumber")
  VALUES
    (gen_random_uuid(), org_id, team_prima_id, 'Federico', 'Santini', '1995-03-22', 'federico.santini@demo.com', '336-1234567', 'Ravenna', 'RA', 'ACTIVE', 10),
    (gen_random_uuid(), org_id, team_prima_id, 'Giacomo', 'Martini', '1998-07-15', 'giacomo.martini@demo.com', '336-2345678', 'Ravenna', 'RA', 'ACTIVE', 7),
    (gen_random_uuid(), org_id, team_prima_id, 'Alberto', 'Ricci', '1997-11-28', 'alberto.ricci@demo.com', '336-3456789', 'Cervia', 'RA', 'ACTIVE', 9),
    (gen_random_uuid(), org_id, team_prima_id, 'Enrico', 'Conti', '1996-05-10', 'enrico.conti@demo.com', '336-4567890', 'Ravenna', 'RA', 'ACTIVE', 1),
    (gen_random_uuid(), org_id, team_prima_id, 'Nicola', 'Ferrari', '1999-09-18', 'nicola.ferrari@demo.com', '336-5678901', 'Faenza', 'RA', 'ACTIVE', 4),
    (gen_random_uuid(), org_id, team_prima_id, 'Massimo', 'Romano', '1994-12-05', 'massimo.romano@demo.com', '336-6789012', 'Ravenna', 'RA', 'ACTIVE', 6),
    (gen_random_uuid(), org_id, team_prima_id, 'Claudio', 'Galli', '2000-02-25', 'claudio.galli@demo.com', '336-7890123', 'Lugo', 'RA', 'ACTIVE', 8);

END $$;

-- Verifica
SELECT 
  t.name as squadra,
  COUNT(a.id) as numero_atleti
FROM "Team" t
LEFT JOIN "Athlete" a ON t.id = a."teamId"
WHERE t."organizationId" = 'c84fcaaf-4e94-4f42-b901-a080c1f2280e'
GROUP BY t.name
ORDER BY t.name;
