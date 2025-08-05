-- MIGRAZIONI PER AGGIUNGERE I CAMPI MANCANTI ALLE TABELLE

-- 1. DocumentType - aggiungere campo description
ALTER TABLE "DocumentType" 
ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. PaymentType - aggiungere campi mancanti
ALTER TABLE "PaymentType" 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS recurrence TEXT,
ADD COLUMN IF NOT EXISTS "dueDay" INTEGER;

-- 3. Document - aggiungere uploadDate
ALTER TABLE "Document" 
ADD COLUMN IF NOT EXISTS "uploadDate" DATE;

-- Popola uploadDate con createdAt per i record esistenti
UPDATE "Document" SET "uploadDate" = "createdAt"::date WHERE "uploadDate" IS NULL;

-- 4. Venue - aggiungere campi mancanti
ALTER TABLE "Venue" 
ADD COLUMN IF NOT EXISTS province VARCHAR(2),
ADD COLUMN IF NOT EXISTS "postalCode" VARCHAR(5),
ADD COLUMN IF NOT EXISTS "fieldType" TEXT,
ADD COLUMN IF NOT EXISTS "hasLighting" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 5. StaffMember - aggiungere campi per licenze
ALTER TABLE "StaffMember" 
ADD COLUMN IF NOT EXISTS "licenseNumber" TEXT,
ADD COLUMN IF NOT EXISTS "licenseExpiry" DATE;

-- 6. Sponsor - aggiungere campi mancanti
ALTER TABLE "Sponsor" 
ADD COLUMN IF NOT EXISTS "contactPerson" TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS "contractStart" DATE,
ADD COLUMN IF NOT EXISTS "contractEnd" DATE,
ADD COLUMN IF NOT EXISTS amount NUMERIC(10,2);

-- 7. Match - aggiungere campo round
ALTER TABLE "Match" 
ADD COLUMN IF NOT EXISTS round TEXT;

-- 8. Notification - aggiungere readAt
ALTER TABLE "Notification" 
ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMP(3);

-- Verifica delle modifiche
SELECT 'DocumentType' as tabella, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'DocumentType' AND column_name = 'description'
UNION ALL
SELECT 'PaymentType', column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'PaymentType' AND column_name IN ('description', 'recurrence', 'dueDay')
UNION ALL
SELECT 'Document', column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Document' AND column_name = 'uploadDate'
UNION ALL
SELECT 'Venue', column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Venue' AND column_name IN ('province', 'fieldType')
UNION ALL
SELECT 'StaffMember', column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'StaffMember' AND column_name = 'licenseNumber'
UNION ALL
SELECT 'Sponsor', column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Sponsor' AND column_name = 'contactPerson'
UNION ALL
SELECT 'Match', column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Match' AND column_name = 'round'
UNION ALL
SELECT 'Notification', column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Notification' AND column_name = 'readAt';
