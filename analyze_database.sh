#!/bin/bash

OUTPUT_FILE="database_analysis.txt"

echo "=== ANALISI COMPLETA DATABASE SOCCER MANAGEMENT ===" > $OUTPUT_FILE
echo "Data: $(date)" >> $OUTPUT_FILE
echo "=========================================" >> $OUTPUT_FILE

# Lista di tutte le tabelle
TABLES=(
    "Organization"
    "User"
    "SuperAdmin"
    "Team"
    "Athlete"
    "TransportZone"
    "Bus"
    "BusRoute"
    "BusAthlete"
    "Match"
    "Venue"
    "MatchRoster"
    "MatchStat"
    "Position"
    "DocumentType"
    "Document"
    "PaymentType"
    "Payment"
    "Role"
    "Permission"
    "RolePermission"
    "UserOrganization"
    "Notification"
    "RefreshToken"
)

# Per ogni tabella
for TABLE in "${TABLES[@]}"
do
    echo -e "\n\n=== TABELLA: $TABLE ===" >> $OUTPUT_FILE
    
    # Conta record
    COUNT=$(psql -U lucamambelli -d soccer_management -t -c "SELECT COUNT(*) FROM \"$TABLE\";" 2>/dev/null)
    echo "Numero record: $COUNT" >> $OUTPUT_FILE
    
    # Se ci sono record, mostra alcuni esempi
    if [ $COUNT -gt 0 ]; then
        echo -e "\nPrimi 5 record:" >> $OUTPUT_FILE
        psql -U lucamambelli -d soccer_management -c "SELECT * FROM \"$TABLE\" LIMIT 5;" >> $OUTPUT_FILE 2>&1
    fi
    
    # Mostra struttura per tabelle principali
    if [[ "$TABLE" == "Athlete" || "$TABLE" == "Team" || "$TABLE" == "Organization" || "$TABLE" == "User" ]]; then
        echo -e "\nStruttura tabella:" >> $OUTPUT_FILE
        psql -U lucamambelli -d soccer_management -c "\d \"$TABLE\"" >> $OUTPUT_FILE 2>&1
    fi
done

# Analisi speciali
echo -e "\n\n=== ANALISI SPECIALI ===" >> $OUTPUT_FILE

echo -e "\n1. Organizzazioni con conteggi:" >> $OUTPUT_FILE
psql -U lucamambelli -d soccer_management -t -c "
SELECT o.name, o.id, o.code,
       (SELECT COUNT(*) FROM \"Team\" t WHERE t.\"organizationId\" = o.id) as teams,
       (SELECT COUNT(*) FROM \"Athlete\" a WHERE a.\"organizationId\" = o.id) as athletes,
       (SELECT COUNT(*) FROM \"User\" u WHERE u.\"organizationId\" = o.id) as users
FROM \"Organization\" o
ORDER BY o.name;" >> $OUTPUT_FILE

echo -e "\n2. Squadre per organizzazione:" >> $OUTPUT_FILE
psql -U lucamambelli -d soccer_management -t -c "
SELECT o.name as org, t.name as team, t.id
FROM \"Team\" t
JOIN \"Organization\" o ON t.\"organizationId\" = o.id
ORDER BY o.name, t.name;" >> $OUTPUT_FILE

echo -e "\n3. Utenti del sistema:" >> $OUTPUT_FILE
psql -U lucamambelli -d soccer_management -t -c "
SELECT email, role, \"organizationId\", \"isActive\"
FROM \"User\"
UNION ALL
SELECT email, 'SUPER_ADMIN' as role, NULL as \"organizationId\", \"isActive\"
FROM \"SuperAdmin\"
ORDER BY email;" >> $OUTPUT_FILE

echo -e "\n\n=== FINE ANALISI ===" >> $OUTPUT_FILE
echo "Analisi salvata in: $OUTPUT_FILE"
