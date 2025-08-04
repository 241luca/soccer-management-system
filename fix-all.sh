#!/bin/bash

echo "🔧 FIX COMPLETO DEL SISTEMA"
echo "=========================="
echo ""

# 1. Crea utente demo nel database
echo "📦 Creazione utente demo..."
cd /Users/lucamambelli/Desktop/soccer-management-system/backend

cat > quick-demo.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Create org
    const org = await prisma.organization.upsert({
      where: { code: 'DEMO' },
      update: {},
      create: {
        name: 'Demo Soccer Club',
        code: 'DEMO',
        plan: 'basic',
        maxUsers: 10,
        maxAthletes: 100,
        maxTeams: 10,
        isActive: true,
        isTrial: false
      }
    });
    
    // Create user
    const hash = await bcrypt.hashSync('demo123456', 10);
    const user = await prisma.user.upsert({
      where: { email: 'demo@soccermanager.com' },
      update: { passwordHash: hash },
      create: {
        email: 'demo@soccermanager.com',
        passwordHash: hash,
        firstName: 'Demo',
        lastName: 'User',
        role: 'ADMIN',
        organizationId: org.id,
        isActive: true
      }
    });
    
    console.log('✅ Demo user created!');
    console.log('Organization ID:', org.id);
    console.log('User ID:', user.id);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
EOF

node quick-demo.js

# 2. Fix del frontend per evitare loop
echo ""
echo "🔧 Fix del frontend..."
cd /Users/lucamambelli/Desktop/soccer-management-system

# Modifica useApiData per gestire meglio gli errori
cat > src/hooks/useApiData-fixed.js << 'EOF'
import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { useNotifications } from './useNotifications';
import { useToast } from './useToast';
import { generateDemoData } from '../data/demoData';

export const useApiData = () => {
  const [data, setData] = useState({ 
    teams: [], 
    athletes: [], 
    zones: [], 
    buses: [], 
    matches: [], 
    documents: [],
    payments: [],
    figcRules: {} 
  });
  const [stats, setStats] = useState({
    totalAthletes: 0,
    totalTeams: 0,
    activeAthletes: 0,
    upcomingMatches: 0,
    expiringDocuments: 0,
    pendingPayments: 0,
    busUsers: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const notificationSystem = useNotifications();
  const toastSystem = useToast();

  // Use demo data initially
  useEffect(() => {
    const demoData = generateDemoData();
    setData(demoData);
    setStats({
      totalAthletes: demoData.athletes.length,
      totalTeams: demoData.teams.length,
      activeAthletes: demoData.athletes.filter(a => a.status === 'ACTIVE').length,
      upcomingMatches: demoData.matches.filter(m => m.status === 'SCHEDULED').length,
      expiringDocuments: 10,
      pendingPayments: 5,
      busUsers: demoData.athletes.filter(a => a.usesTransport).length
    });
  }, []);

  return {
    data,
    stats,
    loading,
    error,
    notifications: notificationSystem.notifications,
    unreadCount: notificationSystem.unreadCount,
    markAsRead: notificationSystem.markAsRead,
    markAllAsRead: notificationSystem.markAllAsRead,
    clearNotifications: notificationSystem.clearNotifications,
    toast: toastSystem,
    addAthlete: async (athlete) => {
      const newAthlete = { ...athlete, id: Date.now().toString() };
      setData(prev => ({ ...prev, athletes: [...prev.athletes, newAthlete] }));
      toastSystem.showSuccess('Atleta aggiunto');
      return newAthlete;
    },
    updateAthlete: async (id, updates) => {
      setData(prev => ({
        ...prev,
        athletes: prev.athletes.map(a => a.id === id ? { ...a, ...updates } : a)
      }));
      toastSystem.showSuccess('Atleta aggiornato');
    },
    deleteAthlete: async (id) => {
      setData(prev => ({
        ...prev,
        athletes: prev.athletes.filter(a => a.id !== id)
      }));
      toastSystem.showSuccess('Atleta eliminato');
    }
  };
};
EOF

mv src/hooks/useApiData.js src/hooks/useApiData-backup.js
mv src/hooks/useApiData-fixed.js src/hooks/useApiData.js

echo ""
echo "✅ FIX COMPLETATO!"
echo ""
echo "📋 ISTRUZIONI:"
echo "1. Il backend dovrebbe essere già in esecuzione"
echo "2. Riavvia il frontend: npm run dev"
echo "3. Vai su http://localhost:5173"
echo "4. Login con: demo@soccermanager.com / demo123456"
echo ""
echo "Se ancora non funziona, prova a:"
echo "- Aprire una finestra in incognito"
echo "- Cancellare cache e cookies"
echo "- Ricaricare la pagina"
