// components/notifications/ToastNotification.jsx
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const ToastNotification = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Animazione di entrata
    setTimeout(() => setIsVisible(true), 10);

    // Progress bar animation
    if (toast.duration > 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const elapsed = Date.now() - toast.createdAt.getTime();
          const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100);
          return remaining;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [toast]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          text: 'text-white',
          icon: CheckCircle,
          progressBg: 'bg-green-600'
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          text: 'text-white',
          icon: AlertCircle,
          progressBg: 'bg-red-600'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500',
          text: 'text-white',
          icon: AlertTriangle,
          progressBg: 'bg-yellow-600'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-500',
          text: 'text-white',
          icon: Info,
          progressBg: 'bg-blue-600'
        };
    }
  };

  const styles = getToastStyles();
  const Icon = styles.icon;

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 transform
        ${styles.bg} ${styles.text} min-w-[300px] max-w-[400px]
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      {/* Progress bar */}
      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-black bg-opacity-20 w-full">
          <div 
            className={`h-full ${styles.progressBg} transition-all duration-75 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 pr-12">
        <div className="flex items-start space-x-3">
          <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium leading-5">
              {toast.message}
            </p>
            {toast.description && (
              <p className="text-xs opacity-90 mt-1">
                {toast.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-black hover:bg-opacity-20 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Click to dismiss */}
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={handleClose}
      />
    </div>
  );
};

export default ToastNotification;
