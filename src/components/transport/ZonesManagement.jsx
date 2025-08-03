// components/transport/ZonesManagement.jsx
import React, { useState } from 'react';
import { MapPin, Users, DollarSign, Edit, Plus, Navigation, User } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const ZonesManagement = ({ data, transportData, filteredAthletes, onEditZone, onNewZone }) => {
  const [selectedZone, setSelectedZone] = useState(null);
  const [showAthletes, setShowAthletes] = useState(false);

  // Calcolo colore badge per utilizzo zona
  const getZoneStatus = (zone) => {
    if (zone.totalAthletes === 0) return 'pending';
    const utilizationRate = (zone.busUsers / zone.totalAthletes) * 100;
    if (utilizationRate > 80) return 'valid';
    if (utilizationRate > 50) return 'warning';
    return 'critical';
  };

  // Simulazione mappa (placeholder)
  const MapPlaceholder = ({ zone }) => (
    <div className="bg-gray-100 rounded-lg p-4 text-center border-2 border-dashed border-gray-300">
      <MapPin className={`h-8 w-8 text-${zone.color}-500 mx-auto mb-2`} />
      <p className="text-sm text-gray-600">Mappa Zona {zone.name}</p>
      <p className="text-xs text-gray-500">{zone.distance}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Azioni */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Gestione Zone Geografiche</h3>
          <button
            onClick={onNewZone}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
          >
            <Plus className="h-4 w-4 mr-2 inline" />
            Nuova Zona
          </button>
        </div>
      </div>

      {/* Panoramica Zone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {transportData.zoneStats.map(zone => {
          const utilizationRate = zone.totalAthletes > 0 ? (zone.busUsers / zone.totalAthletes) * 100 : 0;
          const paymentRate = zone.busUsers > 0 ? (zone.feesPaid / zone.busUsers) * 100 : 0;
          const zoneStatus = getZoneStatus(zone);
          
          return (
            <div key={zone.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full bg-${zone.color}-500`}></div>
                  <div>
                    <h4 className="text-lg font-bold">Zona {zone.name}</h4>
                    <p className="text-sm text-gray-600">{zone.distance}</p>
                  </div>
                </div>
                <StatusBadge status={zoneStatus}>
                  {zoneStatus === 'valid' && 'Ottimale'}
                  {zoneStatus === 'warning' && 'Moderato'}
                  {zoneStatus === 'critical' && 'Sottoutilizzato'}
                  {zoneStatus === 'pending' && 'Vuoto'}
                </StatusBadge>
              </div>

              {/* Mappa Placeholder */}
              <MapPlaceholder zone={zone} />

              {/* Statistiche Zona */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Totale atlete:</span>
                    <span className="font-bold">{zone.totalAthletes}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Usano trasporto:</span>
                    <span className="font-bold text-blue-600">{zone.busUsers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Utilizzo zona:</span>
                    <span className={`font-bold ${
                      utilizationRate > 80 ? 'text-green-600' : 
                      utilizationRate > 50 ? 'text-orange-600' : 
                      'text-red-600'
                    }`}>
                      {Math.round(utilizationRate)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tariffa mensile:</span>
                    <span className="font-bold">€{zone.monthlyFee}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Incassi:</span>
                    <span className="font-bold text-green-600">€{zone.revenue}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Incassi previsti:</span>
                    <span className="font-bold text-blue-600">€{zone.expectedRevenue}</span>
                  </div>
                </div>
              </div>

              {/* Barra Utilizzo */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Utilizzo Trasporto</span>
                  <span>{zone.busUsers}/{zone.totalAthletes}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-${zone.color}-500`}
                    style={{ width: `${utilizationRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Pagamenti */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Stato Pagamenti</span>
                  <span className="text-xs text-gray-500">{Math.round(paymentRate)}% pagato</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Pagati</span>
                      <span>{zone.feesPaid}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="h-1 rounded-full bg-green-500"
                        style={{ width: `${paymentRate}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span>In sospeso</span>
                      <span>{zone.feesPending}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="h-1 rounded-full bg-orange-500"
                        style={{ width: `${100 - paymentRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Azioni */}
              <div className="border-t pt-4 mt-4 flex gap-2">
                <button
                  onClick={() => onEditZone(zone)}
                  className="flex-1 px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4 mr-1 inline" />
                  Modifica
                </button>
                <button
                  onClick={() => {
                    setSelectedZone(zone);
                    setShowAthletes(true);
                  }}
                  className="flex-1 px-3 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50"
                >
                  <Users className="h-4 w-4 mr-1 inline" />
                  Vedi Atlete ({zone.totalAthletes})
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analisi Costi-Benefici */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-500" />
          Analisi Costi-Benefici per Zona
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zona</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Atlete</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilizzano Bus</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tariffa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Incassi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Potenziale</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Efficienza</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transportData.zoneStats.map(zone => {
                const efficiency = zone.expectedRevenue > 0 ? (zone.revenue / zone.expectedRevenue) * 100 : 0;
                return (
                  <tr key={zone.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full bg-${zone.color}-500 mr-2`}></div>
                        <span className="font-medium">{zone.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{zone.totalAthletes}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{zone.busUsers}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">€{zone.monthlyFee}/mese</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">€{zone.revenue}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">€{zone.expectedRevenue}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={efficiency > 80 ? 'valid' : efficiency > 50 ? 'warning' : 'critical'}>
                        {Math.round(efficiency)}%
                      </StatusBadge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ottimizzazione Suggerimenti */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Navigation className="h-5 w-5 text-blue-500" />
          Suggerimenti Ottimizzazione
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {transportData.zoneStats.map(zone => {
            const utilizationRate = zone.totalAthletes > 0 ? (zone.busUsers / zone.totalAthletes) * 100 : 0;
            const suggestions = [];
            
            if (utilizationRate < 30 && zone.totalAthletes > 5) {
              suggestions.push("Promuovere il servizio trasporto in questa zona");
            }
            if (zone.feesPending > zone.feesPaid && zone.busUsers > 0) {
              suggestions.push("Sollecitare i pagamenti in sospeso");
            }
            if (utilizationRate > 90) {
              suggestions.push("Zona molto efficiente, mantenere il servizio");
            }
            if (zone.totalAthletes === 0) {
              suggestions.push("Zona senza atlete, valutare se mantenere");
            }
            
            return suggestions.length > 0 && (
              <div key={zone.id} className="border rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-${zone.color}-500`}></div>
                  Zona {zone.name}
                </h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 text-xs mt-1">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Lista Atlete per Zona */}
      {showAthletes && selectedZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full bg-${selectedZone.color}-500`}></div>
                Atlete Zona {selectedZone.name} ({selectedZone.totalAthletes})
              </h3>
              <button
                onClick={() => setShowAthletes(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Atlete che usano il trasporto */}
              <div>
                <h4 className="font-medium mb-3 text-green-600">
                  Usano il Trasporto ({selectedZone.busUsers})
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {data.athletes
                    .filter(a => a.zone.id === selectedZone.id && a.usesBus)
                    .map(athlete => (
                      <div key={athlete.id} className="p-3 border rounded-lg bg-green-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{athlete.name}</div>
                            <div className="text-sm text-gray-600">{athlete.teamName}</div>
                            <div className="text-xs text-gray-500">{athlete.address}</div>
                          </div>
                          <div className="text-right">
                            <StatusBadge status={athlete.busFeeStatus === 'paid' ? 'valid' : 'warning'} size="sm">
                              {athlete.busFeeStatus === 'paid' ? 'Pagato' : 'Pending'}
                            </StatusBadge>
                            <div className="text-xs text-gray-500 mt-1">
                              {athlete.assignedBus ? athlete.assignedBus.name : 'Non assegnata'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Atlete che non usano il trasporto */}
              <div>
                <h4 className="font-medium mb-3 text-orange-600">
                  Non Usano il Trasporto ({selectedZone.totalAthletes - selectedZone.busUsers})
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {data.athletes
                    .filter(a => a.zone.id === selectedZone.id && !a.usesBus)
                    .map(athlete => (
                      <div key={athlete.id} className="p-3 border rounded-lg bg-orange-50">
                        <div>
                          <div className="font-medium">{athlete.name}</div>
                          <div className="text-sm text-gray-600">{athlete.teamName}</div>
                          <div className="text-xs text-gray-500">{athlete.address}</div>
                        </div>
                        <div className="mt-2">
                          <button className="text-xs text-blue-600 hover:text-blue-800">
                            Offri servizio trasporto
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600">Totale Zona</div>
                  <div className="text-lg font-bold text-blue-700">{selectedZone.totalAthletes}</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600">Utilizzano Bus</div>
                  <div className="text-lg font-bold text-green-700">{selectedZone.busUsers}</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="text-sm text-orange-600">Incassi Mese</div>
                  <div className="text-lg font-bold text-orange-700">€{selectedZone.revenue}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAthletes(false)}
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

export default ZonesManagement;