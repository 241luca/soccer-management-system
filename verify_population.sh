#!/bin/bash

echo "=== VERIFICA POPOLAMENTO DATABASE ===" > verify_population.txt
echo "Data: $(date)" >> verify_population.txt
echo "" >> verify_population.txt

echo "1. ORGANIZZAZIONI:" >> verify_population.txt
psql -U lucamambelli -d soccer_management -t -c "SELECT name, code, \"isActive\" FROM \"Organization\" ORDER BY name;" >> verify_population.txt

echo -e "\n2. RIEPILOGO PER ORGANIZZAZIONE:" >> verify_population.txt
psql -U lucamambelli -d soccer_management -t -c "
SELECT o.name as org, 
       COUNT(DISTINCT a.id) as atleti,
       COUNT(DISTINCT t.id) as squadre
FROM \"Organization\" o
LEFT JOIN \"Athlete\" a ON o.id = a.\"organizationId\"
LEFT JOIN \"Team\" t ON o.id = t.\"organizationId\"
GROUP BY o.id, o.name
ORDER BY o.name;" >> verify_population.txt

echo -e "\n3. UTENTI:" >> verify_population.txt
psql -U lucamambelli -d soccer_management -t -c "SELECT email, role FROM \"User\" ORDER BY email;" >> verify_population.txt

echo -e "\nPopolamento completato!" >> verify_population.txt
cat verify_population.txt
