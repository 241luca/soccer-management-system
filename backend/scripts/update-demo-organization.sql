-- Script per aggiornare i dati completi di Demo Soccer Club
UPDATE "Organization" 
SET 
  -- Anagrafica completa
  "fullName" = 'Demo Soccer Club ASD',
  "address" = 'Via dello Sport, 123',
  "city" = 'Roma',
  "province" = 'RM',
  "postalCode" = '00100',
  "country" = 'IT',
  "phone" = '+39 06 12345678',
  "email" = 'info@demosoccerclub.com',
  "website" = 'https://www.demosoccerclub.com',
  "fiscalCode" = 'DMSCCS90A01H501A',
  "vatNumber" = 'IT12345678901',
  "foundedYear" = 1990,
  "federationNumber" = 'FIGC-123456',
  "iban" = 'IT60X0542811101000000123456',
  "bankName" = 'Banca Demo S.p.A.',
  
  -- Logo (placeholder per ora - puoi sostituire con un URL reale)
  "logoUrl" = 'https://ui-avatars.com/api/?name=Demo+Soccer&background=3B82F6&color=fff&size=200&rounded=true&bold=true',
  
  -- Colori societari
  "primaryColor" = '#3B82F6',
  "secondaryColor" = '#1E40AF',
  
  -- Info aggiuntive
  "description" = 'Demo Soccer Club è una società sportiva dilettantistica dedicata al calcio femminile giovanile. Fondata nel 1990, promuove lo sport come strumento di crescita e inclusione sociale.',
  
  -- Contatti dirigenza
  "presidentName" = 'Mario Rossi',
  "presidentEmail" = 'presidente@demosoccerclub.com',
  "presidentPhone" = '+39 335 1234567',
  "secretaryName" = 'Giulia Bianchi',
  "secretaryEmail" = 'segreteria@demosoccerclub.com',
  "secretaryPhone" = '+39 335 7654321',
  
  -- Social media
  "socialFacebook" = 'https://facebook.com/demosoccerclub',
  "socialInstagram" = 'https://instagram.com/demosoccerclub',
  "socialTwitter" = 'https://twitter.com/demosoccerclub',
  "socialYoutube" = 'https://youtube.com/demosoccerclub',
  
  -- Multi-tenant fields
  "subdomain" = 'demo',
  "plan" = 'enterprise',
  "maxUsers" = 50,
  "maxAthletes" = 500,
  "maxTeams" = 20,
  "isActive" = true,
  "isTrial" = false,
  "billingEmail" = 'billing@demosoccerclub.com'
  
WHERE "id" = '43c973a6-5e20-43af-a295-805f1d7c86b1';
