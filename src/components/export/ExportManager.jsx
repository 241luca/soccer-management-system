// components/export/ExportManager.jsx
import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, File, Printer, Calendar, Users, CreditCard, Bus } from 'lucide-react';
import PDFExporter from './PDFExporter';
import ExcelExporter from './ExcelExporter';
import CSVExporter from './CSVExporter';

const ExportManager = ({ data, stats, toast, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [selectedData, setSelectedData] = useState('athletes');
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeStats: true,
    includeImages: false,
    dateRange: 'all',
    teamFilter: 'all'
  });

  const exportFormats = [
    {
      id: 'pdf',
      name: 'PDF Report',
      icon: FileText,
      description: 'Report completo formattato per stampa',
      color: 'red'
    },
    {
      id: 'excel',
      name: 'Excel (.xlsx)',
      icon: FileSpreadsheet,
      description: 'Foglio di calcolo con tutti i dati',
      color: 'green'
    },
    {
      id: 'csv',
      name: 'CSV',
      icon: File,
      description: 'Dati in formato testo separato da virgole',
      color: 'blue'
    }
  ];

  const dataTypes = [
    {
      id: 'athletes',
      name: 'Dati Atlete',
      icon: Users,
      description: 'Informazioni complete delle atlete',
      count: data.athletes?.length || 0
    },
    {
      id: 'matches',
      name: 'Partite',
      icon: Calendar,
      description: 'Calendario e risultati partite',
      count: data.matches?.length || 0
    },
    {
      id: 'payments',
      name: 'Pagamenti',
      icon: CreditCard,
      description: 'Stato pagamenti e incassi',
      count: data.athletes?.filter(a => a.feeStatus === 'pending').length || 0
    },
    {
      id: 'transport',
      name: 'Trasporti',
      icon: Bus,
      description: 'Gestione pulmini e zone',
      count: data.buses?.length || 0
    },
    {
      id: 'all',
      name: 'Report Completo',
      icon: Printer,
      description: 'Tutti i dati in un unico documento',
      count: null
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      toast?.showInfo('Iniziando esportazione...');
      
      let exporter;
      
      switch (selectedFormat) {
        case 'pdf':
          exporter = new PDFExporter();
          break;
        case 'excel':
          exporter = new ExcelExporter();
          break;
        case 'csv':
          exporter = new CSVExporter();
          break;
        default:
          throw new Error('Formato non supportato');
      }

      await exporter.export(selectedData, data, stats, exportOptions);
      
      toast?.showSuccess(`Export ${selectedFormat.toUpperCase()} completato con successo!`);
      onClose();
      
    } catch (error) {
      console.error('Errore durante l\'export:', error);
      toast?.showError(`Errore durante l'esportazione: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Export Manager</h2>
              <p className="text-sm text-gray-500">Esporta i tuoi dati in diversi formati</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Download className="h-5 w-5 rotate-180" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Selezione Formato */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Formato Export</h3>
              
              <div className="space-y-3">
                {exportFormats.map((format) => {
                  const IconComponent = format.icon;
                  return (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id)}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                        selectedFormat === format.id
                          ? `border-${format.color}-500 bg-${format.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className={`h-6 w-6 text-${format.color}-500`} />
                        <div>
                          <div className="font-medium text-gray-900">{format.name}</div>
                          <div className="text-sm text-gray-500">{format.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selezione Dati */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Dati da Esportare</h3>
              
              <div className="space-y-3">
                {dataTypes.map((dataType) => {
                  const IconComponent = dataType.icon;
                  return (
                    <button
                      key={dataType.id}
                      onClick={() => setSelectedData(dataType.id)}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                        selectedData === dataType.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-6 w-6 text-blue-500" />
                          <div>
                            <div className="font-medium text-gray-900">{dataType.name}</div>
                            <div className="text-sm text-gray-500">{dataType.description}</div>
                          </div>
                        </div>
                        {dataType.count !== null && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                            {dataType.count}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Opzioni Export */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-4">Opzioni Export</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeStats}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      includeStats: e.target.checked
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Includi statistiche</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeImages}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      includeImages: e.target.checked
                    }))}
                    className="mr-2"
                    disabled={selectedFormat === 'csv'}
                  />
                  <span className="text-sm text-gray-700">Includi immagini (solo PDF/Excel)</span>
                </label>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Periodo</label>
                  <select
                    value={exportOptions.dateRange}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      dateRange: e.target.value
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">Tutti i dati</option>
                    <option value="current_season">Stagione corrente</option>
                    <option value="last_30_days">Ultimi 30 giorni</option>
                    <option value="last_90_days">Ultimi 90 giorni</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Squadra</label>
                  <select
                    value={exportOptions.teamFilter}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      teamFilter: e.target.value
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">Tutte le squadre</option>
                    {data.teams?.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con azioni */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Formato: <span className="font-medium">{exportFormats.find(f => f.id === selectedFormat)?.name}</span>
              {' • '}
              Dati: <span className="font-medium">{dataTypes.find(d => d.id === selectedData)?.name}</span>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Annulla
              </button>
              
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Esportando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Esporta
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportManager;