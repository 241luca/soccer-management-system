// components/transport/BusesList.jsx
import React, { useState } from 'react';
import { Bus, Navigation, Users, AlertTriangle, Edit, Plus, User } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const BusesList = ({ data, transportData, filteredAthletes, onEditBus, onNewBus }) => {
  const [selectedBus, setSelectedBus] = useState(null);
  const [showAssignments, setShowAssignments] = useState(false);

  // Gestione assegnazione atlete
  const handleAssignAthlete = (athleteId, busId) => {
    // In un'app reale, qui aggiornerei lo stato
    console.log(`Assigning athlete ${athleteId} to bus ${busId}`);
  };

  const handleRemoveAssignment = (athleteId) => {
    // In un'app reale, qui rimuoverei l'assegnazione
    console.log(`Removing assignment for athlete ${athleteId}`);
  };

  return (
    <div className="space-y-6">
      {/* Azioni Header */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Gestione Pulmini</h3>
          <button
            onClick={onNewBus}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            <Plus className="h-4 w-4 mr-2 inline" />
            Nuovo Pulmino
          </button>
        </div>
      </div>

      {/* Lista Pulmini */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {transportData.busStats.map(bus => (
          <div key={bus.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Bus className="h-6 w-6 text-blue-500" />
                <div>
                  <h4 className="text-lg font-bold">{bus.name}</h4>
                  <p className="text-sm text-gray-600">{bus.route}</p>
                </div>
              </div>
              <StatusBadge status={bus.status}>
                {bus.status === 'valid' && 'Ottimale'}
                {bus.status === 'warning' && 'Quasi Pieno'}
                {bus.status === 'critical' && 'Sovraffollato'}
                {bus.status === 'pending' && 'Sottoutilizzato'}
              </StatusBadge>
            </div>

            {/* Informazioni Pulmino */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capienza:</span>
                  <span className="font-medium">{bus.capacity} posti</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Assegnate:</span>
                  <span className="font-medium">{bus.assignedAthletes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Utilizzo:</span>
                  <span className={`font-medium ${
                    bus.utilization > 100 ? 'text-red-600' : 
                    bus.utilization > 90 ? 'text-orange-600' : 
                    'text-green-600'
                  }`}>
                    {bus.utilization}%
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Autista:</span>
                  <span className="font-medium">{bus.driver}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Targa:</span>
                  <span className="font-medium">{bus.plate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Incassi:</span>
                  <span className="font-medium text-green-600">€{bus.revenue}/mese</span>
                </div>
              </div>
            </div>

            {/* Barra Utilizzo */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Utilizzo Capienza</span>
                <span>{bus.assignedAthletes}/{bus.capacity}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    bus.utilization > 100 ? 'bg-red-500' :
                    bus.utilization > 90 ? 'bg-orange-500' :
                    bus.utilization > 70 ? 'bg-green-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(bus.utilization, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Atlete Assegnate */}
            <div className="border-t pt-4">
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Atlete Assegnate ({bus.athletes.length})
              </h5>
              
              {bus.athletes.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {bus.athletes.map(athlete => (
                    <div key={athlete.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-gray-500" />
                        <span className="text-sm font-medium">{athlete.name}</span>
                        <span className="text-xs text-gray-500">({athlete.teamName})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full bg-${athlete.zone.color}-500`}></span>
                        <StatusBadge status={athlete.busFeeStatus === 'paid' ? 'valid' : 'warning'} size="sm">
                          {athlete.busFeeStatus === 'paid' ? 'Pagato' : 'Pending'}
                        </StatusBadge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Nessuna atleta assegnata</p>
              )}
            </div>

            {/* Azioni */}
            <div className="border-t pt-4 mt-4 flex gap-2">
              <button
                onClick={() => onEditBus(bus)}
                className="flex-1 px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
              >
                <Edit className="h-4 w-4 mr-1 inline" />
                Modifica
              </button>
              <button
                onClick={() => {
                  setSelectedBus(bus);
                  setShowAssignments(true);
                }}
                className="flex-1 px-3 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50"
              >
                <Users className="h-4 w-4 mr-1 inline" />
                Gestisci Assegnazioni
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Statistiche Riassuntive */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4">Statistiche Flotta</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-600 text-sm font-medium">Pulmini Attivi</p>
            <p className="text-2xl font-bold text-blue-700">{transportData.busStats.length}</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-green-600 text-sm font-medium">Capienza Totale</p>
            <p className="text-2xl font-bold text-green-700">{transportData.totalCapacity}</p>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-orange-600 text-sm font-medium">Utilizzo Medio</p>
            <p className="text-2xl font-bold text-orange-700">
              {Math.round((transportData.totalBusUsers / transportData.totalCapacity) * 100)}%
            </p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-purple-600 text-sm font-medium">Incassi Totali</p>
            <p className="text-2xl font-bold text-purple-700">€{transportData.totalRevenue}</p>
          </div>
        </div>
      </div>

      {/* Modal Gestione Assegnazioni */}
      {showAssignments && selectedBus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Gestione Assegnazioni - {selectedBus.name}</h3>
              <button
                onClick={() => setShowAssignments(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Atlete Assegnate */}
              <div>
                <h4 className="font-medium mb-3">Atlete Assegnate ({selectedBus.athletes.length}/{selectedBus.capacity})</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedBus.athletes.map(athlete => (
                    <div key={athlete.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{athlete.name}</div>
                        <div className="text-sm text-gray-600">{athlete.teamName} - {athlete.zone.name}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveAssignment(athlete.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Rimuovi
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Atlete Disponibili */}
              <div>
                <h4 className="font-medium mb-3">Atlete Disponibili</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {data.athletes
                    .filter(a => a.usesBus && (!a.assignedBus || a.assignedBus.id !== selectedBus.id))
                    .map(athlete => (
                      <div key={athlete.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{athlete.name}</div>
                          <div className="text-sm text-gray-600">
                            {athlete.teamName} - {athlete.zone.name}
                            {athlete.assignedBus && (
                              <span className="text-orange-600"> (Già assegnata a {athlete.assignedBus.name})</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAssignAthlete(athlete.id, selectedBus.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                          disabled={selectedBus.athletes.length >= selectedBus.capacity}
                        >
                          Assegna
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAssignments(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusesList;