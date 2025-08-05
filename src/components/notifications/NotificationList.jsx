import React from 'react';
import { 
  AlertCircle, 
  FileText, 
  DollarSign, 
  Calendar,
  Users,
  Bell,
  Check,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

const notificationIcons = {
  document_expiring: FileText,
  document_expired: AlertCircle,
  payment_due: DollarSign,
  payment_overdue: AlertCircle,
  match_scheduled: Calendar,
  team_updated: Users,
  default: Bell
};

const notificationColors = {
  document_expiring: 'text-yellow-600 bg-yellow-100',
  document_expired: 'text-red-600 bg-red-100',
  payment_due: 'text-blue-600 bg-blue-100',
  payment_overdue: 'text-red-600 bg-red-100',
  match_scheduled: 'text-green-600 bg-green-100',
  team_updated: 'text-purple-600 bg-purple-100',
  default: 'text-gray-600 bg-gray-100'
};

export default function NotificationList({ 
  notifications, 
  onMarkAsRead, 
  onDelete,
  compact = false 
}) {
  const getIcon = (type) => {
    const Icon = notificationIcons[type] || notificationIcons.default;
    return Icon;
  };

  const getColorClass = (type) => {
    return notificationColors[type] || notificationColors.default;
  };

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Nessuna notifica</p>
      </div>
    );
  }

  return (
    <div className={compact ? 'max-h-96 overflow-y-auto' : ''}>
      {notifications.map((notification) => {
        const Icon = getIcon(notification.type);
        const colorClass = getColorClass(notification.type);
        
        return (
          <div
            key={notification.id}
            className={`p-4 border-b hover:bg-gray-50 ${
              !notification.isRead ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-start">
              <div className={`p-2 rounded-full ${colorClass} mr-3`}>
                <Icon className="h-5 w-5" />
              </div>
              
              <div className="flex-1">
                <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
                  {notification.title}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                    locale: it
                  })}
                </p>
              </div>
              
              <div className="flex items-center ml-2">
                {!notification.isRead && onMarkAsRead && (
                  <button
                    onClick={() => onMarkAsRead(notification.id)}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="Segna come letta"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(notification.id)}
                    className="p-1 hover:bg-gray-200 rounded ml-1"
                    title="Elimina"
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
