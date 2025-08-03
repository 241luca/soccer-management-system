// components/documents/DocumentsDashboard.jsx
import React from 'react';
import { FileText, Calendar, Users, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const DocumentsDashboard = ({ documents, stats, onDocumentClick, onUploadClick, teams }) => {
  
  // Documenti in scadenza per categoria
  const documentsByType = {
    medical: documents.filter(d => d.type === 'medical'),
    insurance: documents.filter(d => d.type === 'insurance'),
    figc: documents.filter(d => d.type === 'figc'),
    other: documents.filter(d => d.type === 'other')
  };

  // Documenti più urgenti (prossimi a scadere)
  const urgentDocuments = documents
    .filter(d => d.status === 'critical' || d.status === 'expired')
    .slice(0, 5);

  // Statistiche per team
  const teamStats = teams.map(team => {
    const teamDocs = documents.filter(d => d.teamId === team.id);
    const expired = teamDocs.filter(d => d.status === 'expired').length;
    const critical = teamDocs.filter(d => d.status === 'critical').length;
    const total = teamDocs.length;
    
    return {
      ...team,
      documents: total,
      issues: expired + critical,
      compliance: total > 0 ? Math.round(((total - expired - critical) / total) * 100) : 100
    };
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'expired': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'warning': return <Calendar className="h-4 w-4 text-yellow-500" />;
      default: return <FileText className="h-4 w-4 text-green-500" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'medical': return 'Certificati Medici';
      case 'insurance': return 'Polizze Assicurative';
      case 'figc': return 'Documenti FIGC';
      default: return 'Altri Documenti';
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Scadenze Critiche */}
      {urgentDocuments.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-red-800 font-medium">
                ⚠️ Attenzione: {urgentDocuments.length} documenti richiedono intervento immediato
              </h3>
              <p className="text-red-700 text-sm mt-1">
                Documenti scaduti o in scadenza critica. Agire entro 15 giorni.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {urgentDocuments.slice(0, 3).map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => onDocumentClick(doc)}
                    className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200"
                  >
                    {doc.athleteName} - {doc.name}
                  </button>
                ))}
                {urgentDocuments.length > 3 && (
                  <span className="text-xs text-red-600">
                    e altri {urgentDocuments.length - 3}...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panoramica per Tipologia */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Documenti per Tipologia
          </h3>
          
          <div className="space-y-4">
            {Object.entries(documentsByType).map(([type, docs]) => {
              const valid = docs.filter(d => d.status === 'valid').length;
              const total = docs.length;
              const percentage = total > 0 ? Math.round((valid / total) * 100) : 100;
              
              return (
                <div key={type} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{getTypeLabel(type)}</h4>
                    <span className="text-sm text-gray-600">{total} documenti</span>
                  </div>
                  
                  <div className="flex justify-between text-sm mb-2">
                    <span>Conformità</span>
                    <span className={`font-medium ${percentage >= 90 ? 'text-green-600' : percentage >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {percentage}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${percentage >= 90 ? 'bg-green-500' : percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>{valid} validi</span>
                    <span>{total - valid} da rinnovare</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conformità per Squadra */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Conformità per Squadra
          </h3>
          
          <div className="space-y-3">
            {teamStats.map(team => (
              <div key={team.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{team.name}</h4>
                    <div className="flex items-center gap-2">
                      {team.compliance >= 90 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${
                        team.compliance >= 90 ? 'text-green-600' : 
                        team.compliance >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {team.compliance}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>{team.documents} documenti totali</span>
                    {team.issues > 0 && (
                      <span className="text-red-600 font-medium">{team.issues} problematici</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scadenze Imminenti */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Scadenze Imminenti (prossimi 30 giorni)
        </h3>
        
        {documents.filter(d => d.daysToExpiry <= 30 && d.daysToExpiry >= 0).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Nessuna scadenza imminente nei prossimi 30 giorni</p>
            <p className="text-sm">Ottimo lavoro nel mantenere i documenti aggiornati!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Atleta</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Documento</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Scadenza</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Giorni</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Stato</th>
                </tr>
              </thead>
              <tbody>
                {documents
                  .filter(d => d.daysToExpiry <= 30 && d.daysToExpiry >= 0)
                  .slice(0, 10)
                  .map(doc => (
                    <tr 
                      key={`${doc.athleteId}-${doc.id}`} 
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => onDocumentClick(doc)}
                    >
                      <td className="py-3 text-sm">
                        <div>
                          <p className="font-medium">{doc.athleteName}</p>
                          <p className="text-gray-600 text-xs">{doc.teamName}</p>
                        </div>
                      </td>
                      <td className="py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(doc.status)}
                          {doc.name}
                        </div>
                      </td>
                      <td className="py-3 text-sm">
                        {new Date(doc.expiryDate).toLocaleDateString('it-IT')}
                      </td>
                      <td className="py-3 text-sm">
                        <span className={`font-medium ${
                          doc.daysToExpiry <= 7 ? 'text-red-600' : 
                          doc.daysToExpiry <= 15 ? 'text-orange-600' : 'text-yellow-600'
                        }`}>
                          {doc.daysToExpiry} giorni
                        </span>
                      </td>
                      <td className="py-3">
                        <StatusBadge status={doc.status} size="sm">
                          {doc.status === 'expired' ? 'Scaduto' :
                           doc.status === 'critical' ? 'Critico' :
                           doc.status === 'warning' ? 'In Scadenza' : 'Valido'}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Azioni Rapide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-blue-800 font-medium mb-3">🚀 Azioni Rapide</h3>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={onUploadClick}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
          >
            Upload Nuovo Documento
          </button>
          <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors">
            Export Scadenze
          </button>
          <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm transition-colors">
            Invia Reminder
          </button>
          <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm transition-colors">
            Report Conformità
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentsDashboard;