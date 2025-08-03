// components/notifications/NotificationDemo.jsx
import React from 'react';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info,
  FileText,
  DollarSign,
  Calendar,
  Bus,
  Users
} from 'lucide-react';

const NotificationDemo = ({ toast, notifications }) => {
  
  const demoToasts = [
    { type: 'success', message: 'Operazione completata con successo!' },
    { type: 'error', message: 'Errore durante il salvataggio dei dati' },
    { type: 'warning', message: 'Attenzione: alcuni documenti sono in scadenza' },
    { type: 'info', message: 'Nuovo aggiornamento disponibile' }
  ];

  const demoNotifications = [
    {
      type: 'document_expiry',
      title: 'Certificato Medico in Scadenza',
      message: 'Il certificato medico di Sofia Martini scade tra 5 giorni',
      severity: 'warning'
    },
    {
      type: 'payment_overdue',
      title: 'Pagamento in Ritardo',
      message: 'Laura Bianchi ha pagamenti in sospeso per €150',
      severity: 'error'
    },
    {
      type: 'age_violation',
      title: 'Violazione Categoria Età',
      message: 'Elena Rossi non rispetta i limiti di età per Under 15',
      severity: 'error'
    },
    {
      type: 'match_reminder',
      title: 'Partita Programmata',
      message: 'Under 17 vs AC Milan Academy domani alle 15:30',
      severity: 'info'
    },
    {
      type: 'transport_alert',
      title: 'Pulmino Sovraffollato',
      message: 'Pulmino Nord: 18 persone prenotate su 16 posti',
      severity: 'warning'
    }
  ];

  const handleTestToast = (toastConfig) => {
    toast[`show${toastConfig.type.charAt(0).toUpperCase() + toastConfig.type.slice(1)}`]?.(
      toastConfig.message,
      5000
    );
  };

  const handleTestNotification = (notificationConfig) => {
    notifications.addNotification({
      ...notificationConfig,
      relatedEntity: { type: 'test', id: Date.now() },
      actions: [
        { label: 'Visualizza', action: 'view_test', style: 'primary' },
        { label: 'Ignora', action: 'ignore_test', style: 'secondary' }
      ]
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'error': return AlertCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      case 'document_expiry': return FileText;
      case 'payment_overdue': return DollarSign;
      case 'age_violation': return Users;
      case 'match_reminder': return Calendar;
      case 'transport_alert': return Bus;
      default: return Bell;
    }
  };

  const getColorClass = (type, severity) => {
    if (type === 'success') return 'text-green-600';
    if (type === 'error' || severity === 'error') return 'text-red-600';
    if (type === 'warning' || severity === 'warning') return 'text-yellow-600';
    return 'text-blue-600';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Bell className="h-6 w-6 mr-2 text-blue-600" />
          Demo Sistema Notifiche
        </h1>
        
        <div className="text-sm text-gray-600 mb-6">
          Questo è un ambiente di test per verificare il funzionamento del sistema notifiche.
          Puoi testare toast temporanei e notifiche persistenti.
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{notifications.notifications.length}</div>
            <div className="text-sm text-blue-600">Notifiche Totali</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{notifications.unreadCount}</div>
            <div className="text-sm text-orange-600">Non Lette</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{notifications.notifications.filter(n => n.isRead).length}</div>
            <div className="text-sm text-green-600">Lette</div>
          </div>
        </div>
      </div>

      {/* Toast Demo */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Toast Notifications</h2>
        <p className="text-sm text-gray-600 mb-4">
          I toast sono notifiche temporanee che appaiono nell'angolo superiore destro per pochi secondi.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {demoToasts.map((toast_config, index) => {
            const Icon = getIcon(toast_config.type);
            return (
              <button
                key={index}
                onClick={() => handleTestToast(toast_config)}
                className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                  toast_config.type === 'success' ? 'border-green-200 bg-green-50 hover:bg-green-100' :
                  toast_config.type === 'error' ? 'border-red-200 bg-red-50 hover:bg-red-100' :
                  toast_config.type === 'warning' ? 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100' :
                  'border-blue-200 bg-blue-50 hover:bg-blue-100'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Icon className={`h-5 w-5 ${getColorClass(toast_config.type)}`} />
                  <span className="font-medium capitalize">{toast_config.type}</span>
                </div>
                <p className="text-sm text-gray-600">{toast_config.message}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification Demo */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Persistent Notifications</h2>
        <p className="text-sm text-gray-600 mb-4">
          Le notifiche persistenti rimangono visibili nel centro notifiche fino a quando non vengono rimosse.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {demoNotifications.map((notification, index) => {
            const Icon = getIcon(notification.type);
            return (
              <button
                key={index}
                onClick={() => handleTestNotification(notification)}
                className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                  notification.severity === 'error' ? 'border-red-200 bg-red-50 hover:bg-red-100' :
                  notification.severity === 'warning' ? 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100' :
                  'border-blue-200 bg-blue-50 hover:bg-blue-100'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Icon className={`h-5 w-5 ${getColorClass(notification.type, notification.severity)}`} />
                  <span className="font-medium">{notification.title}</span>
                </div>
                <p className="text-sm text-gray-600">{notification.message}</p>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    notification.severity === 'error' ? 'bg-red-100 text-red-600' :
                    notification.severity === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {notification.type.replace('_', ' ')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions Demo */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              notifications.markAllAsRead();
              toast.showSuccess('Tutte le notifiche sono state segnate come lette');
            }}
            className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-green-900">Segna tutto come letto</div>
          </button>
          
          <button
            onClick={() => {
              notifications.clearAllNotifications();
              toast.showInfo('Tutte le notifiche sono state cancellate');
            }}
            className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <AlertCircle className="h-6 w-6 text-gray-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">Cancella tutte</div>
          </button>
          
          <button
            onClick={() => {
              toast.showInfo('Test notifica automatica attivato');
              setTimeout(() => {
                notifications.addNotification({
                  type: 'system',
                  title: 'Test Automatico',
                  message: 'Questa è una notifica generata automaticamente dopo 3 secondi',
                  severity: 'info',
                  actions: [
                    { label: 'OK', action: 'dismiss', style: 'primary' }
                  ]
                });
                toast.showSuccess('Notifica automatica creata!');
              }, 3000);
            }}
            className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Bell className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-blue-900">Test Automatico</div>
          </button>
        </div>
      </div>

      {/* Settings Demo */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Impostazioni Correnti</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Promemoria Documenti</h3>
            <div className="text-sm text-gray-600">
              {notifications.settings.documentExpiryDays?.join(', ')} giorni prima della scadenza
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Promemoria Pagamenti</h3>
            <div className="text-sm text-gray-600">
              {notifications.settings.paymentReminderDays?.join(', ')} giorni prima della scadenza
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Notifiche Attive</h3>
            <div className="space-y-1 text-sm">
              <div className={`${notifications.settings.enableDocumentAlerts ? 'text-green-600' : 'text-red-600'}`}>
                {notifications.settings.enableDocumentAlerts ? '✓' : '✗'} Scadenze Documenti
              </div>
              <div className={`${notifications.settings.enablePaymentAlerts ? 'text-green-600' : 'text-red-600'}`}>
                {notifications.settings.enablePaymentAlerts ? '✓' : '✗'} Promemoria Pagamenti
              </div>
              <div className={`${notifications.settings.enableAgeViolationAlerts ? 'text-green-600' : 'text-red-600'}`}>
                {notifications.settings.enableAgeViolationAlerts ? '✓' : '✗'} Violazioni Età
              </div>
              <div className={`${notifications.settings.enableMatchReminders ? 'text-green-600' : 'text-red-600'}`}>
                {notifications.settings.enableMatchReminders ? '✓' : '✗'} Promemoria Partite
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Metodi Attivi</h3>
            <div className="space-y-1 text-sm">
              <div className={`${notifications.settings.enablePushNotifications ? 'text-green-600' : 'text-red-600'}`}>
                {notifications.settings.enablePushNotifications ? '✓' : '✗'} Notifiche Browser
              </div>
              <div className={`${notifications.settings.enableToastNotifications ? 'text-green-600' : 'text-red-600'}`}>
                {notifications.settings.enableToastNotifications ? '✓' : '✗'} Toast Notifications
              </div>
              <div className={`${notifications.settings.enableEmailNotifications ? 'text-green-600' : 'text-red-600'}`}>
                {notifications.settings.enableEmailNotifications ? '✓' : '✗'} Email Notifications
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDemo;
