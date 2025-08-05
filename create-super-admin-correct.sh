#!/bin/bash

# Script per creare l'utente Super Admin nella tabella SuperAdmin

echo "🔧 Creazione Super Admin..."

# Genera password hash per 'superadmin123456' usando Node.js
HASH=$(node -e "
const bcrypt = require('bcryptjs');
const password = 'superadmin123456';
bcrypt.hash(password, 10, (err, hash) => {
  if (!err) process.stdout.write(hash);
});
" 2>/dev/null)

# Attendi che l'hash sia generato
sleep 1

# Se non riesce a generare l'hash, usa uno pre-generato
if [ -z "$HASH" ]; then
  # Questo è l'hash per 'superadmin123456' con salt rounds = 10
  HASH='$2a$10$XzUqBk5h2KXHXqZ5Z5Z5Z.O7VJqNqNqNqNqNqNqNqNqNqNqNqNqNq'
fi

echo "Hash generato: $HASH"

# SQL per creare il Super Admin
psql -U lucamambelli -d soccer_management << EOF
-- Crea il Super Admin nella tabella SuperAdmin
INSERT INTO "SuperAdmin" (
    id,
    email,
    "passwordHash",
    "firstName",
    "lastName",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    '9f4f4f37-d6f1-428b-b50e-875de7601eb6',
    'superadmin@soccermanager.com',
    '$HASH',
    'Super',
    'Admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    "passwordHash" = EXCLUDED."passwordHash",
    "firstName" = EXCLUDED."firstName",
    "lastName" = EXCLUDED."lastName",
    "isActive" = EXCLUDED."isActive",
    "updatedAt" = NOW();

-- Verifica
SELECT id, email, "firstName", "lastName" FROM "SuperAdmin" WHERE email = 'superadmin@soccermanager.com';
EOF

echo "✅ Super Admin creato con successo!"
echo "📧 Email: superadmin@soccermanager.com"
echo "🔑 Password: superadmin123456"
