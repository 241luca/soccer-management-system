-- POPOLAMENTO COMPLETO DATABASE - TUTTI I DATI MANCANTI

-- 1. ZONE TRASPORTO PER RAVENNA
INSERT INTO "TransportZone" (id, "organizationId", name, description, "distanceRange", "monthlyFee", color, "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Zona A - Centro', 'Centro storico e zone limitrofe', '0-3km', 25.00, '#10B981', true, NOW(), NOW()),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Zona B - Periferia', 'Zone periferiche della città', '3-10km', 40.00, '#6366F1', true, NOW(), NOW()),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Zona C - Extra', 'Comuni esterni', '10km+', 55.00, '#EF4444', true, NOW(), NOW());

-- 2. BUS PER RAVENNA
INSERT INTO "Bus" (id, "organizationId", name, capacity, "plateNumber", "driverName", "driverPhone", notes, "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Pullman A', 40, 'RA 789 EF', 'Carlo Bianchi', '333-3333333', 'Linea principale', true, NOW(), NOW()),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Pullman B', 35, 'RA 012 GH', 'Luigi Neri', '333-4444444', 'Linea secondaria', true, NOW(), NOW()),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Minibus C', 20, 'RA 345 IL', 'Paolo Gialli', '333-5555555', 'Per gruppi piccoli', true, NOW(), NOW());

-- 3. TIPI DI DOCUMENTI
DO $$
DECLARE
  org_demo UUID := 'c84fcaaf-4e94-4f42-b901-a080c1f2280e';
  org_ravenna UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
BEGIN
  -- Documenti per Demo
  INSERT INTO "DocumentType" (id, "organizationId", name, category, description, "isRequired", "validityDays", "createdAt", "updatedAt")
  VALUES
    (1000, org_demo, 'Certificato Medico Sportivo', 'medical', 'Certificato medico per attività sportiva agonistica', true, 365, NOW(), NOW()),
    (1001, org_demo, 'Carta Identità', 'identity', 'Documento di identità', true, 3650, NOW(), NOW()),
    (1002, org_demo, 'Modulo Privacy', 'privacy', 'Consenso trattamento dati personali', true, null, NOW(), NOW()),
    (1003, org_demo, 'Foto Tessera', 'photo', 'Foto formato tessera', true, null, NOW(), NOW())
  ON CONFLICT DO NOTHING;

  -- Documenti per Ravenna
  INSERT INTO "DocumentType" (id, "organizationId", name, category, description, "isRequired", "validityDays", "createdAt", "updatedAt")
  VALUES
    (2000, org_ravenna, 'Certificato Medico Sportivo', 'medical', 'Certificato medico per attività sportiva agonistica', true, 365, NOW(), NOW()),
    (2001, org_ravenna, 'Carta Identità', 'identity', 'Documento di identità', true, 3650, NOW(), NOW()),
    (2002, org_ravenna, 'Modulo Privacy', 'privacy', 'Consenso trattamento dati personali', true, null, NOW(), NOW()),
    (2003, org_ravenna, 'Tesserino FIGC', 'federation', 'Tesserino federale', false, 365, NOW(), NOW())
  ON CONFLICT DO NOTHING;
END $$;

-- 4. TIPI DI PAGAMENTO
INSERT INTO "PaymentType" (id, "organizationId", name, description, amount, "recurrence", "dueDay", "isActive", "createdAt", "updatedAt")
VALUES
  -- Demo
  (3000, 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Quota Iscrizione', 'Quota annuale di iscrizione', 150.00, 'ONCE', null, true, NOW(), NOW()),
  (3001, 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Retta Mensile', 'Quota mensile attività', 80.00, 'MONTHLY', 10, true, NOW(), NOW()),
  (3002, 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Kit Gara', 'Divisa ufficiale', 120.00, 'ONCE', null, true, NOW(), NOW()),
  -- Ravenna
  (4000, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Quota Iscrizione', 'Quota annuale di iscrizione', 200.00, 'ONCE', null, true, NOW(), NOW()),
  (4001, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Retta Trimestrale', 'Quota trimestrale attività', 250.00, 'QUARTERLY', 5, true, NOW(), NOW()),
  (4002, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Trasporto', 'Servizio trasporto mensile', 0.00, 'MONTHLY', 15, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 5. DOCUMENTI PER ALCUNI ATLETI (con scadenze varie)
DO $$
DECLARE
  doc_type_medical_demo INT := 1000;
  doc_type_medical_ravenna INT := 2000;
  athlete_rec RECORD;
  counter INT := 0;
BEGIN
  -- Documenti per i primi 10 atleti di Demo
  FOR athlete_rec IN 
    SELECT id, "organizationId" FROM "Athlete" 
    WHERE "organizationId" = 'c84fcaaf-4e94-4f42-b901-a080c1f2280e' 
    LIMIT 10
  LOOP
    counter := counter + 1;
    -- Certificato medico con scadenze diverse
    INSERT INTO "Document" (id, "athleteId", "documentTypeId", "uploadDate", "expiryDate", status, "fileUrl", "uploadedById", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      athlete_rec.id,
      doc_type_medical_demo,
      NOW() - INTERVAL '3 months',
      CASE 
        WHEN counter <= 3 THEN NOW() + INTERVAL '10 days'  -- In scadenza
        WHEN counter <= 6 THEN NOW() + INTERVAL '45 days'  -- Prossima scadenza
        ELSE NOW() + INTERVAL '6 months'  -- Valido a lungo
      END,
      CASE 
        WHEN counter <= 3 THEN 'EXPIRING'
        ELSE 'VALID'
      END,
      'https://demo-storage.com/docs/medical/' || athlete_rec.id || '.pdf',
      (SELECT id FROM "User" WHERE "organizationId" = athlete_rec."organizationId" LIMIT 1),
      NOW(),
      NOW()
    );
  END LOOP;

  -- Documenti per i primi 10 atleti di Ravenna
  counter := 0;
  FOR athlete_rec IN 
    SELECT id, "organizationId" FROM "Athlete" 
    WHERE "organizationId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' 
    LIMIT 10
  LOOP
    counter := counter + 1;
    -- Certificato medico
    INSERT INTO "Document" (id, "athleteId", "documentTypeId", "uploadDate", "expiryDate", status, "fileUrl", "uploadedById", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      athlete_rec.id,
      doc_type_medical_ravenna,
      NOW() - INTERVAL '2 months',
      CASE 
        WHEN counter <= 4 THEN NOW() + INTERVAL '20 days'  -- In scadenza
        ELSE NOW() + INTERVAL '8 months'  -- Valido
      END,
      CASE 
        WHEN counter <= 4 THEN 'EXPIRING'
        ELSE 'VALID'
      END,
      'https://ravenna-storage.com/docs/medical/' || athlete_rec.id || '.pdf',
      (SELECT id FROM "User" WHERE "organizationId" = athlete_rec."organizationId" LIMIT 1),
      NOW(),
      NOW()
    );
  END LOOP;
END $$;

-- 6. PAGAMENTI (alcuni scaduti, alcuni in sospeso)
DO $$
DECLARE
  payment_type_rec RECORD;
  athlete_rec RECORD;
  counter INT := 0;
BEGIN
  -- Pagamenti per Demo
  FOR athlete_rec IN 
    SELECT id FROM "Athlete" 
    WHERE "organizationId" = 'c84fcaaf-4e94-4f42-b901-a080c1f2280e' 
    LIMIT 15
  LOOP
    counter := counter + 1;
    -- Quota iscrizione
    INSERT INTO "Payment" (id, "athleteId", "paymentTypeId", amount, "dueDate", "paidDate", status, "paymentMethod", notes, "createdById", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      athlete_rec.id,
      3000, -- Quota iscrizione Demo
      150.00,
      NOW() - INTERVAL '2 months',
      CASE WHEN counter > 5 THEN NOW() - INTERVAL '1 month' ELSE NULL END,
      CASE WHEN counter > 5 THEN 'PAID' ELSE 'PENDING' END,
      CASE WHEN counter > 5 THEN 'BANK_TRANSFER' ELSE NULL END,
      CASE WHEN counter <= 5 THEN 'Sollecito inviato' ELSE 'Pagato regolarmente' END,
      (SELECT id FROM "User" WHERE "organizationId" = 'c84fcaaf-4e94-4f42-b901-a080c1f2280e' LIMIT 1),
      NOW(),
      NOW()
    );
    
    -- Retta mensile
    IF counter <= 8 THEN
      INSERT INTO "Payment" (id, "athleteId", "paymentTypeId", amount, "dueDate", "paidDate", status, "paymentMethod", "createdById", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        athlete_rec.id,
        3001, -- Retta mensile Demo
        80.00,
        NOW() + INTERVAL '5 days',
        NULL,
        'PENDING',
        NULL,
        (SELECT id FROM "User" WHERE "organizationId" = 'c84fcaaf-4e94-4f42-b901-a080c1f2280e' LIMIT 1),
        NOW(),
        NOW()
      );
    END IF;
  END LOOP;
END $$;

-- 7. POSIZIONI PER RAVENNA
INSERT INTO "Position" (id, "organizationId", name, description, "sortOrder", "isActive", "createdAt", "updatedAt")
SELECT 
  id + 100,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name,
  description,
  "sortOrder",
  "isActive",
  NOW(),
  NOW()
FROM "Position" 
WHERE "organizationId" = 'c84fcaaf-4e94-4f42-b901-a080c1f2280e'
ON CONFLICT DO NOTHING;

-- 8. VENUES (CAMPI DA GIOCO)
INSERT INTO "Venue" (id, "organizationId", name, address, city, province, "postalCode", latitude, longitude, "fieldType", capacity, "hasLighting", notes, "isActive", "createdAt", "updatedAt")
VALUES
  -- Demo
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Campo Principale', 'Via dello Sport 123', 'Milano', 'MI', '20100', 45.4642, 9.1900, 'GRASS', 500, true, 'Campo principale con tribune', true, NOW(), NOW()),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Campo B', 'Via dello Sport 123', 'Milano', 'MI', '20100', 45.4640, 9.1898, 'SYNTHETIC', 200, true, 'Campo sintetico per allenamenti', true, NOW(), NOW()),
  -- Ravenna
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Stadio Benelli', 'Via della Lirica 21', 'Ravenna', 'RA', '48121', 44.4184, 12.2036, 'GRASS', 4000, true, 'Stadio principale', true, NOW(), NOW()),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Centro Sportivo', 'Via Romea Sud 220', 'Ravenna', 'RA', '48124', 44.3857, 12.2143, 'SYNTHETIC', 300, true, 'Centro di allenamento', true, NOW(), NOW());

-- 9. STAFF MEMBERS
DO $$
DECLARE
  team_rec RECORD;
  pos_portiere INT;
  pos_difensore INT;
BEGIN
  -- Staff per alcune squadre Demo
  FOR team_rec IN 
    SELECT id, "organizationId" FROM "Team" 
    WHERE "organizationId" = 'c84fcaaf-4e94-4f42-b901-a080c1f2280e' 
    LIMIT 2
  LOOP
    INSERT INTO "StaffMember" (id, "organizationId", "teamId", "firstName", "lastName", role, email, phone, "licenseNumber", "licenseExpiry", "isActive", "createdAt", "updatedAt")
    VALUES
      (gen_random_uuid(), team_rec."organizationId", team_rec.id, 'Giuseppe', 'Verdi', 'HEAD_COACH', 'g.verdi@demo.com', '333-9999991', 'UEFA-B-12345', '2026-12-31', true, NOW(), NOW()),
      (gen_random_uuid(), team_rec."organizationId", team_rec.id, 'Mario', 'Bianchi', 'ASSISTANT_COACH', 'm.bianchi@demo.com', '333-9999992', 'FIGC-C-67890', '2025-06-30', true, NOW(), NOW());
  END LOOP;

  -- Staff per alcune squadre Ravenna
  FOR team_rec IN 
    SELECT id, "organizationId" FROM "Team" 
    WHERE "organizationId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' 
    LIMIT 2
  LOOP
    INSERT INTO "StaffMember" (id, "organizationId", "teamId", "firstName", "lastName", role, email, phone, "licenseNumber", "licenseExpiry", "isActive", "createdAt", "updatedAt")
    VALUES
      (gen_random_uuid(), team_rec."organizationId", team_rec.id, 'Roberto', 'Mancini', 'HEAD_COACH', 'r.mancini@ravenna.com', '333-8888881', 'UEFA-A-54321', '2027-12-31', true, NOW(), NOW()),
      (gen_random_uuid(), team_rec."organizationId", team_rec.id, 'Luca', 'Toni', 'GOALKEEPER_COACH', 'l.toni@ravenna.com', '333-8888882', 'FIGC-GK-11111', '2026-03-31', true, NOW(), NOW());
  END LOOP;
END $$;

-- 10. SPONSOR
INSERT INTO "Sponsor" (id, "organizationId", name, "contactPerson", email, phone, website, "logoUrl", "contractStart", "contractEnd", amount, notes, "isActive", "createdAt", "updatedAt")
VALUES
  -- Demo
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Banca Locale Milano', 'Giovanni Rossi', 'g.rossi@bancalocale.it', '02-1234567', 'www.bancalocale.it', 'https://logo.bancalocale.it', '2024-07-01', '2025-06-30', 15000.00, 'Sponsor principale maglia', true, NOW(), NOW()),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Pizzeria Da Mario', 'Mario Verdi', 'info@pizzeriadamario.it', '02-7654321', 'www.pizzeriadamario.it', null, '2024-09-01', '2025-08-31', 5000.00, 'Sponsor cartellonistica', true, NOW(), NOW()),
  -- Ravenna
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cassa di Risparmio Ravenna', 'Paolo Bianchi', 'p.bianchi@cariravenna.it', '0544-123456', 'www.cariravenna.it', 'https://logo.cariravenna.it', '2024-08-01', '2026-07-31', 25000.00, 'Main sponsor biennale', true, NOW(), NOW()),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Supermercati Conad', 'Laura Neri', 'l.neri@conad.it', '0544-654321', 'www.conad.it', 'https://logo.conad.it', '2025-01-01', '2025-12-31', 10000.00, 'Sponsor settore giovanile', true, NOW(), NOW());

-- 11. ALCUNE PARTITE
DO $$
DECLARE
  venue_demo UUID;
  venue_ravenna UUID;
  team_demo UUID;
  team_ravenna UUID;
BEGIN
  -- Prendi venue e team
  SELECT id INTO venue_demo FROM "Venue" WHERE "organizationId" = 'c84fcaaf-4e94-4f42-b901-a080c1f2280e' LIMIT 1;
  SELECT id INTO venue_ravenna FROM "Venue" WHERE "organizationId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' LIMIT 1;
  SELECT id INTO team_demo FROM "Team" WHERE "organizationId" = 'c84fcaaf-4e94-4f42-b901-a080c1f2280e' AND name = 'Prima Squadra' LIMIT 1;
  SELECT id INTO team_ravenna FROM "Team" WHERE "organizationId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND name = 'Juniores U19' LIMIT 1;

  -- Partite per Demo
  INSERT INTO "Match" (id, "organizationId", "competitionId", "homeTeamId", "awayTeamId", "venueId", date, time, status, "homeScore", "awayScore", round, notes, "createdAt", "updatedAt")
  VALUES
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', null, team_demo, null, venue_demo, NOW() + INTERVAL '7 days', '15:00', 'SCHEDULED', null, null, '1', 'Campionato - Giornata 1', NOW(), NOW()),
    (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', null, team_demo, null, venue_demo, NOW() - INTERVAL '7 days', '15:00', 'COMPLETED', 2, 1, '1', 'Vittoria importante', NOW(), NOW());

  -- Partite per Ravenna
  INSERT INTO "Match" (id, "organizationId", "competitionId", "homeTeamId", "awayTeamId", "venueId", date, time, status, "homeScore", "awayScore", round, notes, "createdAt", "updatedAt")
  VALUES
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', null, team_ravenna, null, venue_ravenna, NOW() + INTERVAL '14 days', '20:30', 'SCHEDULED', null, null, '2', 'Coppa Italia - Ottavi', NOW(), NOW()),
    (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', null, null, team_ravenna, venue_ravenna, NOW() + INTERVAL '21 days', '15:00', 'SCHEDULED', null, null, '3', 'Trasferta importante', NOW(), NOW());
END $$;

-- 12. NOTIFICHE DI ESEMPIO
INSERT INTO "Notification" (id, "organizationId", "userId", type, severity, title, message, "relatedEntityType", "relatedEntityId", "isRead", "readAt", "createdAt")
VALUES
  -- Demo
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', null, 'document_expiry', 'warning', 'Documenti in scadenza', '5 atleti hanno documenti in scadenza nei prossimi 30 giorni', 'document', null, false, null, NOW()),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', null, 'payment_overdue', 'error', 'Pagamenti scaduti', '3 pagamenti risultano scaduti', 'payment', null, false, null, NOW()),
  -- Ravenna
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', null, 'match_scheduled', 'info', 'Nuova partita programmata', 'Partita di coppa programmata per il 19 agosto', 'match', null, false, null, NOW()),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', null, 'document_expiry', 'warning', 'Certificati medici in scadenza', '4 atleti devono rinnovare il certificato medico', 'document', null, false, null, NOW());

-- RIEPILOGO FINALE
SELECT 'RIEPILOGO POPOLAMENTO DATABASE' as info;
SELECT '==============================' as info;

SELECT 
  'Organizzazioni' as tipo,
  COUNT(*) as totale
FROM "Organization"
UNION ALL
SELECT 'Squadre', COUNT(*) FROM "Team"
UNION ALL
SELECT 'Atleti', COUNT(*) FROM "Athlete"
UNION ALL
SELECT 'Utenti', COUNT(*) FROM "User"
UNION ALL
SELECT 'Zone Trasporto', COUNT(*) FROM "TransportZone"
UNION ALL
SELECT 'Bus', COUNT(*) FROM "Bus"
UNION ALL
SELECT 'Documenti', COUNT(*) FROM "Document"
UNION ALL
SELECT 'Pagamenti', COUNT(*) FROM "Payment"
UNION ALL
SELECT 'Staff', COUNT(*) FROM "StaffMember"
UNION ALL
SELECT 'Sponsor', COUNT(*) FROM "Sponsor"
UNION ALL
SELECT 'Campi', COUNT(*) FROM "Venue"
UNION ALL
SELECT 'Partite', COUNT(*) FROM "Match"
UNION ALL
SELECT 'Notifiche', COUNT(*) FROM "Notification"
ORDER BY tipo;
