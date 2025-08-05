#!/bin/bash

# Script per correggere tutti gli errori TypeScript nel backend

echo "🔧 Correzione errori TypeScript nel backend..."

# 1. Correggere matchDate -> date
find /Users/lucamambelli/Desktop/soccer-management-system/backend/src -name "*.ts" -type f -exec sed -i '' 's/matchDate/date/g' {} \;

# 2. Correggere matchTime -> time
find /Users/lucamambelli/Desktop/soccer-management-system/backend/src -name "*.ts" -type f -exec sed -i '' 's/matchTime/time/g' {} \;

# 3. Correggere athleteTransport -> busAthlete
find /Users/lucamambelli/Desktop/soccer-management-system/backend/src -name "*.ts" -type f -exec sed -i '' 's/athleteTransport/busAthlete/g' {} \;

# 4. Correggere busRoutes references
find /Users/lucamambelli/Desktop/soccer-management-system/backend/src -name "*.ts" -type f -exec sed -i '' 's/zones: { has: id }/busId: id/g' {} \;

echo "✅ Correzioni completate!"
