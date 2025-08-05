-- POPOLAMENTO CORRETTO - VERSIONE FINALE

-- 1. PULIZIA DUPLICATI E PREPARAZIONE
DELETE FROM "Document";
DELETE FROM "Payment";

-- 2. TIPI DI DOCUMENTI (con validityDays obbligatorio)
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
    (1002, org_demo, 'Modulo Privacy', 'privacy', 'Consenso trattamento dati personali', true, 9999, NOW(), NOW()), -- validityDays alto per doc senza scadenza
    (1003, org_demo, 'Foto Tessera', 'photo', 'Foto formato tessera', true, 9999, NOW(), NOW())
  ON CONFLICT DO NOTHING;

  -- Documenti per Ravenna
  INSERT INTO "DocumentType" (id, "organizationId", name, category, description, "isRequired", "validityDays", "createdAt", "updatedAt")
  VALUES
    (2000, org_ravenna, 'Certificato Medico Sportivo', 'medical', 'Certificato medico per attività sportiva agonistica', true, 365, NOW(), NOW()),
    (2001, org_ravenna, 'Carta Identità', 'identity', 'Documento di identità', true, 3650, NOW(), NOW()),
    (2002, org_ravenna, 'Modulo Privacy', 'privacy', 'Consenso trattamento dati personali', true, 9999, NOW(), NOW()),
    (2003, org_ravenna, 'Tesserino FIGC', 'federation', 'Tesserino federale', false, 365, NOW(), NOW())
  ON CONFLICT DO NOTHING;
END $$;

