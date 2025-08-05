#!/bin/bash

echo "=== VERIFICA DATABASE ===" > db_check_results.txt
echo "Data: $(date)" >> db_check_results.txt
echo "" >> db_check_results.txt

echo "1. ORGANIZZAZIONI:" >> db_check_results.txt
psql -U lucamambelli -d soccer_management -t -c "SELECT id, name, code, \"isActive\" FROM \"Organization\";" >> db_check_results.txt

echo -e "\n2. CONTEGGIO ATLETI:" >> db_check_results.txt
psql -U lucamambelli -d soccer_management -t -c "SELECT COUNT(*) as total FROM \"Athlete\";" >> db_check_results.txt

echo -e "\n3. ATLETI PER ORGANIZZAZIONE:" >> db_check_results.txt
psql -U lucamambelli -d soccer_management -t -c "SELECT o.name, COUNT(a.id) as num_atleti FROM \"Organization\" o LEFT JOIN \"Athlete\" a ON o.id = a.\"organizationId\" GROUP BY o.id, o.name;" >> db_check_results.txt

echo -e "\n4. SQUADRE:" >> db_check_results.txt
psql -U lucamambelli -d soccer_management -t -c "SELECT COUNT(*) as total FROM \"Team\";" >> db_check_results.txt

echo -e "\n5. SUPER ADMIN:" >> db_check_results.txt
psql -U lucamambelli -d soccer_management -t -c "SELECT id, email FROM \"SuperAdmin\";" >> db_check_results.txt

echo -e "\nVerifica completata." >> db_check_results.txt
