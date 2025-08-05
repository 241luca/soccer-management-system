#!/bin/bash

# Script per creare l'utente Super Admin

echo "🔧 Creazione Super Admin..."

# Genera password hash per 'superadmin123456'
# Usando bcrypt con salt rounds = 10
PASSWORD_HASH='$2a$10$ZGGQQzUP5Lzj.hJQJ5KqA.yrTDqJH3lrq8lH6R7Cq.UqQBXzCp5Ky'

# SQL per creare il Super Admin
psql -U lucamambelli -d soccer_management << EOF
-- Crea il Super Admin se non esiste
INSERT INTO "User" (
    id,
    email,
    "passwordHash",
    "firstName",
    "lastName",
    role,
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    '9f4f4f37-d6f1-428b-b50e-875de7601eb6',
    'superadmin@soccermanager.com',
    '$PASSWORD_HASH',
    'Super',
    'Admin',
    'SUPER_ADMIN',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    "passwordHash" = EXCLUDED."passwordHash",
    "firstName" = EXCLUDED."firstName",
    "lastName" = EXCLUDED."lastName",
    role = EXCLUDED.role,
    "isActive" = EXCLUDED."isActive",
    "updatedAt" = NOW();

-- Verifica
SELECT id, email, role FROM "User" WHERE email = 'superadmin@soccermanager.com';
EOF

echo "✅ Super Admin creato con successo!"
echo "📧 Email: superadmin@soccermanager.com"
echo "🔑 Password: superadmin123456"