-- 3. TIPI DI PAGAMENTO (con category obbligatorio)
INSERT INTO "PaymentType" (id, "organizationId", name, category, description, amount, "isRecurring", frequency, recurrence, "dueDay", "isActive", "createdAt", "updatedAt")
VALUES
  -- Demo
  (3000, 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Quota Iscrizione', 'registration', 'Quota annuale di iscrizione', 150.00, false, null, 'ONCE', null, true, NOW(), NOW()),
  (3001, 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Retta Mensile', 'monthly_fee', 'Quota mensile attività', 80.00, true, 'monthly', 'MONTHLY', 10, true, NOW(), NOW()),
  (3002, 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Kit Gara', 'equipment', 'Divisa ufficiale', 120.00, false, null, 'ONCE', null, true, NOW(), NOW()),
  -- Ravenna
  (4000, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Quota Iscrizione', 'registration', 'Quota annuale di iscrizione', 200.00, false, null, 'ONCE', null, true, NOW(), NOW()),
  (4001, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Retta Trimestrale', 'quarterly_fee', 'Quota trimestrale attività', 250.00, true, 'quarterly', 'QUARTERLY', 5, true, NOW(), NOW()),
  (4002, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Trasporto', 'transport', 'Servizio trasporto mensile', 0.00, true, 'monthly', 'MONTHLY', 15, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 4. DOCUMENTI PER ATLETI (con cast corretto per ENUM)
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
    INSERT INTO "Document" (id, "athleteId", "documentTypeId", "uploadDate", "issueDate", "expiryDate", status, "fileUrl", "uploadedById", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      athlete_rec.id,
      doc_type_medical_demo,
      NOW() - INTERVAL '3 months',
      NOW() - INTERVAL '3 months',
      CASE 
        WHEN counter <= 3 THEN NOW() + INTERVAL '10 days'  -- In scadenza
        WHEN counter <= 6 THEN NOW() + INTERVAL '45 days'  -- Prossima scadenza
        ELSE NOW() + INTERVAL '6 months'  -- Valido a lungo
      END,
      CASE 
        WHEN counter <= 3 THEN 'EXPIRING'::"DocumentStatus"
        ELSE 'VALID'::"DocumentStatus"
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
    INSERT INTO "Document" (id, "athleteId", "documentTypeId", "uploadDate", "issueDate", "expiryDate", status, "fileUrl", "uploadedById", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      athlete_rec.id,
      doc_type_medical_ravenna,
      NOW() - INTERVAL '2 months',
      NOW() - INTERVAL '2 months',
      CASE 
        WHEN counter <= 4 THEN NOW() + INTERVAL '20 days'  -- In scadenza
        ELSE NOW() + INTERVAL '8 months'  -- Valido
      END,
      CASE 
        WHEN counter <= 4 THEN 'EXPIRING'::"DocumentStatus"
        ELSE 'VALID'::"DocumentStatus"
      END,
      'https://ravenna-storage.com/docs/medical/' || athlete_rec.id || '.pdf',
      (SELECT id FROM "User" WHERE "organizationId" = athlete_rec."organizationId" LIMIT 1),
      NOW(),
      NOW()
    );
  END LOOP;
END $$;

-- 5. PAGAMENTI (con cast corretto per ENUM e organizationId)
DO $$
DECLARE
  payment_type_rec RECORD;
  athlete_rec RECORD;
  counter INT := 0;
BEGIN
  -- Pagamenti per Demo
  FOR athlete_rec IN 
    SELECT id, "organizationId" FROM "Athlete" 
    WHERE "organizationId" = 'c84fcaaf-4e94-4f42-b901-a080c1f2280e' 
    LIMIT 15
  LOOP
    counter := counter + 1;
    -- Quota iscrizione
    INSERT INTO "Payment" (id, "organizationId", "athleteId", "paymentTypeId", amount, "dueDate", "paidDate", status, "paymentMethod", notes, "createdById", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      athlete_rec."organizationId",
      athlete_rec.id,
      3000, -- Quota iscrizione Demo
      150.00,
      NOW() - INTERVAL '2 months',
      CASE WHEN counter > 5 THEN NOW() - INTERVAL '1 month' ELSE NULL END,
      CASE WHEN counter > 5 THEN 'PAID'::"PaymentStatus" ELSE 'PENDING'::"PaymentStatus" END,
      CASE WHEN counter > 5 THEN 'BANK_TRANSFER' ELSE NULL END,
      CASE WHEN counter <= 5 THEN 'Sollecito inviato' ELSE 'Pagato regolarmente' END,
      (SELECT id FROM "User" WHERE "organizationId" = athlete_rec."organizationId" LIMIT 1),
      NOW(),
      NOW()
    );
    
    -- Retta mensile per alcuni
    IF counter <= 8 THEN
      INSERT INTO "Payment" (id, "organizationId", "athleteId", "paymentTypeId", amount, "dueDate", "paidDate", status, "paymentMethod", "createdById", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        athlete_rec."organizationId",
        athlete_rec.id,
        3001, -- Retta mensile Demo
        80.00,
        NOW() + INTERVAL '5 days',
        NULL,
        'PENDING'::"PaymentStatus",
        NULL,
        (SELECT id FROM "User" WHERE "organizationId" = athlete_rec."organizationId" LIMIT 1),
        NOW(),
        NOW()
      );
    END IF;
  END LOOP;
END $$;

-- 6. VENUES (con ID numerico sequenziale)
INSERT INTO "Venue" (id, "organizationId", name, address, city, province, "postalCode", "surfaceType", capacity, "fieldType", "hasLighting", notes, "isActive", "createdAt", "updatedAt")
VALUES
  -- Demo
  (nextval('"Venue_id_seq"'), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Campo Principale', 'Via dello Sport 123', 'Milano', 'MI', '20100', 'grass', 500, 'GRASS', true, 'Campo principale con tribune', true, NOW(), NOW()),
  (nextval('"Venue_id_seq"'), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Campo B', 'Via dello Sport 123', 'Milano', 'MI', '20100', 'synthetic', 200, 'SYNTHETIC', true, 'Campo sintetico per allenamenti', true, NOW(), NOW()),
  -- Ravenna
  (nextval('"Venue_id_seq"'), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Stadio Benelli', 'Via della Lirica 21', 'Ravenna', 'RA', '48121', 'grass', 4000, 'GRASS', true, 'Stadio principale', true, NOW(), NOW()),
  (nextval('"Venue_id_seq"'), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Centro Sportivo', 'Via Romea Sud 220', 'Ravenna', 'RA', '48124', 'synthetic', 300, 'SYNTHETIC', true, 'Centro di allenamento', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 7. STAFF (già inseriti, skip duplicati)
-- Verifico prima quanti ce ne sono
SELECT COUNT(*) as staff_esistenti FROM "StaffMember";

-- 8. SPONSOR (con sponsorType obbligatorio)
INSERT INTO "Sponsor" (id, "organizationId", name, "sponsorType", "contactPerson", email, phone, website, "logoUrl", "contractStart", "contractEnd", amount, notes, "isActive", "createdAt", "updatedAt")
VALUES
  -- Demo
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Banca Locale Milano', 'main', 'Giovanni Rossi', 'g.rossi@bancalocale.it', '02-1234567', 'www.bancalocale.it', 'https://logo.bancalocale.it', '2024-07-01', '2025-06-30', 15000.00, 'Sponsor principale maglia', true, NOW(), NOW()),
  (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', 'Pizzeria Da Mario', 'secondary', 'Mario Verdi', 'info@pizzeriadamario.it', '02-7654321', 'www.pizzeriadamario.it', null, '2024-09-01', '2025-08-31', 5000.00, 'Sponsor cartellonistica', true, NOW(), NOW()),
  -- Ravenna
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cassa di Risparmio Ravenna', 'main', 'Paolo Bianchi', 'p.bianchi@cariravenna.it', '0544-123456', 'www.cariravenna.it', 'https://logo.cariravenna.it', '2024-08-01', '2026-07-31', 25000.00, 'Main sponsor biennale', true, NOW(), NOW()),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Supermercati Conad', 'secondary', 'Laura Neri', 'l.neri@conad.it', '0544-654321', 'www.conad.it', 'https://logo.conad.it', '2025-01-01', '2025-12-31', 10000.00, 'Sponsor settore giovanile', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 9. PARTITE (con venueId corretto)
DO $$
DECLARE
  venue_demo INT;
  venue_ravenna INT;
  team_demo UUID;
  team_ravenna UUID;
BEGIN
  -- Prendi venue e team
  SELECT id INTO venue_demo FROM "Venue" WHERE "organizationId" = 'c84fcaaf-4e94-4f42-b901-a080c1f2280e' LIMIT 1;
  SELECT id INTO venue_ravenna FROM "Venue" WHERE "organizationId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' LIMIT 1;
  SELECT id INTO team_demo FROM "Team" WHERE "organizationId" = 'c84fcaaf-4e94-4f42-b901-a080c1f2280e' AND name = 'Prima Squadra' LIMIT 1;
  SELECT id INTO team_ravenna FROM "Team" WHERE "organizationId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND name = 'Juniores U19' LIMIT 1;

  -- Partite per Demo (con awayTeamId fittizio per evitare null)
  IF team_demo IS NOT NULL AND venue_demo IS NOT NULL THEN
    INSERT INTO "Match" (id, "organizationId", "competitionId", "homeTeamId", "awayTeamId", "venueId", date, time, status, "homeScore", "awayScore", round, notes, "createdAt", "updatedAt")
    VALUES
      (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', null, team_demo, team_demo, venue_demo, NOW() + INTERVAL '7 days', '15:00', 'SCHEDULED'::"MatchStatus", null, null, '1', 'Campionato - Giornata 1', NOW(), NOW()),
      (gen_random_uuid(), 'c84fcaaf-4e94-4f42-b901-a080c1f2280e', null, team_demo, team_demo, venue_demo, NOW() - INTERVAL '7 days', '15:00', 'COMPLETED'::"MatchStatus", 2, 1, '1', 'Vittoria importante', NOW(), NOW());
  END IF;

  -- Partite per Ravenna
  IF team_ravenna IS NOT NULL AND venue_ravenna IS NOT NULL THEN
    INSERT INTO "Match" (id, "organizationId", "competitionId", "homeTeamId", "awayTeamId", "venueId", date, time, status, "homeScore", "awayScore", round, notes, "createdAt", "updatedAt")
    VALUES
      (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', null, team_ravenna, team_ravenna, venue_ravenna, NOW() + INTERVAL '14 days', '20:30', 'SCHEDULED'::"MatchStatus", null, null, '2', 'Coppa Italia - Ottavi', NOW(), NOW()),
      (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', null, team_ravenna, team_ravenna, venue_ravenna, NOW() + INTERVAL '21 days', '15:00', 'SCHEDULED'::"MatchStatus", null, null, '3', 'Trasferta importante', NOW(), NOW());
  END IF;
END $$;

-- RIEPILOGO FINALE
SELECT 'POPOLAMENTO COMPLETATO!' as info;
SELECT '======================' as info;

SELECT 
  'Organizzazioni: ' || COUNT(*) as conteggio
FROM "Organization"
UNION ALL
SELECT 'Squadre: ' || COUNT(*) FROM "Team"
UNION ALL
SELECT 'Atleti: ' || COUNT(*) FROM "Athlete"
UNION ALL
SELECT 'Documenti: ' || COUNT(*) FROM "Document"
UNION ALL
SELECT 'Pagamenti: ' || COUNT(*) FROM "Payment"
UNION ALL
SELECT 'Sponsor: ' || COUNT(*) FROM "Sponsor"
UNION ALL
SELECT 'Campi: ' || COUNT(*) FROM "Venue"
UNION ALL
SELECT 'Partite: ' || COUNT(*) FROM "Match"
ORDER BY conteggio;
