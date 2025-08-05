#!/bin/bash

echo "=== VERIFICA DIRETTA DATABASE E API ==="
echo ""

# 1. Verifica nel database
echo "1. ATLETI NEL DATABASE:"
psql -U lucamambelli -d soccer_management << EOF
SELECT o.name as org, COUNT(a.id) as num_atleti
FROM "Organization" o
LEFT JOIN "Athlete" a ON o.id = a."organizationId"
GROUP BY o.id, o.name
ORDER BY o.name;

-- Mostra primi 5 atleti
SELECT a."firstName", a."lastName", o.name as org, t.name as team
FROM "Athlete" a
JOIN "Organization" o ON a."organizationId" = o.id
LEFT JOIN "Team" t ON a."teamId" = t.id
LIMIT 5;
EOF

echo ""
echo "2. VERIFICA API (attendi che il backend sia pronto):"
echo ""

# Attendi che il backend sia disponibile
for i in {1..10}; do
    if curl -s http://localhost:3000/health > /dev/null; then
        echo "Backend disponibile!"
        break
    fi
    echo "Attendo backend... tentativo $i/10"
    sleep 2
done

# Se il backend è attivo, testa l'API
if curl -s http://localhost:3000/health > /dev/null; then
    ./test-api-athletes.sh
else
    echo "ERRORE: Backend non disponibile"
fi
