-- Test inserimento singolo atleta con tutti i campi necessari
-- Prima vediamo la struttura della tabella
\d "Athlete"

-- Poi proviamo un inserimento minimo
INSERT INTO "Athlete" (
    id,
    "organizationId",
    "firstName",
    "lastName",
    "birthDate",
    status,
    "createdAt"
) VALUES (
    gen_random_uuid(),
    'c84fcaaf-4e94-4f42-b901-a080c1f2280e',
    'Test',
    'Prova',
    '2010-01-01',
    'ACTIVE',
    CURRENT_TIMESTAMP
);

-- Verifica
SELECT COUNT(*) FROM "Athlete";
