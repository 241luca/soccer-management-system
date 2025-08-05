#!/bin/bash

echo "Creating Super Admin..."

# Hash for password 'superadmin123456'
# This hash was generated with bcryptjs using 10 salt rounds
HASH='$2a$10$K5KxJL5C8eZ3Hqz6yYBxVOl2rUqGPKm8e5A.DxZRMBQBVhRtV5oNa'

psql -U lucamambelli -d soccer_management << 'EOF'
-- First, ensure SuperAdmin table exists
-- Delete any existing super admin
DELETE FROM "SuperAdmin" WHERE email = 'superadmin@soccermanager.com';

-- Insert new super admin
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
    '$2a$10$K5KxJL5C8eZ3Hqz6yYBxVOl2rUqGPKm8e5A.DxZRMBQBVhRtV5oNa',
    'Super',
    'Admin',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Verify
SELECT id, email, "firstName", "lastName", "isActive" 
FROM "SuperAdmin" 
WHERE email = 'superadmin@soccermanager.com';
EOF

echo "✅ Super Admin created successfully!"
echo "Email: superadmin@soccermanager.com"
echo "Password: superadmin123456"
