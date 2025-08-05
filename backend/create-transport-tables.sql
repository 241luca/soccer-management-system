-- Create transport tables
CREATE TABLE IF NOT EXISTS "TransportZone" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "distanceRange" TEXT NOT NULL DEFAULT '0-5km',
    "monthlyFee" DECIMAL(10,2) NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "coordinates" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportZone_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Bus" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "plateNumber" TEXT,
    "driverName" TEXT,
    "driverPhone" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bus_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BusRoute" (
    "id" TEXT NOT NULL,
    "busId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zones" TEXT[],
    "departureTime" TEXT NOT NULL,
    "returnTime" TEXT,
    "days" TEXT[],
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusRoute_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BusAthlete" (
    "id" TEXT NOT NULL,
    "busId" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "busRouteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusAthlete_pkey" PRIMARY KEY ("id")
);

-- Add transport fields to Athlete table
ALTER TABLE "Athlete" 
ADD COLUMN IF NOT EXISTS "transportZoneId" TEXT,
ADD COLUMN IF NOT EXISTS "usesTransport" BOOLEAN NOT NULL DEFAULT false;

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS "TransportZone_organizationId_name_key" ON "TransportZone"("organizationId", "name");
CREATE INDEX IF NOT EXISTS "TransportZone_organizationId_idx" ON "TransportZone"("organizationId");

CREATE UNIQUE INDEX IF NOT EXISTS "Bus_organizationId_plateNumber_key" ON "Bus"("organizationId", "plateNumber");
CREATE INDEX IF NOT EXISTS "Bus_organizationId_idx" ON "Bus"("organizationId");

CREATE INDEX IF NOT EXISTS "BusRoute_busId_idx" ON "BusRoute"("busId");

CREATE UNIQUE INDEX IF NOT EXISTS "BusAthlete_athleteId_key" ON "BusAthlete"("athleteId");
CREATE INDEX IF NOT EXISTS "BusAthlete_busId_idx" ON "BusAthlete"("busId");
CREATE INDEX IF NOT EXISTS "BusAthlete_busRouteId_idx" ON "BusAthlete"("busRouteId");

-- Add foreign keys
ALTER TABLE "TransportZone" ADD CONSTRAINT "TransportZone_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Bus" ADD CONSTRAINT "Bus_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "BusRoute" ADD CONSTRAINT "BusRoute_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BusAthlete" ADD CONSTRAINT "BusAthlete_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BusAthlete" ADD CONSTRAINT "BusAthlete_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BusAthlete" ADD CONSTRAINT "BusAthlete_busRouteId_fkey" FOREIGN KEY ("busRouteId") REFERENCES "BusRoute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_transportZoneId_fkey" FOREIGN KEY ("transportZoneId") REFERENCES "TransportZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Drop old transport tables if they exist
DROP TABLE IF EXISTS "AthleteTransport" CASCADE;
