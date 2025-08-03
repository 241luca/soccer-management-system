// components/notifications/ToastContainer.jsx
import React from 'react';
import ToastNotification from './ToastNotification';

const ToastContainer = ({ toasts, onRemoveToast }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastNotification
          key={toast.id}
          toast={toast}
          onRemove={onRemoveToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
