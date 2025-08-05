import React, { useState, useEffect } from 'react';
import { Bell, Filter, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import NotificationList from './NotificationList';
import LoadingSpinner from '../common/LoadingSpinner';

export default function NotificationsView() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [type, setType] = useState('all'); // all, document, payment, match, etc.

  useEffect(() => {
    loadNotifications();
  }, [filter, type]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'unread') params.unread = true;
      if (filter === 'read') params.read = true;
      if (type !== 'all') params.type = type;
      
      const data = await api.getNotifications(params);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationAsRead(id);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Sei sicuro di voler eliminare questa notifica?')) return;
    
    try {
      await api.deleteNotification(id);
      await loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      await loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-6 w-6 text-gray-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Notifiche</h1>
              {unreadCount > 0 && (
                <span className="ml-3 px-2 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">
                  {unreadCount} non lette
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Segna tutte come lette
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-500" />
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="all">Tutte</option>
              <option value="unread">Non lette</option>
              <option value="read">Lette</option>
            </select>
            
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="all">Tutti i tipi</option>
              <option value="document_expiring">Documenti in scadenza</option>
              <option value="document_expired">Documenti scaduti</option>
              <option value="payment_due">Pagamenti in scadenza</option>
              <option value="payment_overdue">Pagamenti scaduti</option>
              <option value="match_scheduled">Partite programmate</option>
              <option value="team_updated">Aggiornamenti squadra</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="p-8">
            <LoadingSpinner />
          </div>
        ) : (
          <NotificationList
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
