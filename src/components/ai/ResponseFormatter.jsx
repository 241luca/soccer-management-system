// components/ai/ResponseFormatter.jsx
import React, { useState } from 'react';
import { Download, Eye, BarChart3, Table, AlertTriangle, CheckCircle, Info, TrendingUp, Users } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import ExportButton from '../export/ExportButton';

const ResponseFormatter = ({ response }) => {
  const [showFullData, setShowFullData] = useState(false);

  const exportData = (data, filename) => {
    if (response.type === 'table' && Array.isArray(data)) {
      // Export as CSV
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename || 'export'}.csv`;
      a.click();
    } else {
      // Export as JSON
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename || 'export'}.json`;
      a.click();
    }
  };

  if (response.type === 'error') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-medium">{response.title}</h3>
        </div>
        <p className="text-gray-700">{response.message}</p>
        {response.suggestions && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-2">Prova con queste query:</p>
            <div className="space-y-1">
              {response.suggestions.map((suggestion, index) => (
                <div key={index} className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  • {suggestion}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (response.type === 'summary') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-500" />
          <h3 className="font-medium text-gray-900">{response.title}</h3>
        </div>
        
        <div className="prose text-gray-700">
          {response.content}
        </div>
        
        {response.insights && response.insights.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Insights</h4>
            <ul className="space-y-1">
              {response.insights.map((insight, index) => (
                <li key={index} className="text-blue-800 text-sm">• {insight}</li>
              ))}
            </ul>
          </div>
        )}
        
        {response.actions && response.actions.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">🎯 Azioni Consigliate</h4>
            <div className="space-y-1">
              {response.actions.map((action, index) => (
                <div key={index} className="text-green-800 text-sm">• {action}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (response.type === 'table') {
    const data = response.data || [];
    const displayData = showFullData ? data : data.slice(0, 10);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="h-5 w-5 text-gray-500" />
            <h3 className="font-medium text-gray-900">{response.title}</h3>
            <span className="text-sm text-gray-500">({data.length} elementi)</span>
          </div>
          
          {response.exportable && (
            <button
              onClick={() => exportData(data, response.title?.toLowerCase().replace(/\s+/g, '-'))}
              className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
            >
              <Download className="h-4 w-4" />
              Esporta
            </button>
          )}
        </div>

        {response.summary && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-700 font-medium">{response.summary}</p>
          </div>
        )}

        {data.length > 0 ? (
          <>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(data[0]).map((header) => (
                      <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {Object.entries(row).map(([key, value]) => (
                        <td key={key} className="px-4 py-3 text-sm">
                          {key.toLowerCase().includes('status') || key.toLowerCase().includes('stato') ? (
                            <StatusBadge status={value.toLowerCase().includes('paid') || value.toLowerCase().includes('valid') ? 'valid' : 'warning'}>
                              {value}
                            </StatusBadge>
                          ) : key.toLowerCase().includes('date') || key.toLowerCase().includes('expiry') ? (
                            <span className="text-gray-600">
                              {new Date(value).toLocaleDateString('it-IT')}
                            </span>
                          ) : key.toLowerCase().includes('days') && typeof value === 'number' ? (
                            <span className={`font-medium ${value <= 7 ? 'text-red-600' : value <= 30 ? 'text-orange-600' : 'text-gray-600'}`}>
                              {value} giorni
                            </span>
                          ) : (
                            <span className="text-gray-900">{value}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.length > 10 && (
              <div className="flex justify-center">
                <button
                  onClick={() => setShowFullData(!showFullData)}
                  className="flex items-center gap-1 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  {showFullData ? 'Mostra meno' : `Mostra tutti (${data.length - 10} in più)`}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Nessun dato da visualizzare
          </div>
        )}

        {response.insights && response.insights.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Insights</h4>
            <ul className="space-y-1">
              {response.insights.map((insight, index) => (
                <li key={index} className="text-blue-800 text-sm">• {insight}</li>
              ))}
            </ul>
          </div>
        )}

        {response.actions && response.actions.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">🎯 Azioni Consigliate</h4>
            <div className="space-y-1">
              {response.actions.map((action, index) => (
                <div key={index} className="text-green-800 text-sm">• {action}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (response.type === 'chart') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-500" />
            <h3 className="font-medium text-gray-900">{response.title}</h3>
          </div>
          
          {response.exportable && (
            <button
              onClick={() => exportData(response.data, response.title?.toLowerCase().replace(/\s+/g, '-'))}
              className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
            >
              <Download className="h-4 w-4" />
              Esporta
            </button>
          )}
        </div>

        {response.summary && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-700 font-medium">{response.summary}</p>
          </div>
        )}

        {/* Simple text-based chart for now */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="space-y-3">
            {response.data?.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{item.label || item.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(item.value / Math.max(...response.data.map(d => d.value))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 min-w-[3rem] text-right">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {response.insights && response.insights.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Insights</h4>
            <ul className="space-y-1">
              {response.insights.map((insight, index) => (
                <li key={index} className="text-blue-800 text-sm">• {insight}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (response.type === 'alert') {
    return (
      <div className="space-y-3">
        <div className={`p-4 rounded-lg border-l-4 ${
          response.severity === 'high' ? 'bg-red-50 border-red-400' :
          response.severity === 'medium' ? 'bg-orange-50 border-orange-400' :
          'bg-yellow-50 border-yellow-400'
        }`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${
              response.severity === 'high' ? 'text-red-500' :
              response.severity === 'medium' ? 'text-orange-500' :
              'text-yellow-500'
            }`} />
            <h3 className={`font-medium ${
              response.severity === 'high' ? 'text-red-900' :
              response.severity === 'medium' ? 'text-orange-900' :
              'text-yellow-900'
            }`}>
              {response.title}
            </h3>
          </div>
          
          <p className={`mt-2 ${
            response.severity === 'high' ? 'text-red-800' :
            response.severity === 'medium' ? 'text-orange-800' :
            'text-yellow-800'
          }`}>
            {response.content}
          </p>
          
          {response.count && (
            <div className={`mt-2 text-sm font-medium ${
              response.severity === 'high' ? 'text-red-700' :
              response.severity === 'medium' ? 'text-orange-700' :
              'text-yellow-700'
            }`}>
              {response.count} elementi interessati
            </div>
          )}
        </div>

        {response.actions && response.actions.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">🎯 Azioni Immediate</h4>
            <div className="space-y-1">
              {response.actions.map((action, index) => (
                <div key={index} className="text-blue-800 text-sm">• {action}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default fallback
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-gray-700">{JSON.stringify(response, null, 2)}</p>
    </div>
  );
};

export default ResponseFormatter;