// components/admin/ConfigTable.jsx
import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Search,
  Filter,
  Download,
  Upload,
  RotateCcw,
  Check,
  AlertTriangle
} from 'lucide-react';
import { validateConfigRecord, getNextId } from '../../data/configTables';

const ConfigTable = ({ tableId, table, toast, onBack }) => {
  const [data, setData] = useState(table.data || []);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedRecords, setSelectedRecords] = useState([]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = data.filter(record => {
      if (!searchTerm) return true;
      
      return table.fields.some(field => {
        const value = record[field.key];
        if (value === null || value === undefined) return false;
        return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });

    if (sortField) {
      filtered.sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortField, sortDirection, table.fields]);

  const handleSort = (fieldKey) => {
    if (sortField === fieldKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(fieldKey);
      setSortDirection('asc');
    }
  };

  const handleSave = (record) => {
    const validation = validateConfigRecord(tableId, record);
    
    if (!validation.valid) {
      toast?.showError(`Errori di validazione: ${validation.errors.join(', ')}`);
      return;
    }

    if (isCreating) {
      const newRecord = { ...record, id: getNextId(tableId) };
      setData([...data, newRecord]);
      toast?.showSuccess('Record aggiunto con successo!');
      setIsCreating(false);
    } else {
      setData(data.map(item => 
        item.id === record.id ? record : item
      ));
      toast?.showSuccess('Record aggiornato con successo!');
      setEditingRecord(null);
    }
  };

  const handleDelete = (recordId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo record?')) {
      setData(data.filter(item => item.id !== recordId));
      toast?.showSuccess('Record eliminato con successo!');
    }
  };

  const handleBulkDelete = () => {
    if (selectedRecords.length === 0) {
      toast?.showWarning('Seleziona almeno un record da eliminare');
      return;
    }
    
    if (window.confirm(`Sei sicuro di voler eliminare ${selectedRecords.length} record?`)) {
      setData(data.filter(item => !selectedRecords.includes(item.id)));
      setSelectedRecords([]);
      toast?.showSuccess(`${selectedRecords.length} record eliminati con successo!`);
    }
  };

  const handleExport = () => {
    const exportData = {
      table: tableId,
      name: table.name,
      timestamp: new Date().toISOString(),
      data: filteredData
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast?.showSuccess('Dati esportati con successo!');
  };

  const RecordForm = ({ record, onSave, onCancel, isNew = false }) => {
    const [formData, setFormData] = useState(record || {});
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
      e.preventDefault();
      const validation = validateConfigRecord(tableId, formData);
      
      if (!validation.valid) {
        const errorMap = {};
        validation.errors.forEach(error => {
          const field = table.fields.find(f => error.includes(f.label));
          if (field) errorMap[field.key] = error;
        });
        setErrors(errorMap);
        return;
      }
      
      setErrors({});
      onSave(formData);
    };

    const handleChange = (fieldKey, value) => {
      setFormData({ ...formData, [fieldKey]: value });
      if (errors[fieldKey]) {
        setErrors({ ...errors, [fieldKey]: undefined });
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {isNew ? 'Nuovo Record' : 'Modifica Record'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {table.fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {field.type === 'text' && (
                  <input
                    type="text"
                    value={formData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    disabled={field.readonly}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      field.readonly ? 'bg-gray-100' : ''
                    } ${errors[field.key] ? 'border-red-300' : 'border-gray-300'}`}
                  />
                )}
                
                {field.type === 'number' && (
                  <input
                    type="number"
                    value={formData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, parseFloat(e.target.value) || 0)}
                    disabled={field.readonly}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      field.readonly ? 'bg-gray-100' : ''
                    } ${errors[field.key] ? 'border-red-300' : 'border-gray-300'}`}
                  />
                )}
                
                {field.type === 'select' && (
                  <select
                    value={formData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors[field.key] ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleziona...</option>
                    {field.options?.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                )}
                
                {field.type === 'textarea' && (
                  <textarea
                    value={formData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors[field.key] ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                )}
                
                {field.type === 'boolean' && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData[field.key] || false}
                      onChange={(e) => handleChange(field.key, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">Abilitato</span>
                  </div>
                )}
                
                {field.type === 'date' && (
                  <input
                    type="date"
                    value={formData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors[field.key] ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                )}

                {errors[field.key] && (
                  <p className="text-red-500 text-sm mt-1">{errors[field.key]}</p>
                )}
              </div>
            ))}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Salva</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Table className="h-6 w-6 mr-2 text-blue-600" />
              {table.name}
            </h1>
            <p className="text-gray-600 mt-1">{table.description}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Esporta</span>
            </button>
            
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nuovo Record</span>
            </button>
            
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Torna Indietro
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca nei record..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-3">
            {selectedRecords.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Elimina ({selectedRecords.length})</span>
              </button>
            )}
            
            <div className="text-sm text-gray-500">
              {filteredData.length} di {data.length} record
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRecords.length === filteredData.length && filteredData.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRecords(filteredData.map(r => r.id));
                      } else {
                        setSelectedRecords([]);
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                {table.fields.map(field => (
                  <th
                    key={field.key}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort(field.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{field.label}</span>
                      {sortField === field.key && (
                        <span className="text-blue-500">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map(record => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRecords.includes(record.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRecords([...selectedRecords, record.id]);
                        } else {
                          setSelectedRecords(selectedRecords.filter(id => id !== record.id));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  {table.fields.map(field => (
                    <td key={field.key} className="px-4 py-3 text-sm text-gray-900">
                      {field.type === 'boolean' ? (
                        record[field.key] ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )
                      ) : (
                        record[field.key]?.toString() || '-'
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingRecord(record)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="p-12 text-center">
            <Table className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun record trovato</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Nessun record corrisponde ai criteri di ricerca.' : 'Questa tabella è vuota.'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {isCreating && (
        <RecordForm
          onSave={handleSave}
          onCancel={() => setIsCreating(false)}
          isNew={true}
        />
      )}

      {editingRecord && (
        <RecordForm
          record={editingRecord}
          onSave={handleSave}
          onCancel={() => setEditingRecord(null)}
          isNew={false}
        />
      )}
    </div>
  );
};

export default ConfigTable;
