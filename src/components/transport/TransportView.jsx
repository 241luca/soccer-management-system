// components/transport/TransportView.jsx
import React, { useState, useMemo } from 'react';
import { Bus, MapPin, Navigation, Users, AlertTriangle, TrendingUp, Filter, Plus } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import TransportDashboard from './TransportDashboard';
import BusesList from './BusesList';
import ZonesManagement from './ZonesManagement';
import TransportModal from './TransportModal';

const TransportView = ({ data, stats, selectedTeam, setCurrentView }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('bus'); // 'bus' or 'zone'
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterZone, setFilterZone] = useState('all');
  const [filterBus, setFilterBus] = useState('all');
  const [filterTeam, setFilterTeam] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Calcolo utilizzo pulmini
  const calculateBusUtilization = (bus, athletes) => {
    const assigned = athletes.filter(a => a.assignedBus?.id === bus.id);
    const utilization = (assigned.length / bus.capacity) * 100;
    
    if (utilization > 100) return 'critical'; // Sovraffollato
    if (utilization > 90) return 'warning';   // Quasi pieno
    if (utilization > 70) return 'valid';     // Buon utilizzo
    return 'pending'; // Sottoutilizzato
  };

  // Estrazione e elaborazione dati trasporto
  const transportData = useMemo(() => {
    const athletesWithTransport = data.athletes.filter(a => a.usesBus);
    
    // Calcolo statistiche per zone
    const zoneStats = data.zones.map(zone => {
      const athletesInZone = data.athletes.filter(a => a.zone.id === zone.id);
      const usingBus = athletesInZone.filter(a => a.usesBus);
      const paidFees = usingBus.filter(a => a.busFeeStatus === 'paid');
      
      return {
        ...zone,
        totalAthletes: athletesInZone.length,
        busUsers: usingBus.length,
        feesPaid: paidFees.length,
        feesPending: usingBus.length - paidFees.length,
        revenue: paidFees.length * zone.monthlyFee,
        expectedRevenue: usingBus.length * zone.monthlyFee
      };
    });

    // Calcolo statistiche per pulmini
    const busStats = data.buses.map(bus => {
      const assignedAthletes = data.athletes.filter(a => a.assignedBus?.id === bus.id);
      const utilization = (assignedAthletes.length / bus.capacity) * 100;
      const paidFees = assignedAthletes.filter(a => a.busFeeStatus === 'paid');
      
      return {
        ...bus,
        assignedAthletes: assignedAthletes.length,
        utilization: Math.round(utilization),
        status: calculateBusUtilization(bus, data.athletes),
        paidSeats: paidFees.length,
        pendingSeats: assignedAthletes.length - paidFees.length,
        revenue: paidFees.reduce((sum, a) => sum + a.busFee, 0),
        athletes: assignedAthletes
      };
    });

    return {
      athletesWithTransport,
      zoneStats,
      busStats,
      totalRevenue: zoneStats.reduce((sum, zone) => sum + zone.revenue, 0),
      expectedRevenue: zoneStats.reduce((sum, zone) => sum + zone.expectedRevenue, 0),
      totalBusUsers: athletesWithTransport.length,
      totalCapacity: data.buses.reduce((sum, bus) => sum + bus.capacity, 0)
    };
  }, [data.athletes, data.zones, data.buses]);

  // Filtri atlete
  const filteredAthletes = useMemo(() => {
    let filtered = data.athletes.filter(athlete => {
      const matchesSearch = searchTerm === '' || 
        athlete.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        athlete.teamName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesZone = filterZone === 'all' || athlete.zone.id === filterZone;
      const matchesBus = filterBus === 'all' || 
        (filterBus === 'none' && !athlete.usesBus) ||
        (filterBus !== 'none' && athlete.assignedBus?.id === parseInt(filterBus));
      const matchesTeam = filterTeam === 'all' || athlete.teamId === parseInt(filterTeam);
      
      return matchesSearch && matchesZone && matchesBus && matchesTeam;
    });

    return filtered;
  }, [data.athletes, searchTerm, filterZone, filterBus, filterTeam]);

  // Gestori modal
  const handleNewBus = () => {
    setModalType('bus');
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEditBus = (bus) => {
    setModalType('bus');
    setSelectedItem(bus);
    setShowModal(true);
  };

  const handleNewZone = () => {
    setModalType('zone');
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEditZone = (zone) => {
    setModalType('zone');
    setSelectedItem(zone);
    setShowModal(true);
  };

  // Tab navigation
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Bus },
    { id: 'buses', name: 'Pulmini', icon: Navigation },
    { id: 'zones', name: 'Zone', icon: MapPin }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bus className="h-6 w-6 text-blue-500" />
              Gestione Trasporti
            </h1>
            <p className="text-gray-600 mt-1">Pulmini, zone geografiche e percorsi</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleNewZone}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4 mr-2 inline" />
              Nuova Zona
            </button>
            <button
              onClick={handleNewBus}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4 mr-2 inline" />
              Nuovo Pulmino
            </button>
          </div>
        </div>

        {/* Statistiche Header */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Utenti Trasporto</p>
                <p className="text-2xl font-bold text-blue-700">{transportData.totalBusUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Incassi Mese</p>
                <p className="text-2xl font-bold text-green-700">€{transportData.totalRevenue}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Utilizzo Medio</p>
                <p className="text-2xl font-bold text-orange-700">
                  {Math.round((transportData.totalBusUsers / transportData.totalCapacity) * 100)}%
                </p>
              </div>
              <Bus className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Zone Attive</p>
                <p className="text-2xl font-bold text-purple-700">{data.zones.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mt-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2 inline" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Filtri */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtri:</span>
          </div>
          
          <input
            type="text"
            placeholder="Cerca atleta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm w-48"
          />
          
          <select
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">Tutte le zone</option>
            {data.zones.map(zone => (
              <option key={zone.id} value={zone.id}>{zone.name}</option>
            ))}
          </select>
          
          <select
            value={filterBus}
            onChange={(e) => setFilterBus(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">Tutti i pulmini</option>
            <option value="none">Senza pulmino</option>
            {data.buses.map(bus => (
              <option key={bus.id} value={bus.id}>{bus.name}</option>
            ))}
          </select>
          
          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">Tutte le squadre</option>
            {data.teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>

          <div className="ml-auto text-sm text-gray-600">
            {filteredAthletes.length} atlete trovate
          </div>
        </div>
      </div>

      {/* Contenuto Tab */}
      {activeTab === 'dashboard' && (
        <TransportDashboard 
          data={data}
          transportData={transportData}
          filteredAthletes={filteredAthletes}
          onEditBus={handleEditBus}
          onEditZone={handleEditZone}
        />
      )}

      {activeTab === 'buses' && (
        <BusesList 
          data={data}
          transportData={transportData}
          filteredAthletes={filteredAthletes}
          onEditBus={handleEditBus}
          onNewBus={handleNewBus}
        />
      )}

      {activeTab === 'zones' && (
        <ZonesManagement 
          data={data}
          transportData={transportData}
          filteredAthletes={filteredAthletes}
          onEditZone={handleEditZone}
          onNewZone={handleNewZone}
        />
      )}

      {/* Modal */}
      {showModal && (
        <TransportModal
          type={modalType}
          item={selectedItem}
          data={data}
          onClose={() => setShowModal(false)}
          onSave={(updatedItem) => {
            // In un'app reale, qui salveresti i dati
            console.log('Saved:', updatedItem);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

export default TransportView;