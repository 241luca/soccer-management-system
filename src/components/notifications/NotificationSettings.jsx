// components/notifications/NotificationSettings.jsx
import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  Mail, 
  MessageSquare, 
  Clock, 
  AlertTriangle,
  Calendar,
  Bus,
  DollarSign,
  FileText,
  Save,
  RotateCcw,
  Plus,
  X
} from 'lucide-react';

const NotificationSettings = ({ settings, onSave, onClose }) => {
  const [localSettings, setLocalSettings] = useState({
    // Document expiry notifications
    documentExpiryDays: settings.documentExpiryDays || [30, 15, 7],
    enableDocumentAlerts: settings.enableDocumentAlerts ?? true,
    
    // Payment reminders
    paymentReminderDays: settings.paymentReminderDays || [15, 7, 1],
    enablePaymentAlerts: settings.enablePaymentAlerts ?? true,
    
    // Age violation alerts
    enableAgeViolationAlerts: settings.enableAgeViolationAlerts ?? true,
    
    // Match reminders
    enableMatchReminders: settings.enableMatchReminders ?? true,
    matchReminderDays: settings.matchReminderDays || [1],
    
    // Transport alerts
    enableTransportAlerts: settings.enableTransportAlerts ?? true,
    
    // Delivery methods
    enablePushNotifications: settings.enablePushNotifications ?? true,
    enableEmailNotifications: settings.enableEmailNotifications ?? false,
    enableSMSNotifications: settings.enableSMSNotifications ?? false,
    
    // UI preferences
    enableToastNotifications: settings.enableToastNotifications ?? true,
    toastDuration: settings.toastDuration || 5000,
    maxNotificationsDisplay: settings.maxNotificationsDisplay || 50
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleArraySettingChange = (key, index, value) => {
    const newArray = [...localSettings[key]];
    if (value === '' || value === null) {
      newArray.splice(index, 1);
    } else {
      newArray[index] = parseInt(value);
    }
    handleSettingChange(key, newArray.sort((a, b) => b - a));
  };

  const addDayToArray = (key) => {
    const currentArray = localSettings[key];
    const newDay = key === 'documentExpiryDays' ? 30 : 7;
    if (!currentArray.includes(newDay)) {
      handleSettingChange(key, [...currentArray, newDay].sort((a, b) => b - a));
    }
  };

  const removeDayFromArray = (key, index) => {
    const newArray = [...localSettings[key]];
    newArray.splice(index, 1);
    handleSettingChange(key, newArray);
  };

  const handleSave = () => {
    onSave(localSettings);
    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900">{label}</span>
        </div>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const DaysInput = ({ days, onChange, onAdd, onRemove, label, placeholder = "Giorni" }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="space-y-2">
        {days.map((day, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="number"
              value={day}
              onChange={(e) => onChange(index, e.target.value)}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              min="1"
              max="365"
            />
            <span className="text-sm text-gray-500">giorni prima</span>
            {days.length > 1 && (
              <button
                onClick={() => onRemove(index)}
                className="p-1 text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={onAdd}
          className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Aggiungi promemoria</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Impostazioni Notifiche</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Document Expiry Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Scadenze Documenti</h3>
            </div>
            
            <ToggleSwitch
              enabled={localSettings.enableDocumentAlerts}
              onChange={(value) => handleSettingChange('enableDocumentAlerts', value)}
              label="Abilita alert documenti"
              description="Ricevi notifiche per documenti in scadenza"
            />

            {localSettings.enableDocumentAlerts && (
              <DaysInput
                days={localSettings.documentExpiryDays}
                onChange={(index, value) => handleArraySettingChange('documentExpiryDays', index, value)}
                onAdd={() => addDayToArray('documentExpiryDays')}
                onRemove={(index) => removeDayFromArray('documentExpiryDays', index)}
                label="Promemoria scadenze"
              />
            )}
          </div>

          {/* Payment Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Pagamenti</h3>
            </div>
            
            <ToggleSwitch
              enabled={localSettings.enablePaymentAlerts}
              onChange={(value) => handleSettingChange('enablePaymentAlerts', value)}
              label="Abilita promemoria pagamenti"
              description="Ricevi notifiche per pagamenti in ritardo"
            />

            {localSettings.enablePaymentAlerts && (
              <DaysInput
                days={localSettings.paymentReminderDays}
                onChange={(index, value) => handleArraySettingChange('paymentReminderDays', index, value)}
                onAdd={() => addDayToArray('paymentReminderDays')}
                onRemove={(index) => removeDayFromArray('paymentReminderDays', index)}
                label="Promemoria pagamenti"
              />
            )}
          </div>

          {/* Age Violation Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Violazioni Età</h3>
            </div>
            
            <ToggleSwitch
              enabled={localSettings.enableAgeViolationAlerts}
              onChange={(value) => handleSettingChange('enableAgeViolationAlerts', value)}
              label="Abilita alert violazioni età"
              description="Ricevi notifiche per atlete fuori categoria"
            />
          </div>

          {/* Match Reminders */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Promemoria Partite</h3>
            </div>
            
            <ToggleSwitch
              enabled={localSettings.enableMatchReminders}
              onChange={(value) => handleSettingChange('enableMatchReminders', value)}
              label="Abilita promemoria partite"
              description="Ricevi notifiche per partite programmate"
            />

            {localSettings.enableMatchReminders && (
              <DaysInput
                days={localSettings.matchReminderDays}
                onChange={(index, value) => handleArraySettingChange('matchReminderDays', index, value)}
                onAdd={() => addDayToArray('matchReminderDays')}
                onRemove={(index) => removeDayFromArray('matchReminderDays', index)}
                label="Promemoria partite"
              />
            )}
          </div>

          {/* Transport Alerts */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Bus className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Trasporti</h3>
            </div>
            
            <ToggleSwitch
              enabled={localSettings.enableTransportAlerts}
              onChange={(value) => handleSettingChange('enableTransportAlerts', value)}
              label="Abilita alert trasporti"
              description="Ricevi notifiche per pulmini sovraffollati"
            />
          </div>

          {/* Delivery Methods */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Metodi di Notifica</h3>
            </div>
            
            <div className="space-y-3">
              <ToggleSwitch
                enabled={localSettings.enablePushNotifications}
                onChange={(value) => handleSettingChange('enablePushNotifications', value)}
                label="Notifiche Browser"
                description="Mostra notifiche nel browser (richiede permesso)"
              />
              
              <ToggleSwitch
                enabled={localSettings.enableToastNotifications}
                onChange={(value) => handleSettingChange('enableToastNotifications', value)}
                label="Toast Notifications"
                description="Mostra notifiche temporanee sulle azioni"
              />
              
              <ToggleSwitch
                enabled={localSettings.enableEmailNotifications}
                onChange={(value) => handleSettingChange('enableEmailNotifications', value)}
                label="Notifiche Email"
                description="Invia notifiche via email (in sviluppo)"
              />
              
              <ToggleSwitch
                enabled={localSettings.enableSMSNotifications}
                onChange={(value) => handleSettingChange('enableSMSNotifications', value)}
                label="Notifiche SMS"
                description="Invia notifiche via SMS (in sviluppo)"
              />
            </div>
          </div>

          {/* UI Preferences */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Preferenze Interfaccia</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durata Toast (millisecondi)
                </label>
                <input
                  type="number"
                  value={localSettings.toastDuration}
                  onChange={(e) => handleSettingChange('toastDuration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="1000"
                  max="10000"
                  step="500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max notifiche mostrate
                </label>
                <input
                  type="number"
                  value={localSettings.maxNotificationsDisplay}
                  onChange={(e) => handleSettingChange('maxNotificationsDisplay', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="10"
                  max="200"
                  step="10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Ripristina</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annulla
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                <span>Salva Impostazioni</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
