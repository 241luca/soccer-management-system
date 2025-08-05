-- Verifica dati nel database
SELECT 'Organizations' as table_name, COUNT(*) as count FROM "Organization"
UNION ALL
SELECT 'Users', COUNT(*) FROM "User"
UNION ALL
SELECT 'Teams', COUNT(*) FROM "Team"
UNION ALL
SELECT 'Athletes', COUNT(*) FROM "Athlete"
UNION ALL
SELECT 'Transport Zones', COUNT(*) FROM "TransportZone"
UNION ALL
SELECT 'Buses', COUNT(*) FROM "Bus";

-- Mostra le organizzazioni
SELECT id, name, code FROM "Organization";

-- Mostra gli utenti
SELECT id, email, "firstName", "lastName" FROM "User";
