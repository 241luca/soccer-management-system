// components/documents/DocumentsView.jsx
import React, { useState, useMemo } from 'react';
import { FileText, Clock, AlertTriangle, CheckCircle, Upload, Calendar, Filter, Download } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import DocumentsDashboard from './DocumentsDashboard';
import DocumentsList from './DocumentsList';
import ExpiryCenter from './ExpiryCenter';
import DocumentModal from './DocumentModal';

const DocumentsView = ({ data, stats, selectedTeam, setCurrentView }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    team: selectedTeam?.id || 'all',
    expiryRange: 'all'
  });

  console.log('DocumentsView rendering with data:', data);

  // Calcolo documenti con stati aggiornati
  const allDocuments = useMemo(() => {
    const docs = [];
    data?.athletes?.forEach(athlete => {
      athlete.documents?.forEach(doc => {
        const today = new Date();
        const expiryDate = new Date(doc.expiryDate);
        const daysToExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        let status = 'valid';
        if (daysToExpiry < 0) status = 'expired';
        else if (daysToExpiry <= 15) status = 'critical';
        else if (daysToExpiry <= 30) status = 'warning';
        
        docs.push({
          ...doc,
          athleteId: athlete.id,
          athleteName: athlete.name,
          teamName: athlete.teamName,
          teamId: athlete.teamId,
          daysToExpiry,
          status
        });
      });
    });
    return docs.sort((a, b) => a.daysToExpiry - b.daysToExpiry);
  }, [data]);

  // Filtri applicati
  const filteredDocuments = useMemo(() => {
    return allDocuments.filter(doc => {
      if (filters.type !== 'all' && doc.type !== filters.type) return false;
      if (filters.status !== 'all' && doc.status !== filters.status) return false;
      if (filters.team !== 'all' && doc.teamId !== parseInt(filters.team)) return false;
      
      if (filters.expiryRange !== 'all') {
        const days = parseInt(filters.expiryRange);
        if (doc.daysToExpiry > days) return false;
      }
      
      return true;
    });
  }, [allDocuments, filters]);

  // Statistiche documenti
  const documentStats = useMemo(() => {
    const total = allDocuments.length;
    const valid = allDocuments.filter(d => d.status === 'valid').length;
    const warning = allDocuments.filter(d => d.status === 'warning').length;
    const critical = allDocuments.filter(d => d.status === 'critical').length;
    const expired = allDocuments.filter(d => d.status === 'expired').length;
    
    return { total, valid, warning, critical, expired };
  }, [allDocuments]);

  const handleDocumentClick = (document) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
  };

  const handleUploadDocument = () => {
    setSelectedDocument(null);
    setShowUploadModal(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FileText },
    { id: 'list', label: 'Lista Documenti', icon: Calendar },
    { id: 'expiry', label: 'Centro Scadenze', icon: Clock }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-500" />
              Gestione Documenti
            </h1>
            <p className="text-gray-600 mt-1">Scadenze, upload e conformità societaria</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleUploadDocument}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Documento
            </button>
            <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Statistiche Rapide */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Totali</p>
                <p className="text-2xl font-bold text-gray-900">{documentStats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Validi</p>
                <p className="text-2xl font-bold text-green-700">{documentStats.valid}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">In Scadenza</p>
                <p className="text-2xl font-bold text-yellow-700">{documentStats.warning}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Critici</p>
                <p className="text-2xl font-bold text-orange-700">{documentStats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-400" />
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Scaduti</p>
                <p className="text-2xl font-bold text-red-700">{documentStats.expired}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Filtri Globali */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Filtri:</span>
          </div>
          
          <select 
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="all">Tutti i tipi</option>
            <option value="medical">Medici</option>
            <option value="insurance">Assicurativi</option>
            <option value="figc">FIGC</option>
            <option value="other">Altri</option>
          </select>
          
          <select 
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="all">Tutti gli stati</option>
            <option value="valid">Validi</option>
            <option value="warning">In Scadenza</option>
            <option value="critical">Critici</option>
            <option value="expired">Scaduti</option>
          </select>
          
          <select 
            value={filters.team}
            onChange={(e) => handleFilterChange('team', e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="all">Tutte le squadre</option>
            {data?.teams?.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
          
          <select 
            value={filters.expiryRange}
            onChange={(e) => handleFilterChange('expiryRange', e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="all">Tutte le scadenze</option>
            <option value="15">Entro 15 giorni</option>
            <option value="30">Entro 30 giorni</option>
            <option value="60">Entro 60 giorni</option>
            <option value="90">Entro 90 giorni</option>
          </select>
          
          {Object.values(filters).some(f => f !== 'all') && (
            <button 
              onClick={() => setFilters({ type: 'all', status: 'all', team: 'all', expiryRange: 'all' })}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
            >
              Rimuovi filtri
            </button>
          )}
        </div>
      </div>

      {/* Content based on active tab */}
      <div className="min-h-96">
        {activeTab === 'dashboard' && (
          <DocumentsDashboard 
            documents={filteredDocuments}
            stats={documentStats}
            onDocumentClick={handleDocumentClick}
            onUploadClick={handleUploadDocument}
            teams={data?.teams || []}
          />
        )}
        
        {activeTab === 'list' && (
          <DocumentsList 
            documents={filteredDocuments}
            onDocumentClick={handleDocumentClick}
            onUploadClick={handleUploadDocument}
          />
        )}
        
        {activeTab === 'expiry' && (
          <ExpiryCenter 
            documents={filteredDocuments.filter(d => d.status !== 'valid')}
            onDocumentClick={handleDocumentClick}
            onUploadClick={handleUploadDocument}
          />
        )}
      </div>

      {/* Modal Upload/Modifica Documento */}
      {(showDocumentModal || showUploadModal) && (
        <DocumentModal
          document={selectedDocument}
          isUpload={showUploadModal}
          onClose={() => {
            setShowDocumentModal(false);
            setShowUploadModal(false);
            setSelectedDocument(null);
          }}
          onSave={(documentData) => {
            console.log('Document saved:', documentData);
            // TODO: Implementare salvataggio effettivo
            setShowDocumentModal(false);
            setShowUploadModal(false);
            setSelectedDocument(null);
          }}
          athletes={data?.athletes || []}
        />
      )}
    </div>
  );
};

export default DocumentsView;