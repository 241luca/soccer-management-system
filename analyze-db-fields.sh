#!/bin/bash

echo "=== ANALISI CAMPI DATABASE CHE NECESSITANO PULIZIA ==="
echo ""

cd /Users/lucamambelli/Desktop/soccer-management-system/backend/prisma

echo "1. MODELLI CON CAMPO PHONE:"
grep -n "phone" schema.prisma | grep -v "//"
echo ""

echo "2. MODELLI CON CAMPO POSTALCODE:"
grep -n "postalCode" schema.prisma
echo ""

echo "3. MODELLI CON CAMPO FISCALCODE:"
grep -n "fiscalCode" schema.prisma
echo ""

echo "4. MODELLI CON CAMPI DATE/DATETIME:"
grep -n "DateTime\|Date" schema.prisma | grep -v "createdAt\|updatedAt" | head -20
echo ""

echo "5. MODELLI CON CAMPO ADDRESS:"
grep -n "address" schema.prisma
echo ""

echo "6. MODELLI CON CAMPO PROVINCE:"
grep -n "province" schema.prisma
