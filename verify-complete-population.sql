-- VERIFICA POPOLAMENTO COMPLETO

SELECT '=== RIEPILOGO POPOLAMENTO ===' as info;

SELECT 
  'Organizzazioni: ' || COUNT(*) as conteggio
FROM "Organization"
UNION ALL
SELECT 'Squadre: ' || COUNT(*) FROM "Team"
UNION ALL
SELECT 'Atleti: ' || COUNT(*) FROM "Athlete"
UNION ALL
SELECT 'Utenti: ' || COUNT(*) FROM "User"
UNION ALL
SELECT 'Staff: ' || COUNT(*) FROM "StaffMember"
UNION ALL
SELECT 'Zone Trasporto: ' || COUNT(*) FROM "TransportZone"
UNION ALL
SELECT 'Bus: ' || COUNT(*) FROM "Bus"
UNION ALL
SELECT 'Documenti: ' || COUNT(*) FROM "Document"
UNION ALL
SELECT 'Tipi Documento: ' || COUNT(*) FROM "DocumentType"
UNION ALL
SELECT 'Pagamenti: ' || COUNT(*) FROM "Payment"
UNION ALL
SELECT 'Tipi Pagamento: ' || COUNT(*) FROM "PaymentType"
UNION ALL
SELECT 'Sponsor: ' || COUNT(*) FROM "Sponsor"
UNION ALL
SELECT 'Campi: ' || COUNT(*) FROM "Venue"
UNION ALL
SELECT 'Partite: ' || COUNT(*) FROM "Match"
UNION ALL
SELECT 'Notifiche: ' || COUNT(*) FROM "Notification";

-- Dettaglio per organizzazione
SELECT '';
SELECT '=== DETTAGLIO PER ORGANIZZAZIONE ===' as info;
SELECT 
  o.name as organizzazione,
  COUNT(DISTINCT t.id) as squadre,
  COUNT(DISTINCT a.id) as atleti,
  COUNT(DISTINCT s.id) as staff,
  COUNT(DISTINCT d.id) as documenti,
  COUNT(DISTINCT p.id) as pagamenti,
  COUNT(DISTINCT sp.id) as sponsor
FROM "Organization" o
LEFT JOIN "Team" t ON o.id = t."organizationId"
LEFT JOIN "Athlete" a ON o.id = a."organizationId"
LEFT JOIN "StaffMember" s ON o.id = s."organizationId"
LEFT JOIN "Document" d ON a.id = d."athleteId"
LEFT JOIN "Payment" p ON a.id = p."athleteId"
LEFT JOIN "Sponsor" sp ON o.id = sp."organizationId"
GROUP BY o.id, o.name
ORDER BY o.name;

-- Documenti in scadenza
SELECT '';
SELECT '=== DOCUMENTI IN SCADENZA (prossimi 30 giorni) ===' as info;
SELECT 
  o.name as organizzazione,
  COUNT(*) as documenti_in_scadenza
FROM "Document" d
JOIN "Athlete" a ON d."athleteId" = a.id
JOIN "Organization" o ON a."organizationId" = o.id
WHERE d."expiryDate" BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
GROUP BY o.name;

-- Pagamenti in sospeso
SELECT '';
SELECT '=== PAGAMENTI IN SOSPESO ===' as info;
SELECT 
  o.name as organizzazione,
  COUNT(*) as pagamenti_pendenti,
  SUM(p.amount) as totale_euro
FROM "Payment" p
JOIN "Athlete" a ON p."athleteId" = a.id
JOIN "Organization" o ON a."organizationId" = o.id
WHERE p.status = 'PENDING'
GROUP BY o.name;
