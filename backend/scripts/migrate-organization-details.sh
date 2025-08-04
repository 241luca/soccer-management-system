#!/bin/bash

# Esegui la migrazione del database
cd /Users/lucamambelli/Desktop/soccer-management-system/backend

echo "Generando la migrazione Prisma..."
npx prisma migrate dev --name add_organization_details

echo "Generando il client Prisma..."
npx prisma generate

echo "Migrazione completata!"
