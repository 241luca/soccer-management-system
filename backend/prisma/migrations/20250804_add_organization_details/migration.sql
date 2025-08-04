-- Aggiungi campi dettagliati all'anagrafica della società
ALTER TABLE "Organization" 
ADD COLUMN IF NOT EXISTS "fullName" TEXT,
ADD COLUMN IF NOT EXISTS "address" TEXT,
ADD COLUMN IF NOT EXISTS "city" TEXT,
ADD COLUMN IF NOT EXISTS "province" VARCHAR(2),
ADD COLUMN IF NOT EXISTS "postalCode" VARCHAR(5),
ADD COLUMN IF NOT EXISTS "country" VARCHAR(2) DEFAULT 'IT',
ADD COLUMN IF NOT EXISTS "phone" TEXT,
ADD COLUMN IF NOT EXISTS "email" TEXT,
ADD COLUMN IF NOT EXISTS "website" TEXT,
ADD COLUMN IF NOT EXISTS "fiscalCode" TEXT,
ADD COLUMN IF NOT EXISTS "vatNumber" TEXT,
ADD COLUMN IF NOT EXISTS "foundedYear" INTEGER,
ADD COLUMN IF NOT EXISTS "federationNumber" TEXT,
ADD COLUMN IF NOT EXISTS "iban" TEXT,
ADD COLUMN IF NOT EXISTS "bankName" TEXT,
ADD COLUMN IF NOT EXISTS "primaryColor" VARCHAR(7) DEFAULT '#3B82F6',
ADD COLUMN IF NOT EXISTS "secondaryColor" VARCHAR(7) DEFAULT '#1E40AF',
ADD COLUMN IF NOT EXISTS "description" TEXT,
ADD COLUMN IF NOT EXISTS "presidentName" TEXT,
ADD COLUMN IF NOT EXISTS "presidentEmail" TEXT,
ADD COLUMN IF NOT EXISTS "presidentPhone" TEXT,
ADD COLUMN IF NOT EXISTS "secretaryName" TEXT,
ADD COLUMN IF NOT EXISTS "secretaryEmail" TEXT,
ADD COLUMN IF NOT EXISTS "secretaryPhone" TEXT,
ADD COLUMN IF NOT EXISTS "socialFacebook" TEXT,
ADD COLUMN IF NOT EXISTS "socialInstagram" TEXT,
ADD COLUMN IF NOT EXISTS "socialTwitter" TEXT,
ADD COLUMN IF NOT EXISTS "socialYoutube" TEXT;

-- Aggiungi indici per migliorare le performance
CREATE INDEX IF NOT EXISTS "Organization_fiscalCode_idx" ON "Organization"("fiscalCode");
CREATE INDEX IF NOT EXISTS "Organization_vatNumber_idx" ON "Organization"("vatNumber");
CREATE INDEX IF NOT EXISTS "Organization_federationNumber_idx" ON "Organization"("federationNumber");
