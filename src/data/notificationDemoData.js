// data/notificationDemoData.js

export const generateDemoNotifications = () => {
  const now = new Date();
  
  return [
    {
      id: 1,
      type: 'document_expiry',
      title: 'Certificato Medico in Scadenza',
      message: 'Il certificato medico di Maria Rossi scade tra 7 giorni',
      severity: 'warning',
      isRead: false,
      isPersistent: true,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 ore fa
      expiresAt: null,
      relatedEntity: { type: 'athlete', id: 1, docType: 'medical' },
      actions: [
        { label: 'Visualizza Atleta', action: 'view_athlete', style: 'primary' },
        { label: 'Documenti', action: 'view_documents', style: 'secondary' }
      ]
    },
    {
      id: 2,
      type: 'payment_overdue',
      title: 'Pagamento in Ritardo',
      message: 'Giulia Bianchi ha pagamenti in sospeso per la quota sociale',
      severity: 'error',
      isRead: false,
      isPersistent: true,
      createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 ore fa
      expiresAt: null,
      relatedEntity: { type: 'athlete', id: 15 },
      actions: [
        { label: 'Visualizza Atleta', action: 'view_athlete', style: 'primary' },
        { label: 'Pagamenti', action: 'view_payments', style: 'secondary' }
      ]
    },
    {
      id: 3,
      type: 'age_violation',
      title: 'Violazione Categoria Età',
      message: 'Elena Verdi non rispetta i limiti di età per la categoria Under 15',
      severity: 'error',
      isRead: true,
      isPersistent: true,
      createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 ore fa
      expiresAt: null,
      relatedEntity: { type: 'athlete', id: 8 },
      actions: [
        { label: 'Visualizza Atleta', action: 'view_athlete', style: 'primary' },
        { label: 'Impostazioni', action: 'view_settings', style: 'secondary' }
      ]
    },
    {
      id: 4,
      type: 'match_reminder',
      title: 'Partita Programmata Domani',
      message: 'Under 17 vs Juventus Academy - 15:30',
      severity: 'info',
      isRead: false,
      isPersistent: true,
      createdAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 minuti fa
      expiresAt: null,
      relatedEntity: { type: 'match', id: 1 },
      actions: [
        { label: 'Visualizza Partita', action: 'view_match', style: 'primary' },
        { label: 'Calendario', action: 'view_matches', style: 'secondary' }
      ]
    },
    {
      id: 5,
      type: 'transport_alert',
      title: 'Pulmino Sovraffollato',
      message: 'Il Pulmino Nord ha 18 persone prenotate su 16 posti disponibili',
      severity: 'warning',
      isRead: false,
      isPersistent: true,
      createdAt: new Date(now.getTime() - 45 * 60 * 1000), // 45 minuti fa
      expiresAt: null,
      relatedEntity: { type: 'transport', id: 1 },
      actions: [
        { label: 'Gestisci Trasporti', action: 'view_transport', style: 'primary' }
      ]
    },
    {
      id: 6,
      type: 'document_expiry',
      title: 'Assicurazione in Scadenza',
      message: 'L\'assicurazione di Francesca Neri scade tra 15 giorni',
      severity: 'info',
      isRead: true,
      isPersistent: true,
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 giorno fa
      expiresAt: null,
      relatedEntity: { type: 'athlete', id: 23, docType: 'insurance' },
      actions: [
        { label: 'Visualizza Atleta', action: 'view_athlete', style: 'primary' },
        { label: 'Documenti', action: 'view_documents', style: 'secondary' }
      ]
    },
    {
      id: 7,
      type: 'system',
      title: 'Aggiornamento Sistema',
      message: 'È disponibile una nuova versione del sistema con miglioramenti alle notifiche',
      severity: 'info',
      isRead: false,
      isPersistent: true,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 giorni fa
      expiresAt: null,
      relatedEntity: { type: 'system', id: 'update_v2.1' },
      actions: [
        { label: 'Visualizza Dettagli', action: 'view_system', style: 'primary' }
      ]
    }
  ];
};

export const generateNotificationSettings = () => {
  return {
    documentExpiryDays: [30, 15, 7],
    paymentReminderDays: [15, 7, 1],
    enablePushNotifications: true,
    enableEmailNotifications: false,
    enableSMSNotifications: false,
    enableAgeViolationAlerts: true,
    enableMatchReminders: true,
    enableTransportAlerts: true,
    enableDocumentAlerts: true,
    enablePaymentAlerts: true,
    enableToastNotifications: true,
    toastDuration: 5000,
    maxNotificationsDisplay: 50,
    matchReminderDays: [1]
  };
};
