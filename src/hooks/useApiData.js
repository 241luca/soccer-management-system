// hooks/useApiData.js
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isLoadingRef = useRef(false);
  
  // Initialize notification system
  const notificationSystem = useNotifications();
  const toastSystem = useToast();

  // Check if we should use API or demo data
  const useApi = import.meta.env.VITE_USE_API === 'true';

  // Load data from API
  const loadApiData = useCallback(async () => {
    // Prevent multiple simultaneous loads
    if (isLoadingRef.current) return;
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      console.log('Loading data from API...');

      // Load all data in parallel with error handling for each
      const results = await Promise.allSettled([
        api.getDashboardStats(),
        api.getAthletes(),
        api.getTeams(),
        // Commented out endpoints that might not be ready
        // api.getDocuments(),
        // api.getPayments(),
        // api.getMatches()
      ]);

      console.log('API results:', results);

      // Process dashboard stats
      if (results[0].status === 'fulfilled') {
        const dashboardData = results[0].value;
        setStats({
          totalAthletes: dashboardData.athletes?.total || 0,
          totalTeams: dashboardData.teams?.total || 0,
          activeAthletes: dashboardData.athletes?.active || 0,
          upcomingMatches: dashboardData.matches?.upcoming || 0,
          expiringDocuments: dashboardData.documents?.expiring30Days || 0,
          pendingPayments: dashboardData.payments?.pendingCount || 0,
          busUsers: dashboardData.transport?.totalUsers || 0
        });
      }

      // Process athletes
      let athletesData = [];
      if (results[1].status === 'fulfilled') {
        // Handle both possible response formats
        athletesData = results[1].value.athletes || results[1].value.data || [];
      }

      // Process teams
      let teamsData = [];
      if (results[2].status === 'fulfilled') {
        // Handle both possible response formats
        teamsData = results[2].value.teams || results[2].value.data || [];
      }

      // Set the data
      setData({
        athletes: athletesData,
        teams: teamsData,
        documents: [],
        payments: [],
        zones: [],
        buses: [],
        matches: [],
        figcRules: {}
      });

      setLoading(false);
      isLoadingRef.current = false;
      console.log('Data loaded successfully');
    } catch (err) {
      console.error('Error loading data from API:', err);
      setError(err.message);
      
      // Fallback to demo data on error
      console.log('Falling back to demo data...');
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
      
      setLoading(false);
      isLoadingRef.current = false;
      
      // Don't show error toast for 401 - the API client will redirect to login
      if (!err.message?.includes('401')) {
        toastSystem.showError('Usando dati demo - Errore API: ' + err.message);
      }
    }
  }, []); // Empty deps - function doesn't change

  // Load demo data
  const loadDemoData = useCallback(async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setLoading(true);
    console.log('Loading demo data...');
    
    // Simulate async loading
    await new Promise(resolve => setTimeout(resolve, 500));
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
    setLoading(false);
    isLoadingRef.current = false;
    console.log('Demo data loaded');
  }, []);

  // Initial load - only once
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (!mounted) return;
      
      if (useApi) {
        await loadApiData();
      } else {
        await loadDemoData();
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []); // Empty deps - only run once on mount

  // Auto-check notifications when data changes
  useEffect(() => {
    if (!loading && data.athletes && data.athletes.length > 0) {
      notificationSystem.runAutoChecks(data);
    }
  }, [data.athletes, loading]); // Only depend on athletes and loading

  // CRUD operations for athletes
  const addAthlete = async (athlete) => {
    if (useApi) {
      try {
        const newAthlete = await api.createAthlete(athlete);
        await loadApiData(); // Reload all data
        toastSystem.showSuccess('Atleta aggiunto con successo');
        return newAthlete;
      } catch (err) {
        toastSystem.showError('Errore nell\'aggiunta dell\'atleta: ' + err.message);
        throw err;
      }
    } else {
      // Demo mode
      const newAthlete = { ...athlete, id: Date.now() };
      setData(prev => ({ ...prev, athletes: [...prev.athletes, newAthlete] }));
      toastSystem.showSuccess('Atleta aggiunto con successo (demo)');
      return newAthlete;
    }
  };

  const updateAthlete = async (id, updates) => {
    if (useApi) {
      try {
        const updatedAthlete = await api.updateAthlete(id, updates);
        await loadApiData(); // Reload all data
        toastSystem.showSuccess('Atleta aggiornato con successo');
        return updatedAthlete;
      } catch (err) {
        toastSystem.showError('Errore nell\'aggiornamento dell\'atleta: ' + err.message);
        throw err;
      }
    } else {
      // Demo mode
      setData(prev => ({
        ...prev,
        athletes: prev.athletes.map(a => a.id === id ? { ...a, ...updates } : a)
      }));
      toastSystem.showSuccess('Atleta aggiornato con successo (demo)');
      return { id, ...updates };
    }
  };

  const deleteAthlete = async (id) => {
    if (useApi) {
      try {
        await api.deleteAthlete(id);
        await loadApiData(); // Reload all data
        toastSystem.showSuccess('Atleta eliminato con successo');
      } catch (err) {
        toastSystem.showError('Errore nell\'eliminazione dell\'atleta: ' + err.message);
        throw err;
      }
    } else {
      // Demo mode
      setData(prev => ({
        ...prev,
        athletes: prev.athletes.filter(a => a.id !== id)
      }));
      toastSystem.showSuccess('Atleta eliminato con successo (demo)');
    }
  };

  // CRUD operations for teams
  const addTeam = async (team) => {
    if (useApi) {
      try {
        const newTeam = await api.createTeam(team);
        await loadApiData();
        toastSystem.showSuccess('Squadra creata con successo');
        return newTeam;
      } catch (err) {
        toastSystem.showError('Errore nella creazione della squadra: ' + err.message);
        throw err;
      }
    } else {
      const newTeam = { ...team, id: Date.now() };
      setData(prev => ({ ...prev, teams: [...prev.teams, newTeam] }));
      toastSystem.showSuccess('Squadra creata con successo (demo)');
      return newTeam;
    }
  };

  const updateTeam = async (id, updates) => {
    if (useApi) {
      try {
        const updatedTeam = await api.updateTeam(id, updates);
        await loadApiData();
        toastSystem.showSuccess('Squadra aggiornata con successo');
        return updatedTeam;
      } catch (err) {
        toastSystem.showError('Errore nell\'aggiornamento della squadra: ' + err.message);
        throw err;
      }
    } else {
      setData(prev => ({
        ...prev,
        teams: prev.teams.map(t => t.id === id ? { ...t, ...updates } : t)
      }));
      toastSystem.showSuccess('Squadra aggiornata con successo (demo)');
      return { id, ...updates };
    }
  };

  const deleteTeam = async (id) => {
    if (useApi) {
      try {
        await api.deleteTeam(id);
        await loadApiData();
        toastSystem.showSuccess('Squadra eliminata con successo');
      } catch (err) {
        toastSystem.showError('Errore nell\'eliminazione della squadra: ' + err.message);
        throw err;
      }
    } else {
      setData(prev => ({
        ...prev,
        teams: prev.teams.filter(t => t.id !== id)
      }));
      toastSystem.showSuccess('Squadra eliminata con successo (demo)');
    }
  };

  // Refresh data
  const refreshData = () => {
    if (useApi) {
      loadApiData();
    } else {
      loadDemoData();
    }
  };

  return {
    data,
    stats,
    loading,
    error,
    notifications: notificationSystem,
    toast: toastSystem,
    actions: {
      addAthlete,
      updateAthlete,
      deleteAthlete,
      addTeam,
      updateTeam,
      deleteTeam,
      refreshData
    }
  };
};

// Export as default for backward compatibility
export const useData = useApiData;
