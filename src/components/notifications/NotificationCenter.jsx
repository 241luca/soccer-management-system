// components/notifications/NotificationCenter.jsx
import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X, 
  MoreHorizontal,
  Check,
  Trash2,
  Filter,
  Settings
} from 'lucide-react';

const NotificationCenter = ({ data, stats, notifications, onMarkAsRead, onRemoveNotification, onMarkAllAsRead, onClearAll }) => {
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [typeFilter, setTypeFilter] = useState('all'); // all, document_expiry, payment_overdue, etc.
  const [showDropdown, setShowDropdown] = useState(null);

  const getNotificationIcon = (type, severity) => {
    switch (type) {
      case 'document_expiry':
        return AlertTriangle;
      case 'payment_overdue':
        return AlertCircle;
      case 'age_violation':
        return AlertCircle;
      case 'match_reminder':
        return Info;
      case 'transport_alert':
        return AlertTriangle;
      case 'system':
        return Info;
      default:
        return Bell;
    }
  };

  const getNotificationStyles = (severity, isRead) => {
    const baseStyles = isRead ? 'opacity-60' : '';
    
    switch (severity) {
      case 'error':
        return `border-l-4 border-red-500 bg-red-50 ${baseStyles}`;
      case 'warning':
        return `border-l-4 border-yellow-500 bg-yellow-50 ${baseStyles}`;
      case 'success':
        return `border-l-4 border-green-500 bg-green-50 ${baseStyles}`;
      case 'info':
      default:
        return `border-l-4 border-blue-500 bg-blue-50 ${baseStyles}`;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'success':
        return 'text-green-600';
      case 'info':
      default:
        return 'text-blue-600';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.isRead) return false;
    if (filter === 'read' && !notification.isRead) return false;
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    return true;
  });

  const notificationTypes = [
    { value: 'all', label: 'Tutti i tipi' },
    { value: 'document_expiry', label: 'Scadenze Documenti' },
    { value: 'payment_overdue', label: 'Pagamenti' },
    { value: 'age_violation', label: 'Violazioni Età' },
    { value: 'match_reminder', label: 'Promemoria Partite' },
    { value: 'transport_alert', label: 'Avvisi Trasporti' },
    { value: 'system', label: 'Sistema' }
  ];

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Ora';
    if (diffMinutes < 60) return `${diffMinutes} min fa`;
    if (diffHours < 24) return `${diffHours}h fa`;
    return `${diffDays}g fa`;
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleActionClick = (action, notification, e) => {
    e.stopPropagation();
    // TODO: Implementare azioni specifiche
    console.log('Action clicked:', action, notification);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Bell className="h-6 w-6 mr-2" />
            Centro Notifiche
          </h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={onMarkAllAsRead}
              className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-1"
            >
              <Check className="h-4 w-4" />
              <span>Segna tutto come letto</span>
            </button>
            <button
              onClick={onClearAll}
              className="px-3 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center space-x-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>Cancella tutto</span>
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
            <div className="text-sm text-gray-500">Notifiche totali</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-orange-600">{notifications.filter(n => !n.isRead).length}</div>
            <div className="text-sm text-gray-500">Non lette</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-red-600">{notifications.filter(n => n.severity === 'error').length}</div>
            <div className="text-sm text-gray-500">Critiche</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-yellow-600">{notifications.filter(n => n.severity === 'warning').length}</div>
            <div className="text-sm text-gray-500">Avvertimenti</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtri:</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Stato:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">Tutte</option>
              <option value="unread">Non lette</option>
              <option value="read">Lette</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Tipo:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              {notificationTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto text-sm text-gray-500">
            {filteredNotifications.length} di {notifications.length} notifiche
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border text-center">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna notifica</h3>
            <p className="text-gray-500">
              {filter === 'unread' ? 'Non hai notifiche non lette.' : 'Non ci sono notifiche da mostrare.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => {
            const Icon = getNotificationIcon(notification.type, notification.severity);
            
            return (
              <div
                key={notification.id}
                className={`bg-white p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${getNotificationStyles(notification.severity, notification.isRead)}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <Icon className={`h-5 w-5 mt-0.5 ${getSeverityColor(notification.severity)}`} />
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>

                      {/* Actions */}
                      {notification.actions && notification.actions.length > 0 && (
                        <div className="flex items-center space-x-2">
                          {notification.actions.map((action, index) => (
                            <button
                              key={index}
                              onClick={(e) => handleActionClick(action, notification, e)}
                              className={`text-xs px-2 py-1 rounded ${
                                action.style === 'primary'
                                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notification menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDropdown(showDropdown === notification.id ? null : notification.id);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>

                    {showDropdown === notification.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white border rounded-lg shadow-lg z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            notification.isRead ? onMarkAsRead(notification.id) : onMarkAsRead(notification.id);
                            setShowDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Check className="h-4 w-4" />
                          <span>{notification.isRead ? 'Segna come non letto' : 'Segna come letto'}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveNotification(notification.id);
                            setShowDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Elimina</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Read indicator */}
                {!notification.isRead && (
                  <div className="absolute right-2 top-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </div>
            );          
          })
        )}
      </div>
      
      {/* Settings Modal */}
      {showSettings && (
        <NotificationSettings
          settings={notificationSettings || {}}
          onSave={onSettingsChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default NotificationCenter;
