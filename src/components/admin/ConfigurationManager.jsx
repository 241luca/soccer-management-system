// components/admin/ConfigurationManager.jsx
import React, { useState } from 'react';
import { 
  Settings, 
  Table, 
  Plus, 
  Download, 
  Upload, 
  Search,
  Filter,
  Edit,
  Trash2,
  Save,
  RotateCcw,
  FileText,
  Users,
  CreditCard,
  Trophy,
  MapPin,
  Map,
  Activity
} from 'lucide-react';
import { getAllConfigTables, getConfigTable } from '../../data/configTables';
import ConfigTable from './ConfigTable';

const ConfigurationManager = ({ toast, onBack }) => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const configTables = getAllConfigTables();

  const categories = [
    { id: 'all', label: 'Tutte le Categorie' },
    { id: 'core', label: 'Configurazioni Base' },
    { id: 'sports', label: 'Configurazioni Sportive' },
    { id: 'admin', label: 'Configurazioni Admin' }
  ];

  const getCategoryForTable = (tableId) => {
    switch (tableId) {
      case 'positions':
      case 'competitionTypes':
      case 'venueTypes':
      case 'teamCategories':
        return 'sports';
      case 'documentTypes':
      case 'paymentTypes':
      case 'transportZones':
        return 'core';
      case 'statusTypes':
        return 'admin';
      default:
        return 'core';
    }
  };

  const filteredTables = configTables.filter(table => {
    const matchesSearch = !searchTerm || 
      table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || getCategoryForTable(table.id) === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getTableIcon = (tableId) => {
    switch (tableId) {
      case 'positions': return Users;
      case 'documentTypes': return FileText;
      case 'paymentTypes': return CreditCard;
      case 'competitionTypes': return Trophy;
      case 'venueTypes': return MapPin;
      case 'transportZones': return Map;
      case 'teamCategories': return Users;
      case 'statusTypes': return Activity;
      default: return Table;
    }
  };

  const getTableColor = (tableId) => {
    switch (tableId) {
      case 'positions': return 'blue';
      case 'documentTypes': return 'green';
      case 'paymentTypes': return 'yellow';
      case 'competitionTypes': return 'purple';
      case 'venueTypes': return 'indigo';
      case 'transportZones': return 'orange';
      case 'teamCategories': return 'red';
      case 'statusTypes': return 'gray';
      default: return 'blue';
    }
  };

  const handleExportConfig = () => {
    toast?.showInfo('Esportazione configurazioni in corso...');
    
    setTimeout(() => {
      const exportData = {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        tables: configTables.reduce((acc, table) => {
          acc[table.id] = table.data;
          return acc;
        }, {})
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `config-tables-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast?.showSuccess('Configurazioni esportate con successo!');
    }, 1500);
  };

  const handleImportConfig = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importData = JSON.parse(event.target.result);
            console.log('Configuration imported:', importData);
            toast?.showSuccess('Configurazioni importate con successo!');
          } catch (error) {
            toast?.showError('Errore durante l\'importazione del file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  if (selectedTable) {
    return (
      <ConfigTable
        tableId={selectedTable}
        table={getConfigTable(selectedTable)}
        toast={toast}
        onBack={() => setSelectedTable(null)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Settings className="h-6 w-6 mr-2 text-blue-600" />
              Gestione Configurazioni
            </h1>
            <p className="text-gray-600 mt-1">
              Modifica tabelle di configurazione e parametri sistema
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleImportConfig}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>Importa</span>
            </button>
            
            <button
              onClick={handleExportConfig}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Esporta</span>
            </button>
            
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Torna alla Dashboard
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca tabelle di configurazione..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-500">
              {filteredTables.length} di {configTables.length} tabelle
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTables.map(table => {
          const Icon = getTableIcon(table.id);
          const color = getTableColor(table.id);
          
          const colorClasses = {
            blue: 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700',
            green: 'border-green-200 bg-green-50 hover:bg-green-100 text-green-700',
            yellow: 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100 text-yellow-700',
            purple: 'border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700',
            indigo: 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700',
            orange: 'border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700',
            red: 'border-red-200 bg-red-50 hover:bg-red-100 text-red-700',
            gray: 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
          };

          return (
            <button
              key={table.id}
              onClick={() => setSelectedTable(table.id)}
              className={`p-6 border-2 rounded-lg text-left transition-all hover:shadow-md hover:scale-105 ${colorClasses[color]}`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`h-8 w-8 text-${color}-600`} />
                <span className={`text-xs px-2 py-1 rounded-full bg-${color}-100 text-${color}-600`}>
                  {table.data?.length || 0} records
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {table.name}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                {table.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {getCategoryForTable(table.id)} config
                </span>
                <Edit className="h-4 w-4 text-gray-400" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTables.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nessuna tabella trovata
          </h3>
          <p className="text-gray-500 mb-4">
            Non sono state trovate tabelle di configurazione corrispondenti ai criteri di ricerca.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('all');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reset Filtri
          </button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Riepilogo Configurazioni</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {configTables.length}
            </div>
            <div className="text-sm text-blue-600">Tabelle Totali</div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {configTables.reduce((sum, table) => sum + (table.data?.length || 0), 0)}
            </div>
            <div className="text-sm text-green-600">Record Totali</div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {configTables.filter(table => getCategoryForTable(table.id) === 'sports').length}
            </div>
            <div className="text-sm text-purple-600">Config Sportive</div>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {configTables.filter(table => getCategoryForTable(table.id) === 'core').length}
            </div>
            <div className="text-sm text-orange-600">Config Base</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationManager;
