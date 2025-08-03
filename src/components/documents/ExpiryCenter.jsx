// components/documents/ExpiryCenter.jsx
import React, { useState, useMemo } from 'react';
import { Clock, AlertTriangle, Mail, FileText, Calendar, CheckCircle, Bell } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const ExpiryCenter = ({ documents, onDocumentClick, onUploadClick }) => {
  const [selectedDocuments, setSelectedDocuments] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');

  // Raggruppamento per urgenza
  const documentsByUrgency = useMemo(() => {
    const groups = {
      expired: documents.filter(d => d.status === 'expired'),
      critical: documents.filter(d => d.status === 'critical' && d.daysToExpiry >= 0),
      warning: documents.filter(d => d.status === 'warning')
    };
    
    return groups;
  }, [documents]);

  // Statistiche urgenza
  const urgencyStats = useMemo(() => {
    const total = documents.length;
    const expired = documentsByUrgency.expired.length;
    const critical = documentsByUrgency.critical.length;
    const warning = documentsByUrgency.warning.length;
    
    return { total, expired, critical, warning };
  }, [documents, documentsByUrgency]);

  const handleDocumentSelection = (docId, athleteId) => {
    const key = `${athleteId}-${docId}`;
    const newSelection = new Set(selectedDocuments);
    
    if (newSelection.has(key)) {
      newSelection.delete(key);
    } else {
      newSelection.add(key);
    }
    
    setSelectedDocuments(newSelection);
  };

  const handleSelectAll = (group) => {
    const newSelection = new Set(selectedDocuments);
    
    group.forEach(doc => {
      const key = `${doc.athleteId}-${doc.id}`;
      newSelection.add(key);
    });
    
    setSelectedDocuments(newSelection);
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedDocuments.size === 0) return;
    
    console.log('Bulk action:', bulkAction, 'on', selectedDocuments.size, 'documents');
    
    switch (bulkAction) {
      case 'reminder':
        console.log('Sending reminders...');
        break;
      case 'export':
        console.log('Exporting documents...');
        break;
      case 'mark_notified':
        console.log('Marking as notified...');
        break;
      default:
        break;
    }
    
    // Reset selections
    setSelectedDocuments(new Set());
    setBulkAction('');
  };

  const getPriorityColor = (status, daysToExpiry) => {
    if (status === 'expired') return 'bg-red-500';
    if (daysToExpiry <= 7) return 'bg-orange-500';
    if (daysToExpiry <= 15) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getPriorityLabel = (status, daysToExpiry) => {
    if (status === 'expired') return 'SCADUTO';
    if (daysToExpiry <= 7) return 'CRITICO';
    if (daysToExpiry <= 15) return 'URGENTE';
    return 'NORMALE';
  };

  const UrgencySection = ({ title, documents: sectionDocs, icon: Icon, color, description }) => (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-900">{sectionDocs.length}</span>
          {sectionDocs.length > 0 && (
            <button
              onClick={() => handleSelectAll(sectionDocs)}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Seleziona Tutti
            </button>
          )}
        </div>
      </div>
      
      {sectionDocs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-300" />
          <p>Nessun documento in questa categoria</p>
          <p className="text-sm">Ottimo lavoro!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sectionDocs.map(doc => {
            const isSelected = selectedDocuments.has(`${doc.athleteId}-${doc.id}`);
            
            return (
              <div
                key={`${doc.athleteId}-${doc.id}`}
                className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onDocumentClick(doc)}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleDocumentSelection(doc.id, doc.athleteId);
                    }}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  
                  <div className={`w-1 h-16 rounded ${getPriorityColor(doc.status, doc.daysToExpiry)}`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {doc.athleteName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(doc.expiryDate).toLocaleDateString('it-IT')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          doc.status === 'expired' ? 'bg-red-100 text-red-800' :
                          doc.daysToExpiry <= 7 ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {getPriorityLabel(doc.status, doc.daysToExpiry)}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {doc.status === 'expired' ? 
                            `Scaduto ${Math.abs(doc.daysToExpiry)} giorni fa` :
                            `${doc.daysToExpiry} giorni rimanenti`
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center gap-2">
                      <StatusBadge status={doc.status} size="sm">
                        {doc.status === 'expired' ? 'Scaduto' :
                         doc.status === 'critical' ? 'Critico' : 'In Scadenza'}
                      </StatusBadge>
                      <span className="text-xs text-gray-500">{doc.teamName}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header con Statistiche */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="h-6 w-6 text-blue-500" />
              Centro Scadenze
            </h2>
            <p className="text-gray-600 mt-1">Gestione prioritaria documenti in scadenza</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold text-red-600">{urgencyStats.expired + urgencyStats.critical}</p>
              <p className="text-xs text-gray-600">Interventi Urgenti</p>
            </div>
          </div>
        </div>

        {/* Panoramica Urgenze */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-700">{urgencyStats.expired}</p>
                <p className="text-sm text-red-600">Scaduti</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-orange-700">{urgencyStats.critical}</p>
                <p className="text-sm text-orange-600">Critici</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-700">{urgencyStats.warning}</p>
                <p className="text-sm text-yellow-600">In Scadenza</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-700">{urgencyStats.total}</p>
                <p className="text-sm text-blue-600">Totali</p>
              </div>
            </div>
          </div>
        </div>

        {/* Azioni di Massa */}
        {selectedDocuments.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-800">
                  {selectedDocuments.size} documenti selezionati
                </span>
                
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-1 border border-blue-300 rounded text-sm bg-white"
                >
                  <option value="">Seleziona azione...</option>
                  <option value="reminder">Invia Reminder</option>
                  <option value="export">Esporta Lista</option>
                  <option value="mark_notified">Segna come Notificato</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded text-sm transition-colors"
                >
                  Esegui Azione
                </button>
                <button
                  onClick={() => setSelectedDocuments(new Set())}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                >
                  Deseleziona Tutti
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sezioni per Urgenza */}
      <UrgencySection
        title="Documenti Scaduti"
        documents={documentsByUrgency.expired}
        icon={AlertTriangle}
        color="bg-red-500"
        description="Documenti già scaduti - Azione immediata richiesta"
      />
      
      <UrgencySection
        title="Scadenze Critiche"
        documents={documentsByUrgency.critical}
        icon={Clock}
        color="bg-orange-500"
        description="Scadenze entro 15 giorni - Pianificare rinnovo"
      />
      
      <UrgencySection
        title="Scadenze Prossime"
        documents={documentsByUrgency.warning}
        icon={Bell}
        color="bg-yellow-500"
        description="Scadenze entro 30 giorni - Monitorare da vicino"
      />

      {/* Azioni Rapide Bottom */}
      {documents.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-500" />
            Azioni Rapide
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => {
                const expiredDocs = documentsByUrgency.expired;
                expiredDocs.forEach(doc => {
                  setSelectedDocuments(prev => new Set([...prev, `${doc.athleteId}-${doc.id}`]));
                });
                setBulkAction('reminder');
              }}
              className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-left"
            >
              <Mail className="h-6 w-6 text-red-500 mb-2" />
              <h4 className="font-medium text-red-800">Reminder Scaduti</h4>
              <p className="text-sm text-red-600">Invia notifiche per documenti scaduti</p>
            </button>
            
            <button 
              onClick={() => {
                console.log('Generating compliance report...');
              }}
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
            >
              <FileText className="h-6 w-6 text-blue-500 mb-2" />
              <h4 className="font-medium text-blue-800">Report Conformità</h4>
              <p className="text-sm text-blue-600">Genera report stato documenti</p>
            </button>
            
            <button 
              onClick={() => {
                console.log('Scheduling bulk renewals...');
              }}
              className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
            >
              <Calendar className="h-6 w-6 text-green-500 mb-2" />
              <h4 className="font-medium text-green-800">Rinnovi Programmati</h4>
              <p className="text-sm text-green-600">Pianifica rinnovi automatici</p>
            </button>
            
            <button 
              onClick={onUploadClick}
              className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
            >
              <FileText className="h-6 w-6 text-purple-500 mb-2" />
              <h4 className="font-medium text-purple-800">Upload Documento</h4>
              <p className="text-sm text-purple-600">Carica nuovo documento</p>
            </button>
          </div>
        </div>
      )}

      {/* Stato Vuoto */}
      {documents.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-400" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            🎉 Ottimo lavoro!
          </h3>
          <p className="text-gray-600 mb-4">
            Non ci sono documenti in scadenza o scaduti al momento.
          </p>
          <p className="text-sm text-gray-500">
            Tutti i documenti sono validi e aggiornati. Continua così!
          </p>
        </div>
      )}
    </div>
  );
};

export default ExpiryCenter;