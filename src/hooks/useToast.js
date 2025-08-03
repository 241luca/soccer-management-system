// hooks/useToast.js
import { useState, useCallback } from 'react';

let globalToastId = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const generateId = () => {
    globalToastId += 1;
    return globalToastId;
  };

  const showToast = useCallback((type, message, duration = 5000, options = {}) => {
    const id = generateId();
    const toast = {
      id,
      type, // 'success', 'error', 'warning', 'info'
      message,
      duration,
      createdAt: new Date(),
      ...options
    };

    setToasts(prev => [...prev, toast]);

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((message, duration, options) => 
    showToast('success', message, duration, options), [showToast]);
  
  const showError = useCallback((message, duration, options) => 
    showToast('error', message, duration, options), [showToast]);
  
  const showWarning = useCallback((message, duration, options) => 
    showToast('warning', message, duration, options), [showToast]);
  
  const showInfo = useCallback((message, duration, options) => 
    showToast('info', message, duration, options), [showToast]);

  return {
    toasts,
    showToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
