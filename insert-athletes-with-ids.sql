-- Inserimento atleti con ID generati automaticamente
-- DEMO SOCCER CLUB
INSERT INTO "Athlete" (id, "organizationId", "firstName", "lastName", "birthDate", email, phone, city, province, status, "jerseyNumber")
VALUES
  -- Alcuni atleti per Demo Soccer Club
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Marco', 'Rossi', '2010-03-15', 'marco.rossi@demo.com', '333-1234567', 'Ravenna', 'RA', 'ACTIVE', 10),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Luca', 'Bianchi', '2010-07-22', 'luca.bianchi@demo.com', '333-2345678', 'Ravenna', 'RA', 'ACTIVE', 7),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Alessandro', 'Verdi', '2009-11-08', 'ale.verdi@demo.com', '333-3456789', 'Cervia', 'RA', 'ACTIVE', 9),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Matteo', 'Neri', '2010-01-25', 'matteo.neri@demo.com', '333-4567890', 'Ravenna', 'RA', 'ACTIVE', 1),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Giovanni', 'Gialli', '2010-05-30', 'gio.gialli@demo.com', '333-5678901', 'Faenza', 'RA', 'ACTIVE', 5),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Francesco', 'Rosa', '2009-09-12', 'fra.rosa@demo.com', '333-6789012', 'Ravenna', 'RA', 'ACTIVE', 3),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Andrea', 'Blu', '2010-02-18', 'andrea.blu@demo.com', '333-7890123', 'Lugo', 'RA', 'ACTIVE', 11),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Stefano', 'Arancio', '2009-12-05', 'stefano.arancio@demo.com', '333-8901234', 'Ravenna', 'RA', 'ACTIVE', 8),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Paolo', 'Viola', '2010-04-20', 'paolo.viola@demo.com', '333-9012345', 'Cervia', 'RA', 'ACTIVE', 4),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Davide', 'Marrone', '2008-04-10', 'davide.marrone@demo.com', '334-1234567', 'Ravenna', 'RA', 'ACTIVE', 10),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Simone', 'Viola', '2008-08-15', 'simone.viola@demo.com', '334-2345678', 'Ravenna', 'RA', 'ACTIVE', 8),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Lorenzo', 'Arancio', '2007-12-20', 'lorenzo.arancio@demo.com', '334-3456789', 'Cervia', 'RA', 'ACTIVE', 4),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Riccardo', 'Grigio', '2008-06-05', 'riccardo.grigio@demo.com', '334-4567890', 'Ravenna', 'RA', 'ACTIVE', 6),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Filippo', 'Celeste', '2008-03-28', 'filippo.celeste@demo.com', '334-5678901', 'Faenza', 'RA', 'ACTIVE', 2),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Stefano', 'Bianco', '2006-05-12', 'stefano.bianco@demo.com', '335-1234567', 'Ravenna', 'RA', 'ACTIVE', 9),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Michele', 'Nero', '2006-09-25', 'michele.nero@demo.com', '335-2345678', 'Ravenna', 'RA', 'ACTIVE', 7),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Paolo', 'Verde', '2005-11-30', 'paolo.verde@demo.com', '335-3456789', 'Cervia', 'RA', 'ACTIVE', 11),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Roberto', 'Rosso', '2006-02-14', 'roberto.rosso@demo.com', '335-4567890', 'Ravenna', 'RA', 'ACTIVE', 5),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Emanuele', 'Giallo', '2006-07-08', 'emanuele.giallo@demo.com', '335-5678901', 'Lugo', 'RA', 'ACTIVE', 3),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Federico', 'Santini', '1995-03-22', 'federico.santini@demo.com', '336-1234567', 'Ravenna', 'RA', 'ACTIVE', 10),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Giacomo', 'Martini', '1998-07-15', 'giacomo.martini@demo.com', '336-2345678', 'Ravenna', 'RA', 'ACTIVE', 7),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Alberto', 'Ricci', '1997-11-28', 'alberto.ricci@demo.com', '336-3456789', 'Cervia', 'RA', 'ACTIVE', 9),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Enrico', 'Conti', '1996-05-10', 'enrico.conti@demo.com', '336-4567890', 'Ravenna', 'RA', 'ACTIVE', 1),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Nicola', 'Ferrari', '1999-09-18', 'nicola.ferrari@demo.com', '336-5678901', 'Faenza', 'RA', 'ACTIVE', 4);

