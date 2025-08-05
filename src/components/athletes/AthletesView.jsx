// components/athletes/AthletesView.jsx
import React, { useState, useMemo } from 'react';
import { Search, Filter, Users, AlertTriangle, Calendar, Phone, Mail, MapPin } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import AthleteModal from './AthleteModal';
import ExportButton from '../export/ExportButton';

const AthletesView = ({ data, stats, selectedTeam, searchTerm, setSearchTerm, toast }) => {
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [showAthleteModal, setShowAthleteModal] = useState(false);
  const [filters, setFilters] = useState({
    team: selectedTeam?.id || '',
    position: '',
    ageStatus: '',
    documentStatus: '',
    paymentStatus: ''
  });
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  // Filtri e ricerca
  const filteredAthletes = useMemo(() => {
    return data.athletes.filter(athlete => {
      const matchesSearch = !searchTerm || 
        (athlete.firstName && athlete.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (athlete.lastName && athlete.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (athlete.name && athlete.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (athlete.teamName && athlete.teamName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTeam = !filters.team || athlete.teamId === parseInt(filters.team);
      const matchesPosition = !filters.position || athlete.position === filters.position;
      
      const matchesAgeStatus = !filters.ageStatus || 
        (filters.ageStatus === 'valid' && athlete.isAgeValid) ||
        (filters.ageStatus === 'invalid' && !athlete.isAgeValid);
      
      const today = new Date();
      const hasExpiringDocs = new Date(athlete.medicalExpiry) - today < 30 * 24 * 60 * 60 * 1000 ||
                             new Date(athlete.insuranceExpiry) - today < 30 * 24 * 60 * 60 * 1000;
      
      const matchesDocStatus = !filters.documentStatus ||
        (filters.documentStatus === 'expiring' && hasExpiringDocs) ||
        (filters.documentStatus === 'valid' && !hasExpiringDocs);
      
      const matchesPaymentStatus = !filters.paymentStatus || athlete.feeStatus === filters.paymentStatus;
      
      return matchesSearch && matchesTeam && matchesPosition && matchesAgeStatus && matchesDocStatus && matchesPaymentStatus;
    });
  }, [data.athletes, searchTerm, filters]);

  const uniquePositions = [...new Set(data.athletes.map(a => a.position))];

  const handleAthleteClick = (athlete) => {
    setSelectedAthlete(athlete);
    setShowAthleteModal(true);
  };

  const getDocumentStatus = (athlete) => {
    const today = new Date();
    const medicalExpiring = new Date(athlete.medicalExpiry) - today < 30 * 24 * 60 * 60 * 1000;
    const insuranceExpiring = new Date(athlete.insuranceExpiry) - today < 30 * 24 * 60 * 60 * 1000;
    
    if (medicalExpiring || insuranceExpiring) return 'warning';
    return 'valid';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('it-IT');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-500" />
              Gestione Atlete
            </h1>
            <p className="text-gray-600 mt-1">
              {filteredAthletes.length} di {data.athletes.length} atlete
              {selectedTeam && ` • ${selectedTeam.name}`}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <ExportButton 
              data={data}
              stats={stats}
              dataType="athletes"
              buttonText="Esporta Atlete"
              variant="outline"
              size="normal"
              toast={toast}
            />
            
            <div className="flex gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {viewMode === 'table' ? 'Vista Schede' : 'Vista Tabella'}
            </button>
            <button
              onClick={() => {
                setSelectedAthlete(null);
                setShowAthleteModal(true);
              }}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Nuova Atleta
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtri e Ricerca */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Ricerca */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca per nome o squadra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro Squadra */}
          <select
            value={filters.team}
            onChange={(e) => setFilters({...filters, team: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tutte le squadre</option>
            {data.teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>

          {/* Filtro Posizione */}
          <select
            value={filters.position}
            onChange={(e) => setFilters({...filters, position: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tutte le posizioni</option>
            {uniquePositions.map(position => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>

          {/* Filtro Età */}
          <select
            value={filters.ageStatus}
            onChange={(e) => setFilters({...filters, ageStatus: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tutte le età</option>
            <option value="valid">Età conforme</option>
            <option value="invalid">Età non conforme</option>
          </select>

          {/* Filtro Documenti */}
          <select
            value={filters.documentStatus}
            onChange={(e) => setFilters({...filters, documentStatus: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tutti i documenti</option>
            <option value="valid">Documenti validi</option>
            <option value="expiring">In scadenza</option>
          </select>
        </div>
      </div>

      {/* Statistiche Rapide */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Totale Filtrate</p>
              <p className="text-2xl font-bold">{filteredAthletes.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Età Non Conforme</p>
              <p className="text-2xl font-bold text-orange-600">
                {filteredAthletes.filter(a => !a.isAgeValid).length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Doc. in Scadenza</p>
              <p className="text-2xl font-bold text-red-600">
                {filteredAthletes.filter(a => getDocumentStatus(a) === 'warning').length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pagamenti Pendenti</p>
              <p className="text-2xl font-bold text-yellow-600">
                {filteredAthletes.filter(a => a.feeStatus === 'pending').length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Lista Atlete */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Atleta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Squadra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Età/Conformità
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documenti
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pagamenti
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contatti
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAthletes.map(athlete => (
                  <tr 
                    key={athlete.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleAthleteClick(athlete)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                            {(athlete.firstName || athlete.name || '?').charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {athlete.firstName && athlete.lastName 
                              ? `${athlete.firstName} ${athlete.lastName}`
                              : athlete.name || 'Nome non disponibile'
                            }
                          </div>
                          <div className="text-sm text-gray-500">{athlete.position} • #{athlete.number}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{athlete.teamName}</div>
                      <div className="text-sm text-gray-500">
                        {data.teams.find(t => t.id === athlete.teamId)?.category}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{athlete.age} anni</span>
                        <StatusBadge status={athlete.isAgeValid ? 'valid' : 'critical'}>
                          {athlete.isAgeValid ? 'Conforme' : 'Non conforme'}
                        </StatusBadge>
                      </div>
                      {!athlete.isAgeValid && athlete.suggestedTeam && (
                        <div className="text-xs text-orange-600 mt-1">
                          → {athlete.suggestedTeam}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={getDocumentStatus(athlete)}>
                            {getDocumentStatus(athlete) === 'warning' ? 'In scadenza' : 'Validi'}
                          </StatusBadge>
                        </div>
                        <div className="text-xs text-gray-500">
                          Med: {formatDate(athlete.medicalExpiry)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Ass: {formatDate(athlete.insuranceExpiry)}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={athlete.feeStatus === 'paid' ? 'valid' : 'warning'}>
                        {athlete.feeStatus === 'paid' ? 'Pagato' : 'Pendente'}
                      </StatusBadge>
                      <div className="text-xs text-gray-500 mt-1">
                        €{athlete.membershipFee}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span className="text-xs">{athlete.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="text-xs truncate max-w-24">{athlete.email}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredAthletes.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nessuna atleta trovata</h3>
              <p className="mt-1 text-sm text-gray-500">
                Prova a modificare i filtri di ricerca.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Vista a schede */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAthletes.map(athlete => (
            <div 
              key={athlete.id}
              onClick={() => handleAthleteClick(athlete)}
              className="bg-white rounded-lg shadow hover:shadow-lg p-4 cursor-pointer transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                  {(athlete.firstName || athlete.name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    {athlete.firstName && athlete.lastName 
                      ? `${athlete.firstName} ${athlete.lastName}`
                      : athlete.name || 'Nome non disponibile'
                    }
                  </h3>
                  <p className="text-sm text-gray-600">{athlete.position} • #{athlete.number}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Squadra:</span>
                  <span className="text-sm font-medium">{athlete.teamName}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Età:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{athlete.age} anni</span>
                    <StatusBadge status={athlete.isAgeValid ? 'valid' : 'critical'} size="sm">
                      {athlete.isAgeValid ? '✓' : '⚠'}
                    </StatusBadge>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Documenti:</span>
                  <StatusBadge status={getDocumentStatus(athlete)} size="sm">
                    {getDocumentStatus(athlete) === 'warning' ? 'Scadenza' : 'OK'}
                  </StatusBadge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pagamento:</span>
                  <StatusBadge status={athlete.feeStatus === 'paid' ? 'valid' : 'warning'} size="sm">
                    {athlete.feeStatus === 'paid' ? 'Pagato' : 'Pendente'}
                  </StatusBadge>
                </div>
              </div>
              
              {athlete.usesBus && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span>{athlete.assignedBus?.name}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {filteredAthletes.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nessuna atleta trovata</h3>
              <p className="mt-1 text-sm text-gray-500">
                Prova a modificare i filtri di ricerca.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal Dettaglio Atleta */}
      {showAthleteModal && (
        <AthleteModal
          athlete={selectedAthlete}
          data={data}
          onClose={() => {
            setShowAthleteModal(false);
            setSelectedAthlete(null);
          }}
          onSave={(athleteData) => {
            // TODO: Implementare salvataggio
            console.log('Saving athlete:', athleteData);
            setShowAthleteModal(false);
            setSelectedAthlete(null);
          }}
        />
      )}
    </div>
  );
};

export default AthletesView;