// hooks/useApiData.js
// VERSIONE SENZA DATI DEMO - USA SEMPRE IL BACKEND
import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { useNotifications } from './useNotifications';
import { useToast } from './useToast';

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
  const isLoadingRef = useRef(false);
  
  // Initialize notification system
  const notificationSystem = useNotifications();
  const toastSystem = useToast();

  // Load data from API - SEMPRE E SOLO API, NESSUN DATO DEMO
  const loadApiData = useCallback(async () => {
    // Prevent multiple simultaneous loads
    if (isLoadingRef.current) return;
    
    // Don't load if no token (user not logged in)
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, skipping API load');
      setLoading(false);
      return;
    }
    
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
        api.getDocuments(),
        api.getPayments(),
        api.getMatches(),
        api.getTransportZones(),
        api.getBuses()
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
        const response = results[1].value;
        // Prova diversi formati di risposta
        if (Array.isArray(response)) {
          athletesData = response;
        } else if (response.data && Array.isArray(response.data)) {
          athletesData = response.data;
        } else if (response.athletes && Array.isArray(response.athletes)) {
          athletesData = response.athletes;
        }
        console.log('Athletes response:', response);
        console.log('Athletes parsed:', athletesData.length);
      }

      // Process teams
      let teamsData = [];
      if (results[2].status === 'fulfilled') {
        const response = results[2].value;
        if (Array.isArray(response)) {
          teamsData = response;
        } else if (response.data && Array.isArray(response.data)) {
          teamsData = response.data;
        } else if (response.teams && Array.isArray(response.teams)) {
          teamsData = response.teams;
        }
        console.log('Teams parsed:', teamsData.length);
      }

      // Process documents
      let documentsData = [];
      if (results[3].status === 'fulfilled') {
        documentsData = results[3].value.documents || results[3].value.data || [];
      }

      // Process payments
      let paymentsData = [];
      if (results[4].status === 'fulfilled') {
        paymentsData = results[4].value.payments || results[4].value.data || [];
      }

      // Process matches
      let matchesData = [];
      if (results[5].status === 'fulfilled') {
        matchesData = results[5].value.matches || results[5].value.data || [];
      }

      // Process transport zones
      let zonesData = [];
      if (results[6].status === 'fulfilled') {
        zonesData = results[6].value.zones || results[6].value.data || [];
      }

      // Process buses
      let busesData = [];
      if (results[7].status === 'fulfilled') {
        busesData = results[7].value.buses || results[7].value.data || [];
      }

      // Set the data
      setData({
        athletes: athletesData,
        teams: teamsData,
        documents: documentsData,
        payments: paymentsData,
        matches: matchesData,
        zones: zonesData,
        buses: busesData,
        figcRules: {} // Questo può essere caricato separatamente se necessario
      });

      // Check for critical notifications
      if (stats.expiringDocuments > 0) {
        notificationSystem.addNotification({
          type: 'warning',
          title: 'Documenti in scadenza',
          message: `Hai ${stats.expiringDocuments} documenti in scadenza nei prossimi 30 giorni`,
          persistent: true
        });
      }

      if (stats.pendingPayments > 0) {
        notificationSystem.addNotification({
          type: 'info',
          title: 'Pagamenti in sospeso',
          message: `Ci sono ${stats.pendingPayments} pagamenti da completare`,
          persistent: false
        });
      }

    } catch (err) {
      console.error('Error loading API data:', err);
      setError(err.message || 'Errore nel caricamento dei dati');
      
      // Show error toast
      toastSystem.showToast({
        type: 'error',
        message: 'Errore nel caricamento dei dati dal server'
      });
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, [notificationSystem, toastSystem]);

  // Initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const organization = localStorage.getItem('organization');
    
    // Only load if we have both token AND organization (or if user is not logged in)
    if (token && organization && !isLoadingRef.current) {
      console.log('Initial load: Token and organization found, loading data...');
      loadApiData();
    } else if (token && !organization) {
      console.log('Initial load: Token found but no organization, waiting...');
      // For Super Admin without organization, wait a bit for App.jsx to set it
      const checkInterval = setInterval(() => {
        const org = localStorage.getItem('organization');
        if (org) {
          console.log('Organization now available, loading data...');
          clearInterval(checkInterval);
          loadApiData();
        }
      }, 500);
      
      // Clear interval after 5 seconds to avoid infinite loop
      setTimeout(() => clearInterval(checkInterval), 5000);
    }
  }, []);

  // CRUD Operations
  const addAthlete = useCallback(async (athleteData) => {
    try {
      const newAthlete = await api.createAthlete(athleteData);
      setData(prev => ({
        ...prev,
        athletes: [...prev.athletes, newAthlete]
      }));
      
      toastSystem.showToast({
        type: 'success',
        message: 'Atleta aggiunto con successo'
      });
      
      return newAthlete;
    } catch (err) {
      toastSystem.showToast({
        type: 'error',
        message: err.message || 'Errore nell\'aggiunta dell\'atleta'
      });
      throw err;
    }
  }, [toastSystem]);

  const updateAthlete = useCallback(async (id, updates) => {
    try {
      const updatedAthlete = await api.updateAthlete(id, updates);
      setData(prev => ({
        ...prev,
        athletes: prev.athletes.map(a => 
          a.id === id ? { ...a, ...updatedAthlete } : a
        )
      }));
      
      toastSystem.showToast({
        type: 'success',
        message: 'Atleta aggiornato con successo'
      });
      
      return updatedAthlete;
    } catch (err) {
      toastSystem.showToast({
        type: 'error',
        message: err.message || 'Errore nell\'aggiornamento dell\'atleta'
      });
      throw err;
    }
  }, [toastSystem]);

  const deleteAthlete = useCallback(async (id) => {
    try {
      await api.deleteAthlete(id);
      setData(prev => ({
        ...prev,
        athletes: prev.athletes.filter(a => a.id !== id)
      }));
      
      toastSystem.showToast({
        type: 'success',
        message: 'Atleta eliminato con successo'
      });
    } catch (err) {
      toastSystem.showToast({
        type: 'error',
        message: err.message || 'Errore nell\'eliminazione dell\'atleta'
      });
      throw err;
    }
  }, [toastSystem]);

  // Similar methods for teams
  const addTeam = useCallback(async (teamData) => {
    try {
      const newTeam = await api.createTeam(teamData);
      setData(prev => ({
        ...prev,
        teams: [...prev.teams, newTeam]
      }));
      
      toastSystem.showToast({
        type: 'success',
        message: 'Squadra aggiunta con successo'
      });
      
      return newTeam;
    } catch (err) {
      toastSystem.showToast({
        type: 'error',
        message: err.message || 'Errore nell\'aggiunta della squadra'
      });
      throw err;
    }
  }, [toastSystem]);

  const updateTeam = useCallback(async (id, updates) => {
    try {
      const updatedTeam = await api.updateTeam(id, updates);
      setData(prev => ({
        ...prev,
        teams: prev.teams.map(t => 
          t.id === id ? { ...t, ...updatedTeam } : t
        )
      }));
      
      toastSystem.showToast({
        type: 'success',
        message: 'Squadra aggiornata con successo'
      });
      
      return updatedTeam;
    } catch (err) {
      toastSystem.showToast({
        type: 'error',
        message: err.message || 'Errore nell\'aggiornamento della squadra'
      });
      throw err;
    }
  }, [toastSystem]);

  const deleteTeam = useCallback(async (id) => {
    try {
      await api.deleteTeam(id);
      setData(prev => ({
        ...prev,
        teams: prev.teams.filter(t => t.id !== id)
      }));
      
      toastSystem.showToast({
        type: 'success',
        message: 'Squadra eliminata con successo'
      });
    } catch (err) {
      toastSystem.showToast({
        type: 'error',
        message: err.message || 'Errore nell\'eliminazione della squadra'
      });
      throw err;
    }
  }, [toastSystem]);

  // Refresh data
  const refreshData = useCallback(() => {
    return loadApiData();
  }, [loadApiData]);

  return {
    // Data
    data,
    stats,
    loading,
    error,
    
    // Methods
    refreshData,
    
    // CRUD operations
    addAthlete,
    updateAthlete,
    deleteAthlete,
    addTeam,
    updateTeam,
    deleteTeam,
    
    // Direct access to frequently used data
    athletes: data.athletes,
    teams: data.teams,
    zones: data.zones,
    buses: data.buses,
    matches: data.matches,
    documents: data.documents,
    payments: data.payments,
    
    // Notification and Toast systems
    notifications: notificationSystem,
    toast: toastSystem
  };
};