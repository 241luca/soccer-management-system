// components/transport/TransportDashboard.jsx
import React from 'react';
import { Bus, MapPin, Users, DollarSign, AlertTriangle, TrendingUp, Navigation, Eye, Edit } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const TransportDashboard = ({ data, transportData, filteredAthletes, onEditBus, onEditZone }) => {
  
  // Calcolo efficienza generale
  const overallEfficiency = Math.round((transportData.totalRevenue / transportData.expectedRevenue) * 100);
  
  // Alert per problemi
  const alerts = [];
  
  // Check sovraffollamento pulmini
  transportData.busStats.forEach(bus => {
    if (bus.status === 'critical') {
      alerts.push({
        type: 'critical',
        title: 'Pulmino Sovraffollato',
        message: `${bus.name} ha ${bus.assignedAthletes} persone su ${bus.capacity} posti`
      });
    }
  });
  
  // Check zone sottoutilizzate
  transportData.zoneStats.forEach(zone => {
    const utilization = zone.busUsers / zone.totalAthletes;
    if (zone.totalAthletes > 5 && utilization < 0.3) {
      alerts.push({
        type: 'warning',
        title: 'Zona Sottoutilizzata',
        message: `${zone.name}: solo ${zone.busUsers}/${zone.totalAthletes} atlete usano il trasporto`
      });
    }
  });
  
  // Check pagamenti in sospeso
  const pendingPayments = transportData.zoneStats.reduce((sum, zone) => sum + zone.feesPending, 0);
  if (pendingPayments > 10) {
    alerts.push({
      type: 'warning',
      title: 'Pagamenti in Sospeso',
      message: `${pendingPayments} atlete non hanno ancora pagato il trasporto`
    });
  }

  return (
    <div className="space-y-6">
      {/* Alert Section */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alert e Problemi
          </h3>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.type === 'critical' 
                    ? 'bg-red-50 border-red-400' 
                    : 'bg-orange-50 border-orange-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-medium ${
                      alert.type === 'critical' ? 'text-red-800' : 'text-orange-800'
                    }`}>
                      {alert.title}
                    </h4>
                    <p className={`text-sm ${
                      alert.type === 'critical' ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {alert.message}
                    </p>
                  </div>
                  <StatusBadge status={alert.type}>
                    {alert.type === 'critical' ? 'Critico' : 'Attenzione'}
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Panoramica Zone */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-green-500" />
          Panoramica Zone Geografiche
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {transportData.zoneStats.map(zone => {
            const utilizationRate = zone.totalAthletes > 0 ? (zone.busUsers / zone.totalAthletes) * 100 : 0;
            const paymentRate = zone.busUsers > 0 ? (zone.feesPaid / zone.busUsers) * 100 : 0;
            
            return (
              <div key={zone.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{zone.name}</h4>
                  <span className={`w-3 h-3 rounded-full bg-${zone.color}-500`}></span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Totale atlete:</span>
                    <span className="font-medium">{zone.totalAthletes}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Usano bus:</span>
                    <span className="font-medium">{zone.busUsers}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Utilizzo:</span>
                    <span className="font-medium">{Math.round(utilizationRate)}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pagamenti:</span>
                    <span className="font-medium">{zone.feesPaid}/{zone.busUsers}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Incassi:</span>
                    <span className="font-medium text-green-600">€{zone.revenue}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tariffa:</span>
                    <span className="font-medium">€{zone.monthlyFee}/mese</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t flex gap-2">
                  <button
                    onClick={() => onEditZone(zone)}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                  >
                    <Edit className="h-3 w-3 mr-1 inline" />
                    Modifica
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stato Pulmini */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Bus className="h-5 w-5 text-blue-500" />
          Stato Pulmini
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {transportData.busStats.map(bus => (
            <div key={bus.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{bus.name}</h4>
                <StatusBadge status={bus.status}>
                  {bus.status === 'valid' && 'Ottimale'}
                  {bus.status === 'warning' && 'Quasi Pieno'}
                  {bus.status === 'critical' && 'Sovraffollato'}
                  {bus.status === 'pending' && 'Sottoutilizzato'}
                </StatusBadge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Capienza:</span>
                  <span className="font-medium">{bus.capacity} posti</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Assegnate:</span>
                  <span className="font-medium">{bus.assignedAthletes}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Utilizzo:</span>
                  <span className={`font-medium ${
                    bus.utilization > 100 ? 'text-red-600' : 
                    bus.utilization > 90 ? 'text-orange-600' : 
                    'text-green-600'
                  }`}>
                    {bus.utilization}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Autista:</span>
                  <span className="font-medium">{bus.driver}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Targa:</span>
                  <span className="font-medium">{bus.plate}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Percorso:</span>
                  <span className="font-medium">{bus.route}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Incassi:</span>
                  <span className="font-medium text-green-600">€{bus.revenue}</span>
                </div>
              </div>
              
              {/* Barra utilizzo */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Utilizzo</span>
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
              
              <div className="mt-3 pt-3 border-t flex gap-2">
                <button
                  onClick={() => onEditBus(bus)}
                  className="text-blue-600 hover:text-blue-800 text-xs"
                >
                  <Edit className="h-3 w-3 mr-1 inline" />
                  Modifica
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Riepilogo Finanziario */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-500" />
          Riepilogo Finanziario
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-green-600 text-sm font-medium">Incassi Effettivi</p>
            <p className="text-2xl font-bold text-green-700">€{transportData.totalRevenue}</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-600 text-sm font-medium">Incassi Previsti</p>
            <p className="text-2xl font-bold text-blue-700">€{transportData.expectedRevenue}</p>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-orange-600 text-sm font-medium">Efficienza Incassi</p>
            <p className="text-2xl font-bold text-orange-700">{overallEfficiency}%</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-purple-600 text-sm font-medium">Pagamenti Pendenti</p>
            <p className="text-2xl font-bold text-purple-700">{pendingPayments}</p>
          </div>
        </div>
      </div>

      {/* Lista Atlete Trasporto */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-500" />
          Atlete con Trasporto ({filteredAthletes.filter(a => a.usesBus).length})
        </h3>
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
                  Zona
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pulmino
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tariffa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato Pagamento
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAthletes.filter(a => a.usesBus).slice(0, 10).map(athlete => (
                <tr key={athlete.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{athlete.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{athlete.teamName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`w-2 h-2 rounded-full bg-${athlete.zone.color}-500 mr-2`}></span>
                      <span className="text-sm text-gray-900">{athlete.zone.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {athlete.assignedBus ? athlete.assignedBus.name : 'Non assegnato'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">€{athlete.busFee}/mese</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={athlete.busFeeStatus === 'paid' ? 'valid' : 'warning'}>
                      {athlete.busFeeStatus === 'paid' ? 'Pagato' : 'In sospeso'}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAthletes.filter(a => a.usesBus).length > 10 && (
            <div className="px-6 py-3 text-center text-sm text-gray-500">
              ... e altre {filteredAthletes.filter(a => a.usesBus).length - 10} atlete
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransportDashboard;