-- Aggiungi tabelle per Maglie, Staff e Documenti Aziendali

-- Tabella per le maglie/kit delle squadre
CREATE TABLE "TeamKit" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "organizationId" TEXT NOT NULL,
  "teamId" TEXT,
  "season" TEXT NOT NULL,
  "kitType" TEXT NOT NULL, -- home, away, third, goalkeeper
  "primaryColor" TEXT NOT NULL,
  "secondaryColor" TEXT,
  "tertiaryColor" TEXT,
  "pattern" TEXT, -- solid, stripes, hoops, etc
  "manufacturer" TEXT,
  "sponsor" TEXT,
  "imageUrl" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "TeamKit_pkey" PRIMARY KEY ("id")
);

-- Tabella per lo staff tecnico e dirigenziale
CREATE TABLE "StaffMember" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "organizationId" TEXT NOT NULL,
  "teamId" TEXT,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "role" TEXT NOT NULL, -- coach, assistant, physio, manager, etc
  "email" TEXT,
  "phone" TEXT,
  "photoUrl" TEXT,
  "qualifications" TEXT[],
  "startDate" DATE,
  "endDate" DATE,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "StaffMember_pkey" PRIMARY KEY ("id")
);

-- Tabella per i documenti aziendali/societari
CREATE TABLE "OrganizationDocument" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL, -- statuto, bilancio, verbale, certificato, etc
  "fileUrl" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileSize" INTEGER,
  "mimeType" TEXT,
  "year" INTEGER,
  "uploadedById" TEXT NOT NULL,
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "tags" TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OrganizationDocument_pkey" PRIMARY KEY ("id")
);

-- Aggiungi foreign keys
ALTER TABLE "TeamKit" ADD CONSTRAINT "TeamKit_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TeamKit" ADD CONSTRAINT "TeamKit_teamId_fkey" 
  FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "StaffMember" ADD CONSTRAINT "StaffMember_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StaffMember" ADD CONSTRAINT "StaffMember_teamId_fkey" 
  FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "OrganizationDocument" ADD CONSTRAINT "OrganizationDocument_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrganizationDocument" ADD CONSTRAINT "OrganizationDocument_uploadedById_fkey" 
  FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Crea indici
CREATE INDEX "TeamKit_organizationId_idx" ON "TeamKit"("organizationId");
CREATE INDEX "TeamKit_teamId_idx" ON "TeamKit"("teamId");
CREATE INDEX "TeamKit_season_idx" ON "TeamKit"("season");

CREATE INDEX "StaffMember_organizationId_idx" ON "StaffMember"("organizationId");
CREATE INDEX "StaffMember_teamId_idx" ON "StaffMember"("teamId");
CREATE INDEX "StaffMember_role_idx" ON "StaffMember"("role");

CREATE INDEX "OrganizationDocument_organizationId_idx" ON "OrganizationDocument"("organizationId");
CREATE INDEX "OrganizationDocument_category_idx" ON "OrganizationDocument"("category");
CREATE INDEX "OrganizationDocument_year_idx" ON "OrganizationDocument"("year");
