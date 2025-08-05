-- Script per aggiornare i dati completi di ASD Ravenna Calcio
UPDATE "Organization" 
SET 
  -- Anagrafica completa
  "fullName" = 'ASD Ravenna Calcio Femminile',
  "address" = 'Via Romea Sud, 470',
  "city" = 'Ravenna',
  "province" = 'RA',
  "postalCode" = '48124',
  "country" = 'IT',
  "phone" = '+39 0544 591868',
  "email" = 'info@asdravennacalcio.it',
  "website" = 'https://www.asdravennacalcio.it',
  "fiscalCode" = 'RVCALC92B15H199X',
  "vatNumber" = 'IT02345678901',
  "foundedYear" = 1992,
  "federationNumber" = 'FIGC-789012',
  "iban" = 'IT60X0542811101000000456789',
  "bankName" = 'Cassa di Risparmio di Ravenna',
  
  -- Logo (placeholder con colori giallo-rossi tipici di Ravenna)
  "logoUrl" = 'https://ui-avatars.com/api/?name=Ravenna+FC&background=FFD700&color=8B0000&size=200&rounded=true&bold=true',
  
  -- Colori societari (giallo-rosso come i colori storici di Ravenna)
  "primaryColor" = '#FFD700',
  "secondaryColor" = '#8B0000',
  
  -- Info aggiuntive
  "description" = 'ASD Ravenna Calcio Femminile è una società sportiva che promuove il calcio femminile nelle categorie giovanili. Con oltre 30 anni di storia, siamo un punto di riferimento per lo sport femminile in Romagna.',
  
  -- Contatti dirigenza
  "presidentName" = 'Giovanni Melandri',
  "presidentEmail" = 'presidente@asdravennacalcio.it',
  "presidentPhone" = '+39 339 8765432',
  "secretaryName" = 'Patrizia Gardini',
  "secretaryEmail" = 'segreteria@asdravennacalcio.it',
  "secretaryPhone" = '+39 347 5432109',
  
  -- Social media
  "socialFacebook" = 'https://facebook.com/asdravennacalcio',
  "socialInstagram" = 'https://instagram.com/asdravennacalcio',
  "socialTwitter" = 'https://twitter.com/ravennafc',
  "socialYoutube" = 'https://youtube.com/@asdravennacalcio',
  
  -- Multi-tenant fields
  "subdomain" = 'ravenna',
  "plan" = 'pro',
  "maxUsers" = 25,
  "maxAthletes" = 250,
  "maxTeams" = 10,
  "isActive" = true,
  "isTrial" = false,
  "billingEmail" = 'amministrazione@asdravennacalcio.it'
  
WHERE "code" = 'RAVENNA';
