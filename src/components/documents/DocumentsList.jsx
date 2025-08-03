// components/documents/DocumentsList.jsx
import React, { useState, useMemo } from 'react';
import { FileText, Download, Edit, Trash2, Search, Calendar, User, Filter } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const DocumentsList = ({ documents, onDocumentClick, onUploadClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('expiryDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [groupBy, setGroupBy] = useState('none');

  // Filtro per ricerca
  const searchedDocuments = useMemo(() => {
    if (!searchTerm) return documents;
    
    return documents.filter(doc =>
      doc.athleteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.teamName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [documents, searchTerm]);

  // Ordinamento
  const sortedDocuments = useMemo(() => {
    const sorted = [...searchedDocuments].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'athleteName':
          aValue = a.athleteName;
          bValue = b.athleteName;
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'expiryDate':
          aValue = new Date(a.expiryDate);
          bValue = new Date(b.expiryDate);
          break;
        case 'uploadDate':
          aValue = new Date(a.uploadDate);
          bValue = new Date(b.uploadDate);
          break;
        case 'status':
          const statusOrder = { expired: 0, critical: 1, warning: 2, valid: 3 };
          aValue = statusOrder[a.status];
          bValue = statusOrder[b.status];
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [searchedDocuments, sortBy, sortOrder]);

  // Raggruppamento
  const groupedDocuments = useMemo(() => {
    if (groupBy === 'none') {
      return { 'Tutti i documenti': sortedDocuments };
    }
    
    const groups = {};
    
    sortedDocuments.forEach(doc => {
      let groupKey;
      
      switch (groupBy) {
        case 'athlete':
          groupKey = doc.athleteName;
          break;
        case 'team':
          groupKey = doc.teamName;
          break;
        case 'type':
          groupKey = getTypeLabel(doc.type);
          break;
        case 'status':
          groupKey = getStatusLabel(doc.status);
          break;
        default:
          groupKey = 'Tutti';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(doc);
    });
    
    return groups;
  }, [sortedDocuments, groupBy]);

  const getTypeLabel = (type) => {
    switch (type) {
      case 'medical': return 'Certificati Medici';
      case 'insurance': return 'Polizze Assicurative';
      case 'figc': return 'Documenti FIGC';
      default: return 'Altri Documenti';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'expired': return 'Scaduti';
      case 'critical': return 'Critici';
      case 'warning': return 'In Scadenza';
      default: return 'Validi';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'expired': return '🔴';
      case 'critical': return '🟠';
      case 'warning': return '🟡';
      default: return '🟢';
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const DocumentRow = ({ doc }) => (
    <tr 
      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onDocumentClick(doc)}
    >
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{doc.name}</p>
            <p className="text-sm text-gray-600">{getTypeLabel(doc.type)}</p>
          </div>
        </div>
      </td>
      
      <td className="py-4 px-4">
        <div>
          <p className="font-medium text-gray-900">{doc.athleteName}</p>
          <p className="text-sm text-gray-600">{doc.teamName}</p>
        </div>
      </td>
      
      <td className="py-4 px-4 text-sm text-gray-600">
        {new Date(doc.uploadDate).toLocaleDateString('it-IT')}
      </td>
      
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {new Date(doc.expiryDate).toLocaleDateString('it-IT')}
          </span>
          <span className={`text-xs font-medium ${
            doc.daysToExpiry < 0 ? 'text-red-600' :
            doc.daysToExpiry <= 15 ? 'text-orange-600' :
            doc.daysToExpiry <= 30 ? 'text-yellow-600' : 'text-green-600'
          }`}>
            ({doc.daysToExpiry >= 0 ? `${doc.daysToExpiry} giorni` : 'Scaduto'})
          </span>
        </div>
      </td>
      
      <td className="py-4 px-4">
        <StatusBadge status={doc.status} size="sm">
          {getStatusIcon(doc.status)} {getStatusLabel(doc.status)}
        </StatusBadge>
      </td>
      
      <td className="py-4 px-4 text-sm text-gray-600">
        {doc.fileSize}
      </td>
      
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDocumentClick(doc);
            }}
            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
            title="Visualizza"
          >
            <FileText className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              console.log('Download:', doc.name);
            }}
            className="p-1 text-green-600 hover:text-green-800 transition-colors"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDocumentClick(doc);
            }}
            className="p-1 text-orange-600 hover:text-orange-800 transition-colors"
            title="Modifica"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header e Controlli */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold">Lista Documenti ({sortedDocuments.length})</h2>
          
          <div className="flex gap-3">
            <button
              onClick={onUploadClick}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Nuovo Documento
            </button>
            <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Lista
            </button>
          </div>
        </div>

        {/* Controlli Ricerca e Filtri */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca per atleta, documento o squadra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="none">Nessun raggruppamento</option>
              <option value="athlete">Per Atleta</option>
              <option value="team">Per Squadra</option>
              <option value="type">Per Tipo</option>
              <option value="status">Per Stato</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabella Documenti */}
      <div className="overflow-x-auto">
        {Object.entries(groupedDocuments).map(([groupName, groupDocs]) => (
          <div key={groupName} className="mb-6">
            {groupBy !== 'none' && (
              <h3 className="text-lg font-medium text-gray-800 mb-3 border-b border-gray-200 pb-2">
                {groupName} ({groupDocs.length})
              </h3>
            )}
            
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th 
                    className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:text-gray-800"
                    onClick={() => handleSort('name')}
                  >
                    Documento {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:text-gray-800"
                    onClick={() => handleSort('athleteName')}
                  >
                    Atleta {sortBy === 'athleteName' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:text-gray-800"
                    onClick={() => handleSort('uploadDate')}
                  >
                    Caricato {sortBy === 'uploadDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:text-gray-800"
                    onClick={() => handleSort('expiryDate')}
                  >
                    Scadenza {sortBy === 'expiryDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:text-gray-800"
                    onClick={() => handleSort('status')}
                  >
                    Stato {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Dimensione</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {groupDocs.map(doc => (
                  <DocumentRow key={`${doc.athleteId}-${doc.id}`} doc={doc} />
                ))}
              </tbody>
            </table>
            
            {groupDocs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Nessun documento trovato per questo gruppo</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {sortedDocuments.length === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-500">
          <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Nessun documento trovato per "{searchTerm}"</p>
          <p className="text-sm">Prova con un termine di ricerca diverso</p>
        </div>
      )}
    </div>
  );
};

export default DocumentsList;