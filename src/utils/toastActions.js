// utils/toastActions.js

// Standard success messages
export const TOAST_MESSAGES = {
  ATHLETE_SAVED: 'Atleta salvata con successo!',
  ATHLETE_DELETED: 'Atleta eliminata con successo!',
  MATCH_SAVED: 'Partita salvata con successo!',
  MATCH_DELETED: 'Partita eliminata con successo!',
  DOCUMENT_UPLOADED: 'Documento caricato con successo!',
  DOCUMENT_DELETED: 'Documento eliminato con successo!',
  PAYMENT_RECORDED: 'Pagamento registrato con successo!',
  PAYMENT_DELETED: 'Pagamento eliminato con successo!',
  TRANSPORT_UPDATED: 'Trasporto aggiornato con successo!',
  SETTINGS_SAVED: 'Impostazioni salvate con successo!',
  DATA_EXPORTED: 'Dati esportati con successo!',
  DATA_IMPORTED: 'Dati importati con successo!',
  
  // Error messages
  SAVE_ERROR: 'Errore durante il salvataggio',
  DELETE_ERROR: 'Errore durante l\'eliminazione',
  EXPORT_ERROR: 'Errore durante l\'esportazione',
  IMPORT_ERROR: 'Errore durante l\'importazione',
  VALIDATION_ERROR: 'Errore di validazione dati',
  
  // Warning messages  
  UNSAVED_CHANGES: 'Ci sono modifiche non salvate',
  CONFIRM_DELETE: 'Sicuro di voler eliminare?',
  
  // Info messages
  AUTO_SAVE: 'Salvataggio automatico completato',
  LOADING_DATA: 'Caricamento dati in corso...',
  NO_CHANGES: 'Nessuna modifica da salvare'
};

// Helper function to show action-specific toasts
export const showActionToast = (toast, action, success = true, customMessage = null) => {
  const message = customMessage || TOAST_MESSAGES[action];
  
  if (success) {
    toast.showSuccess(message);
  } else {
    toast.showError(message);
  }
};

// Export action wrapper with toast feedback
export const withToastFeedback = (action, toast, successMessage, errorMessage) => {
  return async (...args) => {
    try {
      const result = await action(...args);
      toast.showSuccess(successMessage);
      return result;
    } catch (error) {
      console.error('Action failed:', error);
      toast.showError(errorMessage || 'Operazione fallita');
      throw error;
    }
  };
};
