# Guida per Implementare le Notifiche nel Frontend
## Soccer Management System

### 📋 Contesto del Progetto

**Directory del progetto**: `/Users/lucamambelli/Desktop/soccer-management-system`

**Credenziali GitHub**:
- User: 241luca
- Email: lucamambelli@lmtecnologie.it
- Repository: https://github.com/241luca/soccer-management-system

**Backend**: Già funzionante con tutte le route delle notifiche implementate
- Server: http://localhost:3000
- API Base URL: http://localhost:3000/api/v1

### 🎯 Obiettivo
Aggiungere il supporto completo per le notifiche nel frontend dell'applicazione.

### 📁 File da Modificare

1. **`/src/services/api.js`** - Aggiungere i metodi API per le notifiche
2. **`/src/components/Navigation.jsx`** - Aggiungere l'icona delle notifiche con badge
3. **`/src/components/notifications/NotificationBell.jsx`** - Creare nuovo componente (icona + dropdown)
4. **`/src/components/notifications/NotificationList.jsx`** - Creare nuovo componente (lista notifiche)
5. **`/src/pages/NotificationsPage.jsx`** - Creare nuova pagina (vista completa)
6. **`/src/App.jsx`** - Aggiungere la route per la pagina notifiche

### 📝 Implementazione Step-by-Step

#### Step 1: Aggiungere i metodi API in `api.js`

Aprire il file `/src/services/api.js` e aggiungere questi metodi dopo la sezione Transport (circa riga 285):

```javascript
// Notifications
async getNotifications(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return this.request(`/notifications${queryString ? `?${queryString}` : ''}`);
}

async markNotificationAsRead(id) {
  return this.request(`/notifications/${id}/read`, {
    method: 'PUT'
  });
}

async markAllNotificationsAsRead() {
  return this.request('/notifications/read-all', {
    method: 'PUT'
  });
}

async deleteNotification(id) {
  return this.request(`/notifications/${id}`, {
    method: 'DELETE'
  });
}

async getUnreadNotificationCount() {
  const notifications = await this.getNotifications({ unread: true });
  return notifications.length || 0;
}
```

#### Step 2: Creare il componente NotificationBell

Creare il file `/src/components/notifications/NotificationBell.jsx`:

```javascript
import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { api } from '../../services/api';
import NotificationList from './NotificationList';

export default function NotificationBell() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications({ limit: 5 });
      setNotifications(data);
      const unread = data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
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

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      await loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Notifiche</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Segna tutte come lette
                </button>
              )}
            </div>
          </div>
          
          <NotificationList
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            compact={true}
          />
          
          <div className="p-4 border-t">
            <a
              href="/notifications"
              className="block text-center text-sm text-blue-600 hover:text-blue-800"
            >
              Vedi tutte le notifiche
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
```

#### Step 3: Creare il componente NotificationList

Creare il file `/src/components/notifications/NotificationList.jsx`:

```javascript
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
```

#### Step 4: Aggiornare Navigation.jsx

Nel file `/src/components/Navigation.jsx`, aggiungere l'import e il componente NotificationBell:

1. Aggiungere l'import all'inizio del file:
```javascript
import NotificationBell from './notifications/NotificationBell';
```

2. Aggiungere il componente nella barra di navigazione, prima del menu utente (cerca "UserMenu" nel file):
```javascript
{/* Notifications */}
<NotificationBell />

{/* User Menu - codice esistente */}
```

#### Step 5: Creare la pagina Notifiche

Creare il file `/src/pages/NotificationsPage.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { Bell, Filter, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import NotificationList from '../components/notifications/NotificationList';
import LoadingSpinner from '../components/LoadingSpinner';

export default function NotificationsPage() {
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
```

#### Step 6: Aggiungere la route in App.jsx

Nel file `/src/App.jsx`:

1. Aggiungere l'import all'inizio del file (dopo gli altri import delle pagine):
```javascript
import NotificationsPage from './pages/NotificationsPage';
```

2. Aggiungere la route nel componente Routes (cerca "Routes" nel file):
```javascript
<Route path="/notifications" element={
  <ProtectedRoute>
    <NotificationsPage />
  </ProtectedRoute>
} />
```

### 📦 Dipendenze Necessarie

Assicurarsi che `date-fns` sia installata per la formattazione delle date:

```bash
cd /Users/lucamambelli/Desktop/soccer-management-system
npm install date-fns
```

### 🧪 Test dell'Implementazione

1. Avviare il backend (se non è già attivo):
```bash
cd backend
npm run dev
```

2. Avviare il frontend:
```bash
cd ..
npm run dev
```

3. Verificare:
   - L'icona della campanella appare nella barra di navigazione
   - Il badge mostra il numero di notifiche non lette
   - Il dropdown si apre al click
   - La pagina notifiche è accessibile da `/notifications`
   - Le notifiche possono essere marcate come lette
   - Le notifiche possono essere eliminate

### 🔧 Personalizzazioni Opzionali

1. **Notifiche in tempo reale**: Aggiungere WebSocket per ricevere notifiche in tempo reale
2. **Suoni**: Aggiungere un suono quando arriva una nuova notifica
3. **Preferenze**: Permettere agli utenti di configurare quali notifiche ricevere
4. **Notifiche browser**: Implementare le Web Push Notifications

### 📝 Note per l'Implementatore

- Fare sempre il commit e push su GitHub dopo ogni step completato
- Testare ogni componente singolarmente prima di procedere
- La documentazione delle API delle notifiche è disponibile nel backend
- In caso di errori, controllare la console del browser e i log del backend

### 🎯 Risultato Finale

Dopo aver completato tutti gli step, il sistema di notifiche sarà completamente funzionale con:
- Icona con badge nella navbar
- Dropdown con anteprima notifiche
- Pagina dedicata con filtri
- Gestione stato letto/non letto
- Eliminazione notifiche
- Aggiornamento automatico ogni 30 secondi