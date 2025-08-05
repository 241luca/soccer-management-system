// components/settings/SettingsView.jsx
import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Bell, Shield, CreditCard, 
  Calendar, Globe, Users, Database, Building2,
  ChevronRight, Eye, EyeOff, Moon, Sun,
  Zap, AlertCircle, CheckCircle, ExternalLink
} from 'lucide-react';

const SettingsView = ({ user, organization, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [currentOrganization, setCurrentOrganization] = useState(organization);
  const [showOrgSelector, setShowOrgSelector] = useState(false);
  const [settings, setSettings] = useState({
    // Preferenze Utente
    userPreferences: {
      language: 'it',
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        sms: false,
        newAthlete: true,
        paymentDue: true,
        documentExpiring: true,
        matchReminder: true
      },
      displayOptions: {
        compactView: false,
        showPhotos: true,
        defaultView: 'dashboard'
      }
    },
    
    // Configurazioni Sistema
    systemConfig: {
      modules: {
        athletes: true,
        teams: true,
        payments: true,
        documents: true,
        matches: true,
        transport: true,
        reports: true,
        api: false
      },
      permissions: {
        allowGuestView: false,
        requireApproval: true,
        autoBackup: true,
        dataRetention: 365 // giorni
      }
    },
    
    // Impostazioni Economiche
    economicSettings: {
      currency: 'EUR',
      paymentMethods: ['cash', 'bank_transfer', 'credit_card'],
      defaultFees: {
        registration: 150,
        monthly: 50,
        transport: 30
      },
      paymentReminders: [30, 15, 7, 1], // giorni prima
      fiscalYear: 'calendar', // calendar o custom
      invoicePrefix: 'INV',
      receiptPrefix: 'RIC'
    },
    
    // Categorie e Campionati
    categories: [
      { id: 1, name: 'Prima Squadra', ageGroup: 'Senior', active: true },
      { id: 2, name: 'Under 19', ageGroup: '17-19', active: true },
      { id: 3, name: 'Under 17', ageGroup: '15-17', active: true },
      { id: 4, name: 'Under 15', ageGroup: '13-15', active: true }
    ],
    
    // Stagione Corrente
    currentSeason: {
      name: '2024/2025',
      startDate: '2024-09-01',
      endDate: '2025-06-30',
      isActive: true
    }
  });

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSettingChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleNestedChange = (category, subCategory, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subCategory]: {
          ...prev[category][subCategory],
          [field]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simula salvataggio
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveMessage('Impostazioni salvate con successo!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Errore nel salvataggio delle impostazioni');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Generale', icon: Settings },
    { id: 'notifications', label: 'Notifiche', icon: Bell },
    { id: 'permissions', label: 'Permessi', icon: Shield },
    { id: 'economic', label: 'Economiche', icon: CreditCard },
    { id: 'categories', label: 'Categorie', icon: Users },
    { id: 'system', label: 'Sistema', icon: Database }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Impostazioni</h1>
        <p className="text-gray-600 mt-1">
          Configura le preferenze e i parametri del sistema
        </p>
      </div>

      {/* Organization Info Card */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">
                {currentOrganization?.name || 'Organizzazione'}
              </h3>
              <p className="text-sm text-gray-600">
                {user?.role === 'SUPER_ADMIN' 
                  ? 'Stai visualizzando i dati di questa società'
                  : 'Per modificare i dati della società, vai all\'anagrafica completa'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user?.role === 'SUPER_ADMIN' && (
              <button
                onClick={() => onNavigate('organizations')}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>Gestisci Società</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('organization-details')}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <span>Apri Anagrafica</span>
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {saveMessage && (
        <div className={`mb-4 p-4 rounded-lg flex items-center ${
          saveMessage.includes('successo') 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {saveMessage.includes('successo') ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          {saveMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Preferenze Generali</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lingua
                  </label>
                  <select
                    value={settings.userPreferences.language}
                    onChange={(e) => handleSettingChange('userPreferences', 'language', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="it">Italiano</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tema
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleSettingChange('userPreferences', 'theme', 'light')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                        settings.userPreferences.theme === 'light'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      <Sun className="h-4 w-4" />
                      <span>Chiaro</span>
                    </button>
                    <button
                      onClick={() => handleSettingChange('userPreferences', 'theme', 'dark')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                        settings.userPreferences.theme === 'dark'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      <Moon className="h-4 w-4" />
                      <span>Scuro</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vista Predefinita
                  </label>
                  <select
                    value={settings.userPreferences.displayOptions.defaultView}
                    onChange={(e) => handleNestedChange('userPreferences', 'displayOptions', 'defaultView', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="dashboard">Dashboard</option>
                    <option value="athletes">Atlete</option>
                    <option value="teams">Squadre</option>
                    <option value="calendar">Calendario</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Vista Compatta</span>
                  <button
                    onClick={() => handleNestedChange('userPreferences', 'displayOptions', 'compactView', !settings.userPreferences.displayOptions.compactView)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      settings.userPreferences.displayOptions.compactView ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.userPreferences.displayOptions.compactView ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Mostra Foto</span>
                  <button
                    onClick={() => handleNestedChange('userPreferences', 'displayOptions', 'showPhotos', !settings.userPreferences.displayOptions.showPhotos)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      settings.userPreferences.displayOptions.showPhotos ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.userPreferences.displayOptions.showPhotos ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Preferenze Notifiche</h3>
              <p className="text-sm text-gray-600 mb-6">
                Scegli come e quando ricevere le notifiche dal sistema
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Canali di Notifica</h4>
                  <div className="space-y-3">
                    {['email', 'push', 'sms'].map(channel => (
                      <div key={channel} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 capitalize">
                          {channel === 'email' ? 'Email' : channel === 'push' ? 'Notifiche Push' : 'SMS'}
                        </span>
                        <button
                          onClick={() => handleNestedChange('userPreferences', 'notifications', channel, !settings.userPreferences.notifications[channel])}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                            settings.userPreferences.notifications[channel] ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            settings.userPreferences.notifications[channel] ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Tipi di Notifica</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'newAthlete', label: 'Nuova Atleta Registrata' },
                      { key: 'paymentDue', label: 'Pagamento in Scadenza' },
                      { key: 'documentExpiring', label: 'Documento in Scadenza' },
                      { key: 'matchReminder', label: 'Promemoria Partita' }
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{item.label}</span>
                        <button
                          onClick={() => handleNestedChange('userPreferences', 'notifications', item.key, !settings.userPreferences.notifications[item.key])}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                            settings.userPreferences.notifications[item.key] ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            settings.userPreferences.notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Permessi e Sicurezza</h3>
              
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800">
                        La gestione dei permessi dettagliata è disponibile solo per amministratori.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Consenti Vista Ospiti</p>
                      <p className="text-xs text-gray-500">Permetti accesso in sola lettura senza login</p>
                    </div>
                    <button
                      onClick={() => handleNestedChange('systemConfig', 'permissions', 'allowGuestView', !settings.systemConfig.permissions.allowGuestView)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        settings.systemConfig.permissions.allowGuestView ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        settings.systemConfig.permissions.allowGuestView ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Richiedi Approvazione</p>
                      <p className="text-xs text-gray-500">Nuovi utenti devono essere approvati</p>
                    </div>
                    <button
                      onClick={() => handleNestedChange('systemConfig', 'permissions', 'requireApproval', !settings.systemConfig.permissions.requireApproval)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        settings.systemConfig.permissions.requireApproval ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        settings.systemConfig.permissions.requireApproval ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Backup Automatico</p>
                      <p className="text-xs text-gray-500">Esegui backup giornaliero dei dati</p>
                    </div>
                    <button
                      onClick={() => handleNestedChange('systemConfig', 'permissions', 'autoBackup', !settings.systemConfig.permissions.autoBackup)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        settings.systemConfig.permissions.autoBackup ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        settings.systemConfig.permissions.autoBackup ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conservazione Dati (giorni)
                    </label>
                    <input
                      type="number"
                      value={settings.systemConfig.permissions.dataRetention}
                      onChange={(e) => handleNestedChange('systemConfig', 'permissions', 'dataRetention', parseInt(e.target.value))}
                      min="30"
                      max="3650"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      I dati più vecchi verranno archiviati automaticamente
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'economic' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Impostazioni Economiche</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valuta
                  </label>
                  <select
                    value={settings.economicSettings.currency}
                    onChange={(e) => handleSettingChange('economicSettings', 'currency', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dollaro ($)</option>
                    <option value="GBP">Sterlina (£)</option>
                  </select>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Quote Standard</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700">
                        Iscrizione Annuale
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">€</span>
                        </div>
                        <input
                          type="number"
                          value={settings.economicSettings.defaultFees.registration}
                          onChange={(e) => handleNestedChange('economicSettings', 'defaultFees', 'registration', parseInt(e.target.value))}
                          className="pl-7 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-700">
                        Quota Mensile
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">€</span>
                        </div>
                        <input
                          type="number"
                          value={settings.economicSettings.defaultFees.monthly}
                          onChange={(e) => handleNestedChange('economicSettings', 'defaultFees', 'monthly', parseInt(e.target.value))}
                          className="pl-7 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-700">
                        Trasporto
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">€</span>
                        </div>
                        <input
                          type="number"
                          value={settings.economicSettings.defaultFees.transport}
                          onChange={(e) => handleNestedChange('economicSettings', 'defaultFees', 'transport', parseInt(e.target.value))}
                          className="pl-7 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Promemoria Pagamenti</h4>
                  <p className="text-xs text-gray-500 mb-2">Giorni prima della scadenza</p>
                  <div className="flex space-x-2">
                    {settings.economicSettings.paymentReminders.map((days, index) => (
                      <input
                        key={index}
                        type="number"
                        value={days}
                        onChange={(e) => {
                          const newReminders = [...settings.economicSettings.paymentReminders];
                          newReminders[index] = parseInt(e.target.value);
                          handleSettingChange('economicSettings', 'paymentReminders', newReminders);
                        }}
                        className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prefisso Fatture
                    </label>
                    <input
                      type="text"
                      value={settings.economicSettings.invoicePrefix}
                      onChange={(e) => handleSettingChange('economicSettings', 'invoicePrefix', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prefisso Ricevute
                    </label>
                    <input
                      type="text"
                      value={settings.economicSettings.receiptPrefix}
                      onChange={(e) => handleSettingChange('economicSettings', 'receiptPrefix', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Categorie e Squadre</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Stagione Corrente</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700">Nome Stagione</label>
                        <input
                          type="text"
                          value={settings.currentSeason.name}
                          onChange={(e) => handleNestedChange('currentSeason', 'name', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700">Data Inizio</label>
                        <input
                          type="date"
                          value={settings.currentSeason.startDate}
                          onChange={(e) => handleNestedChange('currentSeason', 'startDate', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700">Data Fine</label>
                        <input
                          type="date"
                          value={settings.currentSeason.endDate}
                          onChange={(e) => handleNestedChange('currentSeason', 'endDate', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Categorie Attive</h4>
                  <div className="space-y-2">
                    {settings.categories.map(category => (
                      <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{category.name}</p>
                          <p className="text-sm text-gray-500">Fascia d'età: {category.ageGroup}</p>
                        </div>
                        <button
                          onClick={() => {
                            const newCategories = settings.categories.map(c =>
                              c.id === category.id ? { ...c, active: !c.active } : c
                            );
                            setSettings(prev => ({ ...prev, categories: newCategories }));
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                            category.active ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            category.active ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Moduli Sistema</h3>
              <p className="text-sm text-gray-600 mb-6">
                Attiva o disattiva i moduli del sistema in base alle tue esigenze
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(settings.systemConfig.modules).map(([module, enabled]) => (
                  <div key={module} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Zap className={`h-5 w-5 ${enabled ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {module === 'api' ? 'API' : module.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {module === 'athletes' && 'Gestione atlete e tesseramenti'}
                          {module === 'teams' && 'Gestione squadre e categorie'}
                          {module === 'payments' && 'Pagamenti e contabilità'}
                          {module === 'documents' && 'Documenti e certificati'}
                          {module === 'matches' && 'Calendario partite'}
                          {module === 'transport' && 'Gestione trasporti'}
                          {module === 'reports' && 'Report e statistiche'}
                          {module === 'api' && 'Accesso API esterni'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNestedChange('systemConfig', 'modules', module, !enabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        enabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        enabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Salvataggio...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Salva Impostazioni
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SettingsView;
