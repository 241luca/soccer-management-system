-- Inserimento semplificato degli atleti
-- Prima verifichiamo le squadre esistenti

-- Demo Soccer Club
INSERT INTO "Athlete" ("organizationId", "teamId", "firstName", "lastName", "birthDate", email, phone, city, province, status, "jerseyNumber")
SELECT 
  'c84fcaaf-4e94-4f42-b901-a080c1f2280e',
  t.id,
  'Marco',
  'Rossi',
  '2010-03-15'::date,
  'marco.rossi@demo.com',
  '333-1234567',
  'Ravenna',
  'RA',
  'ACTIVE',
  10
FROM "Team" t 
WHERE t."organizationId" = 'c84fcaaf-4e94-4f42-b901-a080c1f2280e' 
AND t.name = 'Under 15'
LIMIT 1;

-- Altri atleti Demo
INSERT INTO "Athlete" ("organizationId", "teamId", "firstName", "lastName", "birthDate", email, phone, city, province, status, "jerseyNumber")
SELECT 
  'c84fcaaf-4e94-4f42-b901-a080c1f2280e',
  t.id,
  vals.firstName,
  vals.lastName,
  vals.birthDate::date,
  vals.email,
  vals.phone,
  vals.city,
  vals.province,
  'ACTIVE',
  vals.jerseyNumber
FROM "Team" t,
(VALUES 
  ('Under 15', 'Luca', 'Bianchi', '2010-07-22', 'luca.bianchi@demo.com', '333-2345678', 'Ravenna', 'RA', 7),
  ('Under 15', 'Alessandro', 'Verdi', '2009-11-08', 'ale.verdi@demo.com', '333-3456789', 'Cervia', 'RA', 9),
  ('Under 17', 'Davide', 'Marrone', '2008-04-10', 'davide.marrone@demo.com', '334-1234567', 'Ravenna', 'RA', 10),
  ('Under 17', 'Simone', 'Viola', '2008-08-15', 'simone.viola@demo.com', '334-2345678', 'Ravenna', 'RA', 8),
  ('Under 19', 'Stefano', 'Bianco', '2006-05-12', 'stefano.bianco@demo.com', '335-1234567', 'Ravenna', 'RA', 9),
  ('Under 19', 'Michele', 'Nero', '2006-09-25', 'michele.nero@demo.com', '335-2345678', 'Ravenna', 'RA', 7),
  ('Prima Squadra', 'Federico', 'Santini', '1995-03-22', 'federico.santini@demo.com', '336-1234567', 'Ravenna', 'RA', 10),
  ('Prima Squadra', 'Giacomo', 'Martini', '1998-07-15', 'giacomo.martini@demo.com', '336-2345678', 'Ravenna', 'RA', 7)
) AS vals(teamName, firstName, lastName, birthDate, email, phone, city, province, jerseyNumber)
WHERE t."organizationId" = 'c84fcaaf-4e94-4f42-b901-a080c1f2280e' 
AND t.name = vals.teamName;

-- ASD Ravenna Calcio  
INSERT INTO "Athlete" ("organizationId", "teamId", "firstName", "lastName", "birthDate", email, phone, city, province, status, "jerseyNumber")
SELECT 
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  t.id,
  vals.firstName,
  vals.lastName,
  vals.birthDate::date,
  vals.email,
  vals.phone,
  vals.city,
  vals.province,
  'ACTIVE',
  vals.jerseyNumber
FROM "Team" t,
(VALUES 
  ('Pulcini 2015', 'Tommaso', 'Benedetti', '2015-03-10', 'tommaso.benedetti@ravenna.com', '337-1234567', 'Ravenna', 'RA', 7),
  ('Pulcini 2015', 'Leonardo', 'Fabbri', '2015-06-22', 'leonardo.fabbri@ravenna.com', '337-2345678', 'Ravenna', 'RA', 10),
  ('Esordienti 2013', 'Christian', 'Colombo', '2013-04-15', 'christian.colombo@ravenna.com', '338-1234567', 'Ravenna', 'RA', 9),
  ('Esordienti 2013', 'Daniel', 'Rizzo', '2013-08-20', 'daniel.rizzo@ravenna.com', '338-2345678', 'Ravenna', 'RA', 7),
  ('Giovanissimi U15', 'Fabio', 'De Luca', '2011-05-20', 'fabio.deluca@ravenna.com', '339-1234567', 'Ravenna', 'RA', 10),
  ('Giovanissimi U15', 'Sergio', 'Mancini', '2011-09-15', 'sergio.mancini@ravenna.com', '339-2345678', 'Ravenna', 'RA', 7),
  ('Allievi U17', 'Daniele', 'Battaglia', '2009-04-12', 'daniele.battaglia@ravenna.com', '340-1234567', 'Ravenna', 'RA', 9),
  ('Allievi U17', 'Gianni', 'Fiore', '2009-08-25', 'gianni.fiore@ravenna.com', '340-2345678', 'Ravenna', 'RA', 10),
  ('Juniores U19', 'Raffaele', 'Sala', '2007-05-15', 'raffaele.sala@ravenna.com', '341-1234567', 'Ravenna', 'RA', 10),
  ('Juniores U19', 'Pasquale', 'Guerra', '2007-09-20', 'pasquale.guerra@ravenna.com', '341-2345678', 'Ravenna', 'RA', 7)
) AS vals(teamName, firstName, lastName, birthDate, email, phone, city, province, jerseyNumber)
WHERE t."organizationId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' 
AND t.name = vals.teamName;

-- Verifica inserimento
SELECT o.name as org, COUNT(a.id) as atleti
FROM "Organization" o
LEFT JOIN "Athlete" a ON o.id = a."organizationId"
GROUP BY o.name
ORDER BY o.name;
