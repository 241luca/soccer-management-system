// App.jsx
import React, { useState, useEffect } from 'react';
import { useData } from './hooks/useData';
import { api } from './services/api';

// Components
import LoadingScreen from './components/common/LoadingScreen';
import Navigation from './components/common/Navigation';
import LoginPage from './components/auth/LoginPage';
import ChangePassword from './components/auth/ChangePassword';
import DashboardView from './components/dashboard/DashboardView';
import AthletesView from './components/athletes/AthletesView';
import SettingsView from './components/settings/SettingsView';
import MatchesView from './components/matches/MatchesView';
import DocumentsView from './components/documents/DocumentsView';
import PaymentsView from './components/payments/PaymentsView';
import TransportView from './components/transport/TransportView';
import AIAssistant from './components/ai/AIAssistant';
import NotificationCenter from './components/notifications/NotificationCenter';
import ToastContainer from './components/notifications/ToastContainer';
import NotificationDemo from './components/notifications/NotificationDemo';
import AdminDashboard from './components/admin/AdminDashboard';
import ConfigurationManager from './components/admin/ConfigurationManager';
import OrganizationList from './components/organizations/OrganizationList';
import OrganizationForm from './components/organizations/OrganizationForm';
import OrganizationDetails from './components/organizations/OrganizationDetails';

