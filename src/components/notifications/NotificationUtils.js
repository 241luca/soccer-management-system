// components/notifications/NotificationUtils.js

// Utility functions for notifications
export const createNotificationFromAction = (actionType, entityData, options = {}) => {
  const baseNotification = {
    isPersistent: false,
    createdAt: new Date(),
    expiresAt: null,
    actions: [],
    ...options
  };

  switch (actionType) {
    case 'athlete_saved':
      return {
        ...baseNotification,
        type: 'system',
        title: 'Atleta Salvata',
        message: `I dati di ${entityData.name} sono stati salvati con successo`,
        severity: 'success'
      };
      
    case 'export_completed':
      return {
        ...baseNotification,
        type: 'system',
        title: 'Esportazione Completata',
        message: `Export ${entityData.format.toUpperCase()} completato con successo`,
        severity: 'success',
        actions: [
          { label: 'Scarica File', action: 'download_file', style: 'primary' }
        ]
      };
      
    case 'export_failed':
      return {
        ...baseNotification,
        type: 'system',
        title: 'Errore Esportazione',
        message: `Errore durante l'esportazione ${entityData.format.toUpperCase()}`,
        severity: 'error'
      };
      
    case 'data_imported':
      return {
        ...baseNotification,
        type: 'system',
        title: 'Importazione Completata',
        message: `Importati ${entityData.count} elementi con successo`,
        severity: 'success'
      };
      
    case 'backup_completed':
      return {
        ...baseNotification,
        type: 'system',
        title: 'Backup Completato',
        message: 'Backup dei dati completato con successo',
        severity: 'success'
      };
      
    default:
      return {
        ...baseNotification,
        type: 'system',
        title: 'Operazione Completata',
        message: 'L\'operazione è stata completata',
        severity: 'info'
      };
  }
};

// Convert notification triggers to appropriate toast messages
export const getToastFromNotification = (notification) => {
  const messages = {
    'document_expiry': {
      title: 'Documento in Scadenza',
      type: 'warning'
    },
    'payment_overdue': {
      title: 'Pagamento in Ritardo',
      type: 'error'
    },
    'age_violation': {
      title: 'Violazione Età',
      type: 'error'
    },
    'match_reminder': {
      title: 'Promemoria Partita',
      type: 'info'
    },
    'transport_alert': {
      title: 'Alert Trasporto',
      type: 'warning'
    },
    'system': {
      title: 'Notifica Sistema',
      type: 'info'
    }
  };

  const config = messages[notification.type] || messages['system'];
  
  return {
    type: config.type,
    message: notification.message,
    duration: notification.severity === 'error' ? 7000 : 5000
  };
};

// Browser Push Notification support
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const showBrowserNotification = (title, options = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }

  const notification = new Notification(title, {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'soccer-manager',
    renotify: true,
    ...options
  });

  // Auto close after 5 seconds
  setTimeout(() => {
    notification.close();
  }, 5000);

  return notification;
};

// Email notification placeholder (for future implementation)
export const sendEmailNotification = async (notification, recipients) => {
  console.log('Email notification would be sent:', {
    notification,
    recipients,
    timestamp: new Date().toISOString()
  });
  
  // TODO: Implement actual email sending
  return Promise.resolve({ sent: false, reason: 'Email service not implemented' });
};

// SMS notification placeholder (for future implementation)
export const sendSMSNotification = async (notification, phoneNumbers) => {
  console.log('SMS notification would be sent:', {
    notification,
    phoneNumbers,
    timestamp: new Date().toISOString()
  });
  
  // TODO: Implement actual SMS sending
  return Promise.resolve({ sent: false, reason: 'SMS service not implemented' });
};
