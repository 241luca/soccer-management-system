// components/common/StatusBadge.jsx
import React from 'react';

const StatusBadge = ({ status, children, className = '', size = 'normal' }) => {
  const colors = {
    expired: 'bg-red-500 text-white',
    critical: 'bg-red-400 text-white', 
    warning: 'bg-yellow-400 text-black',
    valid: 'bg-green-500 text-white',
    paid: 'bg-green-500 text-white',
    pending: 'bg-orange-500 text-white',
    overdue: 'bg-red-500 text-white',
    not_applicable: 'bg-gray-400 text-white',
    scheduled: 'bg-blue-500 text-white',
    completed: 'bg-gray-600 text-white'
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-xs',
    normal: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };
  
  return (
    <span className={`rounded-full font-medium ${colors[status]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

export default StatusBadge;