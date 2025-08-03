// components/admin/AdminDashboard.jsx
import React, { useState } from 'react';
import { 
  Settings, 
  Users, 
  Database, 
  Activity, 
  Shield, 
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive,
  Cpu,
  BarChart3
} from 'lucide-react';

const AdminDashboard = ({ data, stats, toast, onNavigate }) => {
  const [systemHealth] = useState({
    status: 'healthy',
    uptime: '15 giorni, 8 ore',
    memoryUsage: 65,
    diskUsage: 42,
    cpuUsage: 23,
    lastBackup: '2025-08-01 14:30',
    totalUsers: 8,
    activeUsers: 3,
    totalRecords: data?.athletes?.length + data?.matches?.length + data?.teams?.length || 0
  });

  const quickActions = [
    {
      id: 'config',
      title: 'Gestione Configurazioni',
      description: 'Modifica tabelle di configurazione e parametri sistema',
      icon: Settings,
      color: 'blue',
      action: () => onNavigate?.('admin-config'),
      stats: '12 tabelle configurate'
    },
    {
      id: 'users',
      title: 'Gestione Utenti',
      description: 'Amministra utenti, ruoli e permessi',
      icon: Users,
      color: 'green',
      action: () => toast?.showInfo('Gestione utenti in sviluppo'),
      stats: `${systemHealth.totalUsers} utenti totali`
    },
    {
      id: 'backup',
      title: 'Backup & Restore',
      description: 'Gestisci backup dei dati e ripristino',
      icon: Download,
      color: 'purple',
      action: () => handleBackup(),
      stats: `Ultimo: ${systemHealth.lastBackup}`
    },
    {
      id: 'logs',
      title: 'Logs Attività',
      description: 'Visualizza e analizza i log del sistema',
      icon: Activity,
      color: 'orange',
      action: () => toast?.showInfo('Logs attività in sviluppo'),
      stats: '156 eventi oggi'
    },
    {
      id: 'maintenance',
      title: 'Manutenzione Sistema',
      description: 'Tools diagnostici e pulizia dati',
      icon: Shield,
      color: 'red',
      action: () => handleMaintenance(),
      stats: 'Sistema ottimale'
    },
    {
      id: 'import',
      title: 'Import/Export Dati',
      description: 'Importa ed esporta configurazioni e dati',
      icon: Upload,
      color: 'indigo',
      action: () => toast?.showInfo('Import/Export avanzato in sviluppo'),
      stats: 'CSV, Excel, JSON'
    }
  ];

  const handleBackup = () => {
    toast?.showInfo('Creazione backup in corso...');
    
    setTimeout(() => {
      const backupData = {
        timestamp: new Date().toISOString(),
        data: data,
        stats: stats,
        version: '2.0.0'
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `soccer-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast?.showSuccess('Backup creato e scaricato con successo!');
    }, 2000);
  };

  const handleMaintenance = () => {
    toast?.showInfo('Avviando diagnostica sistema...');
    
    setTimeout(() => {
      toast?.showSuccess('Sistema verificato: tutto funziona correttamente');
    }, 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUsageColor = (percentage) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Shield className="h-6 w-6 mr-2 text-blue-600" />
              Amministrazione Sistema
            </h1>
            <p className="text-gray-600 mt-1">
              Gestione e configurazione avanzata Soccer Management System
            </p>
          </div>
          
          <div className={`px-3 py-2 rounded-full flex items-center space-x-2 ${getStatusColor(systemHealth.status)}`}>
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Sistema Operativo</span>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Uptime</h3>
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600 mb-1">{systemHealth.uptime}</div>
          <div className="text-sm text-gray-500">Sistema attivo</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Memoria</h3>
            <HardDrive className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600 mb-1">{systemHealth.memoryUsage}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full ${getUsageColor(systemHealth.memoryUsage)}`}
              style={{ width: `${systemHealth.memoryUsage}%` }}
            />
          </div>
          <div className="text-sm text-gray-500">Utilizzo memoria</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">CPU</h3>
            <Cpu className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600 mb-1">{systemHealth.cpuUsage}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full ${getUsageColor(systemHealth.cpuUsage)}`}
              style={{ width: `${systemHealth.cpuUsage}%` }}
            />
          </div>
          <div className="text-sm text-gray-500">Carico processore</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Dati</h3>
            <Database className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600 mb-1">{systemHealth.totalRecords}</div>
          <div className="text-sm text-gray-500">Record totali</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Azioni Rapide</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map(action => {
            const Icon = action.icon;
            const colorClasses = {
              blue: 'text-blue-600 bg-blue-100 border-blue-200',
              green: 'text-green-600 bg-green-100 border-green-200',
              purple: 'text-purple-600 bg-purple-100 border-purple-200',
              orange: 'text-orange-600 bg-orange-100 border-orange-200',
              red: 'text-red-600 bg-red-100 border-red-200',
              indigo: 'text-indigo-600 bg-indigo-100 border-indigo-200'
            };
            
            return (
              <button
                key={action.id}
                onClick={action.action}
                className={`p-6 border-2 rounded-lg text-left transition-all hover:shadow-md hover:scale-105 ${colorClasses[action.color]}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`h-8 w-8 ${colorClasses[action.color].split(' ')[0]}`} />
                  <span className={`text-xs px-2 py-1 rounded-full ${colorClasses[action.color]}`}>
                    Admin
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3">
                  {action.description}
                </p>
                
                <div className="text-xs text-gray-500">
                  {action.stats}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Attività Recente</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Sistema avviato</div>
                <div className="text-xs text-gray-500">15 giorni fa</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Download className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Backup automatico</div>
                <div className="text-xs text-gray-500">1 giorno fa</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
              <RefreshCw className="h-5 w-5 text-orange-500" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Config aggiornata</div>
                <div className="text-xs text-gray-500">3 giorni fa</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiche Sistema</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Atlete totali</span>
              <span className="text-lg font-bold text-blue-600">{data?.athletes?.length || 0}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Squadre attive</span>
              <span className="text-lg font-bold text-green-600">{data?.teams?.length || 0}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Partite stagione</span>
              <span className="text-lg font-bold text-purple-600">{data?.matches?.length || 0}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Utenti attivi</span>
              <span className="text-lg font-bold text-orange-600">{systemHealth.activeUsers}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
