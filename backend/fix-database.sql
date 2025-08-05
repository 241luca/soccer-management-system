-- Fix for transport service monthlyFee
UPDATE "TransportZone" SET "monthlyFee" = 0 WHERE "monthlyFee" IS NULL;
