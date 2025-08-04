#!/bin/bash

echo "🚀 Setup Demo User..."
echo ""

cd /Users/lucamambelli/Desktop/soccer-management-system/backend

# Run the setup script
npx ts-node src/scripts/setup-demo.ts

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Demo user created successfully!"
    echo ""
    echo "📋 Now you can login with:"
    echo "   Email: demo@soccermanager.com"
    echo "   Password: demo123456"
    echo ""
    echo "🔄 Please:"
    echo "1. Stop the frontend (Ctrl+C)"
    echo "2. Clear browser cache/localStorage"
    echo "3. Restart frontend: npm run dev"
    echo "4. Try to login again"
else
    echo "❌ Error creating demo user"
fi