const SoccerManagementApp = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const { data, loading, stats, notifications, toast } = useData();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    const storedOrganization = localStorage.getItem('organization');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        api.setToken(token);
        console.log('User loaded:', userData);
        
        // Load organization if available
        if (storedOrganization) {
          const orgData = JSON.parse(storedOrganization);
          setOrganization(orgData);
          console.log('Organization loaded:', orgData);
        } else if (userData.role === 'SUPER_ADMIN' || userData.isSuperAdmin) {
          // Super Admin gets Demo organization by default - load full details
          loadDefaultOrganization();
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('organization');
      }
    }
    setAuthLoading(false);
  }, []);

  // Funzione globale per mostrare toast
  useEffect(() => {
    window.showToast = (type, message) => {
      toast[`show${type.charAt(0).toUpperCase() + type.slice(1)}`](message);
    };
    
    return () => {
      delete window.showToast;
    };
  }, [toast]);

  const handleLogin = (loginData) => {
    console.log('Login successful:', loginData);
    // Il login può restituire sia userData che un oggetto con user e organization
    if (loginData.user) {
      setUser(loginData.user);
      setOrganization(loginData.organization);
      // Salva anche l'organizzazione nel localStorage
      if (loginData.organization) {
        localStorage.setItem('organization', JSON.stringify(loginData.organization));
      }
      toast.showSuccess(`Benvenuto ${loginData.user.firstName || 'Utente'} ${loginData.user.lastName || ''}!`);
    } else {
      // Compatibilità con il vecchio formato
      setUser(loginData);
      toast.showSuccess(`Benvenuto ${loginData.firstName || 'Utente'} ${loginData.lastName || ''}!`);
    }
  };

  const handleOrganizationSwitch = (switchData) => {
    console.log('Organization switched:', switchData);
    setOrganization(switchData.organization);
    // Il componente OrganizationSwitcher già ricarica la pagina
  };

  const loadDefaultOrganization = async () => {
    try {
      const demoOrgId = '43c973a6-5e20-43af-a295-805f1d7c86b1';
      const response = await api.get(`/organizations/${demoOrgId}/details`);
      const orgData = response.data || response;
      
      setOrganization(orgData);
      localStorage.setItem('organization', JSON.stringify(orgData));
      console.log('Super Admin - Demo organization loaded with full details:', orgData);
    } catch (error) {
      console.error('Error loading default organization:', error);
      // Fallback to basic data if API fails
      const basicOrg = {
        id: '43c973a6-5e20-43af-a295-805f1d7c86b1',
        name: 'Demo Soccer Club',
        code: 'DEMO'
      };
      setOrganization(basicOrg);
      localStorage.setItem('organization', JSON.stringify(basicOrg));
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setCurrentView('dashboard');
    toast.showInfo('Logout effettuato con successo');
  };

  const handleChangeOrganization = async (orgId) => {
    try {
      // Carica i dettagli completi dell'organizzazione
      const response = await api.get(`/organizations/${orgId}/details`);
      const orgData = response.data || response;
      
      // Aggiorna il contesto con tutti i dati
      setOrganization(orgData);
      localStorage.setItem('organization', JSON.stringify(orgData));
      
      // Torna alle impostazioni
      setCurrentView('settings');
      toast.showSuccess(`Ora stai lavorando con: ${orgData.name}`);
      
      // Ricarica i dati per il nuovo contesto
      if (data.refreshData) {
        data.refreshData();
      }
    } catch (error) {
      console.error('Error changing organization:', error);
      toast.showError('Errore nel cambio organizzazione');
    }
  };

  const handleViewChange = (view) => {
    console.log('Changing view to:', view);
    if (view === 'change-password') {
      setShowChangePassword(true);
    } else {
      setCurrentView(view);
    }
  };

  // Only show loading screen for auth, not for data
  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView 
            data={data}
            stats={stats}
            setCurrentView={setCurrentView}
            setSelectedTeam={setSelectedTeam}
            setShowAIAssistant={setShowAIAssistant}
          />
        );
      case 'athletes':
        return (
          <AthletesView 
            data={data}
            stats={stats}
            selectedTeam={selectedTeam}
            searchTerm={searchTerm}
            setSelectedTeam={setSelectedTeam}
            setSearchTerm={setSearchTerm}
            notifications={notifications}
            toast={toast}
          />
        );
      case 'matches':
        return (
          <MatchesView 
            data={data}
            toast={toast}
          />
        );
      case 'documents':
        return (
          <DocumentsView 
            data={data}
            toast={toast}
          />
        );
      case 'payments':
        return (
          <PaymentsView 
            data={data}
            toast={toast}
          />
        );
      case 'transport':
        return (
          <TransportView 
            data={data}
            toast={toast}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            user={user}
            organization={organization}
            onNavigate={handleViewChange}
          />
        );
      case 'organization-details':
        return (
          <OrganizationDetails 
            organizationId={selectedOrganizationId || organization?.id}
            canEdit={user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'}
            onBack={() => {
              // Torna sempre alle impostazioni
              setSelectedOrganizationId(null);
              setCurrentView('settings');
            }}
          />
        );
      case 'notifications':
        return (
          <NotificationCenter
            notifications={notifications}
            toast={toast}
          />
        );
      case 'notification-demo':
        return (
          <NotificationDemo
            notifications={notifications}
            toast={toast}
          />
        );
      case 'admin':
        return (
          <AdminDashboard
            data={data}
            stats={stats}
            toast={toast}
          />
        );
      case 'admin-config':
        return (
          <ConfigurationManager
            toast={toast}
          />
        );
      case 'organizations':
        return (
          <OrganizationList 
            onNavigate={(view, params) => {
              if (params?.orgId) {
                // Store orgId for edit/details view
                setSelectedOrganizationId(params.orgId);
              }
              setCurrentView(view);
            }}
            onSelectOrganization={user?.role === 'SUPER_ADMIN' || user?.isSuperAdmin ? handleChangeOrganization : null}
          />
        );
      case 'organizations-new':
        return (
          <OrganizationForm 
            onNavigate={setCurrentView}
          />
        );
      case 'organizations-edit':
        return (
          <OrganizationForm 
            organizationId={selectedOrganizationId}
            onNavigate={setCurrentView}
          />
        );
      case 'profile':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Il Mio Profilo</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nome</label>
                <p className="text-lg">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ruolo</label>
                <p className="text-lg">{user.role}</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <DashboardView 
            data={data}
            stats={stats}
            setCurrentView={setCurrentView}
            setSelectedTeam={setSelectedTeam}
            setShowAIAssistant={setShowAIAssistant}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentView={currentView}
        setCurrentView={handleViewChange}
        stats={stats}
        showAIAssistant={showAIAssistant}
        setShowAIAssistant={setShowAIAssistant}
        notifications={notifications}
        onLogout={handleLogout}
        user={user}
        organization={organization}
        onOrganizationSwitch={handleOrganizationSwitch}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentView()}
      </main>

      {showAIAssistant && (
        <AIAssistant
          data={data}
          onClose={() => setShowAIAssistant(false)}
        />
      )}

      {showChangePassword && (
        <ChangePassword
          user={user}
          onClose={() => setShowChangePassword(false)}
        />
      )}
      
      <ToastContainer toasts={toast.toasts} />
    </div>
  );
};

export default SoccerManagementApp;
