// hooks/useNotifications.js
import { useState, useCallback, useEffect } from 'react';
import { generateDemoNotifications, generateNotificationSettings } from '../data/notificationDemoData';

let globalNotificationId = 0;

export const useNotifications = () => {
  const [notifications, setNotifications] = useState(generateDemoNotifications());
  const [settings, setSettings] = useState(generateNotificationSettings());

  const generateId = () => {
    globalNotificationId += 1;
    return globalNotificationId;
  };

  const addNotification = useCallback((notificationData) => {
    const notification = {
      id: generateId(),
      isRead: false,
      isPersistent: true,
      createdAt: new Date(),
      expiresAt: null,
      actions: [],
      ...notificationData
    };

    setNotifications(prev => [notification, ...prev]);
    return notification.id;
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  const markAsUnread = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: false }
          : notification
      )
    );
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Auto-triggers per notifiche automatiche
  const checkDocumentExpiry = useCallback((athletes) => {
    if (!settings.documentExpiryDays?.length) return;

    const today = new Date();
    
    settings.documentExpiryDays.forEach(days => {
      const checkDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
      
      athletes.forEach(athlete => {
        // Check medical expiry
        const medicalExpiry = new Date(athlete.medicalExpiry);
        if (medicalExpiry.toDateString() === checkDate.toDateString()) {
          const existingNotification = notifications.find(n => 
            n.type === 'document_expiry' && 
            n.relatedEntity?.id === athlete.id &&
            n.relatedEntity?.docType === 'medical'
          );

          if (!existingNotification) {
            addNotification({
              type: 'document_expiry',
              title: 'Certificato Medico in Scadenza',
              message: `Il certificato medico di ${athlete.name} ${athlete.surname} scade tra ${days} giorni`,
              severity: days <= 7 ? 'error' : days <= 15 ? 'warning' : 'info',
              relatedEntity: { type: 'athlete', id: athlete.id, docType: 'medical' },
              actions: [
                { label: 'Visualizza Atleta', action: 'view_athlete', style: 'primary' },
                { label: 'Documenti', action: 'view_documents', style: 'secondary' }
              ]
            });
          }
        }

        // Check insurance expiry
        const insuranceExpiry = new Date(athlete.insuranceExpiry);
        if (insuranceExpiry.toDateString() === checkDate.toDateString()) {
          const existingNotification = notifications.find(n => 
            n.type === 'document_expiry' && 
            n.relatedEntity?.id === athlete.id &&
            n.relatedEntity?.docType === 'insurance'
          );

          if (!existingNotification) {
            addNotification({
              type: 'document_expiry',
              title: 'Assicurazione in Scadenza',
              message: `L'assicurazione di ${athlete.name} ${athlete.surname} scade tra ${days} giorni`,
              severity: days <= 7 ? 'error' : days <= 15 ? 'warning' : 'info',
              relatedEntity: { type: 'athlete', id: athlete.id, docType: 'insurance' },
              actions: [
                { label: 'Visualizza Atleta', action: 'view_athlete', style: 'primary' },
                { label: 'Documenti', action: 'view_documents', style: 'secondary' }
              ]
            });
          }
        }
      });
    });
  }, [settings.documentExpiryDays, notifications, addNotification]);

  const checkPaymentOverdue = useCallback((athletes) => {
    if (!settings.paymentReminderDays?.length) return;

    const overdueAthletes = athletes.filter(a => a.feeStatus === 'pending');
    
    overdueAthletes.forEach(athlete => {
      const existingNotification = notifications.find(n => 
        n.type === 'payment_overdue' && 
        n.relatedEntity?.id === athlete.id
      );

      if (!existingNotification) {
        addNotification({
          type: 'payment_overdue',
          title: 'Pagamento in Ritardo',
          message: `${athlete.name} ${athlete.surname} ha pagamenti in sospeso`,
          severity: 'warning',
          relatedEntity: { type: 'athlete', id: athlete.id },
          actions: [
            { label: 'Visualizza Atleta', action: 'view_athlete', style: 'primary' },
            { label: 'Pagamenti', action: 'view_payments', style: 'secondary' }
          ]
        });
      }
    });
  }, [settings.paymentReminderDays, notifications, addNotification]);

  const checkAgeViolations = useCallback((athletes) => {
    if (!settings.enableAgeViolationAlerts) return;

    const violationsAthletes = athletes.filter(a => !a.isAgeValid);
    
    violationsAthletes.forEach(athlete => {
      const existingNotification = notifications.find(n => 
        n.type === 'age_violation' && 
        n.relatedEntity?.id === athlete.id
      );

      if (!existingNotification) {
        addNotification({
          type: 'age_violation',
          title: 'Violazione Categoria Età',
          message: `${athlete.name} ${athlete.surname} non rispetta i limiti di età per la categoria`,
          severity: 'error',
          relatedEntity: { type: 'athlete', id: athlete.id },
          actions: [
            { label: 'Visualizza Atleta', action: 'view_athlete', style: 'primary' },
            { label: 'Impostazioni', action: 'view_settings', style: 'secondary' }
          ]
        });
      }
    });
  }, [settings.enableAgeViolationAlerts, notifications, addNotification]);

  const checkUpcomingMatches = useCallback((matches) => {
    if (!settings.enableMatchReminders) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const upcomingMatches = matches.filter(match => {
      const matchDate = new Date(match.date);
      return matchDate.toDateString() === tomorrow.toDateString() && match.status === 'scheduled';
    });

    upcomingMatches.forEach(match => {
      const existingNotification = notifications.find(n => 
        n.type === 'match_reminder' && 
        n.relatedEntity?.id === match.id
      );

      if (!existingNotification) {
        addNotification({
          type: 'match_reminder',
          title: 'Partita Programmata Domani',
          message: `${match.homeTeam} vs ${match.awayTeam} - ${match.time}`,
          severity: 'info',
          relatedEntity: { type: 'match', id: match.id },
          actions: [
            { label: 'Visualizza Partita', action: 'view_match', style: 'primary' },
            { label: 'Calendario', action: 'view_matches', style: 'secondary' }
          ]
        });
      }
    });
  }, [settings.enableMatchReminders, notifications, addNotification]);

  const checkTransportAlerts = useCallback((athletes, buses) => {
    if (!settings.enableTransportAlerts) return;

    buses.forEach(bus => {
      const athletesOnBus = athletes.filter(a => a.busRoute === bus.route && a.usesBus);
      const overbooked = athletesOnBus.length > bus.capacity;

      if (overbooked) {
        const existingNotification = notifications.find(n => 
          n.type === 'transport_alert' && 
          n.relatedEntity?.id === bus.id
        );

        if (!existingNotification) {
          addNotification({
            type: 'transport_alert',
            title: 'Pulmino Sovraffollato',
            message: `Il pulmino ${bus.route} ha ${athletesOnBus.length} persone prenotate su ${bus.capacity} posti disponibili`,
            severity: 'warning',
            relatedEntity: { type: 'transport', id: bus.id },
            actions: [
              { label: 'Gestisci Trasporti', action: 'view_transport', style: 'primary' }
            ]
          });
        }
      }
    });
  }, [settings.enableTransportAlerts, notifications, addNotification]);

  // Run all auto-checks
  const runAutoChecks = useCallback((data) => {
    if (!data) return;
    
    try {
      if (data.athletes) {
        checkDocumentExpiry(data.athletes);
        checkPaymentOverdue(data.athletes);
        checkAgeViolations(data.athletes);
      }
      
      if (data.matches) {
        checkUpcomingMatches(data.matches);
      }
      
      if (data.athletes && data.buses) {
        checkTransportAlerts(data.athletes, data.buses);
      }
    } catch (error) {
      console.error('Error running notification auto-checks:', error);
    }
  }, [checkDocumentExpiry, checkPaymentOverdue, checkAgeViolations, checkUpcomingMatches, checkTransportAlerts]);

  // Computed values
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const recentNotifications = notifications.slice(0, 5);

  return {
    notifications,
    unreadCount,
    recentNotifications,
    settings,
    addNotification,
    markAsRead,
    markAsUnread,
    removeNotification,
    markAllAsRead,
    clearAllNotifications,
    runAutoChecks,
    setSettings
  };
};
