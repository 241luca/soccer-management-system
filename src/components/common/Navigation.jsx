// Navigation.jsx
import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  FileText, 
  DollarSign, 
  Bus,
  Settings,
  Bell,
  Bot,
  LogOut,
  User,
  ChevronDown,
  Key,
  UserCircle,
  Shield,
  Menu,
  X
} from 'lucide-react';
import NotificationDropdown from '../notifications/NotificationDropdown';
import OrganizationSwitcher from '../organizations/OrganizationSwitcher';

const Navigation = ({ 
  currentView, 
  setCurrentView, 
  stats, 
  notifications, 
  onViewNotifications,
  showAIAssistant,
  setShowAIAssistant,
  onLogout,
  user,
  organization,
  onOrganizationSwitch
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, badge: null },
    { id: 'athletes', label: 'Atlete', icon: Users, badge: stats.totalAthletes },
    { id: 'matches', label: 'Partite', icon: Calendar, badge: stats.upcomingMatches },
    { id: 'documents', label: 'Documenti', icon: FileText, badge: stats.expiringDocuments > 0 ? stats.expiringDocuments : null },
    { id: 'payments', label: 'Pagamenti', icon: DollarSign, badge: stats.pendingPayments > 0 ? stats.pendingPayments : null },
    { id: 'transport', label: 'Trasporti', icon: Bus, badge: stats.busUsers },
    { id: 'notifications', label: 'Notifiche', icon: Bell, badge: notifications?.unreadCount > 0 ? notifications.unreadCount : null },
    { id: 'admin', label: 'Amministrazione', icon: Settings, badge: null },
    { id: 'settings', label: 'Impostazioni', icon: Settings, badge: null }
  ];

  // Aggiungi la voce Organizzazioni solo per Super Admin
  if (user?.role === 'SUPER_ADMIN') {
    navItems.splice(8, 0, { id: 'organizations', label: 'Organizzazioni', icon: Building2, badge: null });
  }

  const handleChangePassword = () => {
    setShowUserMenu(false);
    setShowMobileMenu(false);
    setCurrentView('change-password');
  };

  const handleProfile = () => {
    setShowUserMenu(false);
    setShowMobileMenu(false);
    setCurrentView('profile');
  };

  const handleNavItemClick = (itemId) => {
    setCurrentView(itemId);
    setShowMobileMenu(false);
  };

  const getUserRoleColor = (role) => {
    switch(role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COACH':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'STAFF':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUserRoleLabel = (role) => {
    switch(role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'ADMIN':
        return 'Amministratore';
      case 'COACH':
        return 'Allenatore';
      case 'STAFF':
        return 'Staff';
      default:
        return role;
    }
  };

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center space-x-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">⚽</span>
                </div>
                <span className="text-xl font-bold text-gray-800 hidden sm:block">Soccer Manager</span>
                <span className="text-xl font-bold text-gray-800 sm:hidden">SM</span>
              </div>
            </div>

            {/* Desktop Navigation Items */}
            <div className="hidden md:flex space-x-1 flex-1 justify-center px-4">
              {navItems.slice(0, 6).map(item => (
                <button
                  key={item.id}
                  onClick={() => handleNavItemClick(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    currentView === item.id 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-2">
              {/* Organization Switcher */}
              {user && organization && onOrganizationSwitch && (
                <OrganizationSwitcher 
                  currentOrganization={organization}
                  onSwitch={onOrganizationSwitch}
                />
              )}
              {/* Desktop Only Icons */}
              <div className="hidden sm:flex items-center space-x-2">
                <NotificationDropdown 
                  notifications={notifications?.notifications || []}
                  unreadCount={notifications?.unreadCount || 0}
                  onMarkAsRead={notifications?.markAsRead}
                  onRemoveNotification={notifications?.removeNotification}
                  onViewAll={() => setCurrentView('notifications')}
                />
                
                <button 
                  onClick={() => setShowAIAssistant(!showAIAssistant)}
                  className={`p-2 rounded-lg transition-colors ${
                    showAIAssistant 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Assistente AI"
                >
                  <Bot className="h-5 w-5" />
                </button>
              </div>
              
              {/* User Menu - Always Visible */}
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                  <div className="hidden lg:flex items-center space-x-2">
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className={`text-xs px-2 py-0.5 rounded-full border ${getUserRoleColor(user?.role)}`}>
                        {getUserRoleLabel(user?.role)}
                      </p>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                
                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-20 border border-gray-200">
                      <div className="p-4 border-b bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className={`text-xs px-3 py-1 rounded-full border ${getUserRoleColor(user?.role)}`}>
                            {user?.role === 'SUPER_ADMIN' && <Shield className="inline h-3 w-3 mr-1" />}
                            {getUserRoleLabel(user?.role)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="py-1">
                        <button
                          onClick={handleProfile}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                        >
                          <UserCircle className="h-4 w-4 text-gray-500" />
                          <span>Il mio profilo</span>
                        </button>
                        
                        <button
                          onClick={handleChangePassword}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                        >
                          <Key className="h-4 w-4 text-gray-500" />
                          <span>Cambia password</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setCurrentView('settings');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                        >
                          <Settings className="h-4 w-4 text-gray-500" />
                          <span>Impostazioni</span>
                        </button>
                      </div>
                      
                      <div className="border-t">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onLogout();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Esci</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setShowMobileMenu(false)}
          />
          
          {/* Mobile Menu Panel */}
          <div className="md:hidden fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-40 overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">⚽</span>
                  </div>
                  <span className="text-lg font-bold text-gray-800">Soccer Manager</span>
                </div>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-1 rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Mobile Navigation Items */}
            <div className="py-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleNavItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                    currentView === item.id 
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
              
              {/* Mobile Only Actions */}
              <div className="border-t mt-2 pt-2">
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    setShowAIAssistant(!showAIAssistant);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                    showAIAssistant 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Bot className="h-5 w-5" />
                    <span className="font-medium">Assistente AI</span>
                  </div>
                </button>
              </div>
            </div>
            
            {/* User Info Section */}
            <div className="absolute bottom-0 left-0 right-0 border-t bg-gray-50 p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  onLogout();
                }}
                className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Esci</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navigation;
