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

const SoccerManagementApp = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const { data, loading, stats, notifications, toast } = useData();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        api.setToken(token);
        console.log('User loaded:', userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setAuthLoading(false);
  }, []);

  const handleLogin = (userData) => {
    console.log('Login successful:', userData);
    setUser(userData);
    toast.showSuccess(`Benvenuto ${userData.firstName || 'Utente'} ${userData.lastName || ''}!`);
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setCurrentView('dashboard');
    toast.showInfo('Logout effettuato con successo');
  };

  const handleViewChange = (view) => {
    console.log('Changing view to:', view);
    if (view === 'change-password') {
      setShowChangePassword(true);
    } else {
      setCurrentView(view);
    }
  };

  if (authLoading || loading) {
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
            data={data}
            stats={stats}
            selectedTeam={selectedTeam}
            setSelectedTeam={setSelectedTeam}
            toast={toast}
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
