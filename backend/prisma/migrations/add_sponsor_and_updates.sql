-- Aggiungi compenso allo Staff
ALTER TABLE "StaffMember" ADD COLUMN "salary" DECIMAL(10, 2);
ALTER TABLE "StaffMember" ADD COLUMN "contractType" TEXT; -- full-time, part-time, volunteer, consultant
ALTER TABLE "StaffMember" ADD COLUMN "paymentFrequency" TEXT; -- monthly, weekly, hourly, per-event

-- Aggiungi link shop alle Maglie
ALTER TABLE "TeamKit" ADD COLUMN "shopUrl" TEXT;
ALTER TABLE "TeamKit" ADD COLUMN "merchandiseUrl" TEXT;
ALTER TABLE "TeamKit" ADD COLUMN "price" DECIMAL(10, 2);
ALTER TABLE "TeamKit" ADD COLUMN "availableSizes" TEXT[];

-- Crea tabella Sponsor
CREATE TABLE "Sponsor" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "logoUrl" TEXT,
  "website" TEXT,
  "contactName" TEXT,
  "contactEmail" TEXT,
  "contactPhone" TEXT,
  "sponsorType" TEXT NOT NULL, -- main, technical, gold, silver, bronze, partner
  "contractStartDate" DATE,
  "contractEndDate" DATE,
  "annualAmount" DECIMAL(10, 2),
  "description" TEXT,
  "visibility" TEXT[], -- jersey, website, stadium, materials, events
  "notes" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);

-- Aggiungi foreign key
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Crea indici
CREATE INDEX "Sponsor_organizationId_idx" ON "Sponsor"("organizationId");
CREATE INDEX "Sponsor_sponsorType_idx" ON "Sponsor"("sponsorType");
CREATE INDEX "Sponsor_contractEndDate_idx" ON "Sponsor"("contractEndDate");