-- ASD RAVENNA CALCIO
INSERT INTO "Athlete" (id, "organizationId", "firstName", "lastName", "birthDate", email, phone, city, province, status, "jerseyNumber")
VALUES
  -- Alcuni atleti per ASD Ravenna
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Tommaso', 'Benedetti', '2015-03-10', 'tommaso.benedetti@ravenna.com', '337-1234567', 'Ravenna', 'RA', 'ACTIVE', 7),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Leonardo', 'Fabbri', '2015-06-22', 'leonardo.fabbri@ravenna.com', '337-2345678', 'Ravenna', 'RA', 'ACTIVE', 10),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Mattia', 'Gatti', '2015-09-15', 'mattia.gatti@ravenna.com', '337-3456789', 'Cervia', 'RA', 'ACTIVE', 5),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Diego', 'Moretti', '2015-01-28', 'diego.moretti@ravenna.com', '337-4567890', 'Ravenna', 'RA', 'ACTIVE', 1),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Samuele', 'Barbieri', '2015-04-12', 'samuele.barbieri@ravenna.com', '337-5678901', 'Faenza', 'RA', 'ACTIVE', 8),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Christian', 'Colombo', '2013-04-15', 'christian.colombo@ravenna.com', '338-1234567', 'Ravenna', 'RA', 'ACTIVE', 9),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Daniel', 'Rizzo', '2013-08-20', 'daniel.rizzo@ravenna.com', '338-2345678', 'Ravenna', 'RA', 'ACTIVE', 7),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Alessio', 'Greco', '2013-12-10', 'alessio.greco@ravenna.com', '338-3456789', 'Cervia', 'RA', 'ACTIVE', 10),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Manuel', 'Bruno', '2013-03-05', 'manuel.bruno@ravenna.com', '338-4567890', 'Ravenna', 'RA', 'ACTIVE', 5),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Jacopo', 'Costa', '2013-06-18', 'jacopo.costa@ravenna.com', '338-5678901', 'Faenza', 'RA', 'ACTIVE', 3),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Fabio', 'De Luca', '2011-05-20', 'fabio.deluca@ravenna.com', '339-1234567', 'Ravenna', 'RA', 'ACTIVE', 10),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sergio', 'Mancini', '2011-09-15', 'sergio.mancini@ravenna.com', '339-2345678', 'Ravenna', 'RA', 'ACTIVE', 7),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Carlo', 'Leone', '2010-12-28', 'carlo.leone@ravenna.com', '339-3456789', 'Cervia', 'RA', 'ACTIVE', 9),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Luigi', 'Martinelli', '2011-02-10', 'luigi.martinelli@ravenna.com', '339-4567890', 'Ravenna', 'RA', 'ACTIVE', 4),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Antonio', 'Vitale', '2011-06-05', 'antonio.vitale@ravenna.com', '339-5678901', 'Faenza', 'RA', 'ACTIVE', 6),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Daniele', 'Battaglia', '2009-04-12', 'daniele.battaglia@ravenna.com', '340-1234567', 'Ravenna', 'RA', 'ACTIVE', 9),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Gianni', 'Fiore', '2009-08-25', 'gianni.fiore@ravenna.com', '340-2345678', 'Ravenna', 'RA', 'ACTIVE', 10),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Mauro', 'Rinaldi', '2008-11-30', 'mauro.rinaldi@ravenna.com', '340-3456789', 'Cervia', 'RA', 'ACTIVE', 7),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Franco', 'Carbone', '2009-02-18', 'franco.carbone@ravenna.com', '340-4567890', 'Ravenna', 'RA', 'ACTIVE', 5),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Luca', 'D Angelo', '2009-06-10', 'luca.dangelo@ravenna.com', '340-5678901', 'Faenza', 'RA', 'ACTIVE', 3),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Raffaele', 'Sala', '2007-05-15', 'raffaele.sala@ravenna.com', '341-1234567', 'Ravenna', 'RA', 'ACTIVE', 10),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Pasquale', 'Guerra', '2007-09-20', 'pasquale.guerra@ravenna.com', '341-2345678', 'Ravenna', 'RA', 'ACTIVE', 7),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Gennaro', 'Amato', '2006-12-08', 'gennaro.amato@ravenna.com', '341-3456789', 'Cervia', 'RA', 'ACTIVE', 9),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Gaetano', 'Pagano', '2007-02-25', 'gaetano.pagano@ravenna.com', '341-4567890', 'Ravenna', 'RA', 'ACTIVE', 11),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Ciro', 'Piras', '2007-06-18', 'ciro.piras@ravenna.com', '341-5678901', 'Faenza', 'RA', 'ACTIVE', 5);

-- Verifica finale
SELECT o.name as organizzazione, COUNT(a.id) as num_atleti
FROM "Organization" o
LEFT JOIN "Athlete" a ON o.id = a."organizationId"
GROUP BY o.id, o.name
ORDER BY o.name;
