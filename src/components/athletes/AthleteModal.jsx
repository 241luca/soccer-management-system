// components/athletes/AthleteModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, User, Calendar, MapPin, Phone, Mail, CreditCard, FileText, Bus, Award } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import AthleteDocuments from './AthleteDocuments';

const AthleteModal = ({ athlete, data, onClose, onSave, toast }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    name: '', // Backward compatibility
    age: '',
    teamId: '',
    position: 'Centrocampista',
    number: '',
    phone: '',
    email: '',
    address: '',
    membershipFee: '',
    feeStatus: 'pending',
    medicalExpiry: '',
    insuranceExpiry: '',
    usesBus: false,
    assignedBus: '',
    zone: '',
    busFee: 0,
    busFeeStatus: 'pending'
  });

  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(!athlete); // true se stiamo creando un nuovo atleta

  useEffect(() => {
    if (athlete) {
      setFormData({
        firstName: athlete.firstName || '',
        lastName: athlete.lastName || '',
        name: athlete.name || `${athlete.firstName || ''} ${athlete.lastName || ''}`.trim(),
        age: athlete.age || '',
        teamId: athlete.teamId || '',
        position: athlete.position || 'Centrocampista',
        number: athlete.number || '',
        phone: athlete.phone || '',
        email: athlete.email || '',
        address: athlete.address || '',
        membershipFee: athlete.membershipFee || '',
        feeStatus: athlete.feeStatus || 'pending',
        medicalExpiry: athlete.medicalExpiry ? new Date(athlete.medicalExpiry).toISOString().split('T')[0] : '',
        insuranceExpiry: athlete.insuranceExpiry ? new Date(athlete.insuranceExpiry).toISOString().split('T')[0] : '',
        usesBus: athlete.usesBus || false,
        assignedBus: athlete.assignedBus?.id || '',
        zone: athlete.zone?.id || '',
        busFee: athlete.busFee || 0,
        busFeeStatus: athlete.busFeeStatus || 'pending'
      });
    }
  }, [athlete]);

  const positions = ['Portiere', 'Difensore', 'Centrocampista', 'Attaccante'];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    // Validazione base
    if (!formData.firstName || !formData.lastName) {
      alert('Nome e cognome sono obbligatori');
      return;
    }
    
    if (!formData.age || formData.age < 10 || formData.age > 40) {
      alert('L\'età deve essere tra 10 e 40 anni');
      return;
    }
    
    if (!formData.teamId) {
      alert('Seleziona una squadra');
      return;
    }
    
    // Prepara i dati per il salvataggio
    const dataToSave = {
      ...formData,
      age: parseInt(formData.age),
      teamId: parseInt(formData.teamId),
      number: formData.number ? parseInt(formData.number) : null,
      membershipFee: parseFloat(formData.membershipFee) || 0,
      busFee: parseFloat(formData.busFee) || 0
    };
    
    // Log per debug
    console.log('Dati da salvare:', dataToSave);
    console.log('Atleta esistente:', athlete);
    console.log('ID atleta:', athlete?.id);
    
    onSave(dataToSave);
  };

  const getDocumentStatus = () => {
    if (!athlete) return 'unknown';
    const today = new Date();
    const medicalExpiring = new Date(athlete.medicalExpiry) - today < 30 * 24 * 60 * 60 * 1000;
    const insuranceExpiring = new Date(athlete.insuranceExpiry) - today < 30 * 24 * 60 * 60 * 1000;
    
    if (medicalExpiring || insuranceExpiring) return 'warning';
    return 'valid';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('it-IT');
  };

  const tabs = [
    { id: 'personal', label: 'Dati Personali', icon: User },
    { id: 'sports', label: 'Dati Sportivi', icon: Award },
    { id: 'documents', label: 'Documenti', icon: FileText },
    { id: 'payments', label: 'Pagamenti', icon: CreditCard },
    { id: 'transport', label: 'Trasporti', icon: Bus }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {athlete ? ((athlete.firstName || athlete.name || '?').charAt(0).toUpperCase()) : '?'}
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {athlete 
                    ? (athlete.firstName && athlete.lastName 
                        ? `${athlete.firstName} ${athlete.lastName}`
                        : athlete.name || 'Atleta')
                    : 'Nuova Atleta'
                  }
                </h2>
                {athlete && (
                  <div className="flex items-center gap-4 mt-2 text-blue-100">
                    <span>{athlete.position} • #{athlete.number}</span>
                    <span>{athlete.teamName}</span>
                    <span>{athlete.age} anni</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {athlete && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Modifica
                </button>
              )}
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b">
          <nav className="flex">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors
                    ${activeTab === tab.id 
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {/* Tab Dati Personali */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome *
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome"
                    />
                  ) : (
                    <p className="text-gray-900">{athlete?.firstName || ''}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cognome *
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Cognome"
                    />
                  ) : (
                    <p className="text-gray-900">{athlete?.lastName || ''}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Età *
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleChange('age', parseInt(e.target.value))}
                      min="10"
                      max="40"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900">{athlete?.age} anni</span>
                      <StatusBadge status={athlete?.isAgeValid ? 'valid' : 'critical'}>
                        {athlete?.isAgeValid ? 'Conforme' : 'Non conforme'}
                      </StatusBadge>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Telefono
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+39 123 456 7890"
                    />
                  ) : (
                    <p className="text-gray-900">{athlete?.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="atleta@email.com"
                    />
                  ) : (
                    <p className="text-gray-900">{athlete?.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Indirizzo
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Via, Città, Provincia"
                  />
                ) : (
                  <p className="text-gray-900">{athlete?.address}</p>
                )}
              </div>
            </div>
          )}

          {/* Tab Dati Sportivi */}
          {activeTab === 'sports' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Squadra *
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.teamId}
                      onChange={(e) => handleChange('teamId', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleziona squadra</option>
                      {data.teams.map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name} ({team.minAge}-{team.maxAge} anni)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900">{athlete?.teamName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posizione *
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.position}
                      onChange={(e) => handleChange('position', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {positions.map(position => (
                        <option key={position} value={position}>{position}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900">{athlete?.position}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numero Maglia
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.number}
                      onChange={(e) => handleChange('number', parseInt(e.target.value))}
                      min="1"
                      max="99"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">#{athlete?.number}</p>
                  )}
                </div>
              </div>

              {athlete && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Statistiche Stagione</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{athlete.gamesPlayed}</p>
                      <p className="text-sm text-gray-600">Partite</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{athlete.goals}</p>
                      <p className="text-sm text-gray-600">Gol</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{athlete.yellowCards}</p>
                      <p className="text-sm text-gray-600">Gialli</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{athlete.redCards}</p>
                      <p className="text-sm text-gray-600">Rossi</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Documenti */}
          {activeTab === 'documents' && (
            <AthleteDocuments
              athleteId={athlete?.id}
              isEditing={isEditing}
              toast={toast}
            />
          )}

          {/* Tab Pagamenti */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Quota Associativa</h4>
                  
                  <div className="space-y-3">
                    {isEditing ? (
                      <>
                        <div>
                          <label className="block text-sm text-gray-700 mb-2">Importo (€)</label>
                          <input
                            type="number"
                            value={formData.membershipFee}
                            onChange={(e) => handleChange('membershipFee', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-2">Stato</label>
                          <select
                            value={formData.feeStatus}
                            onChange={(e) => handleChange('feeStatus', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="pending">In sospeso</option>
                            <option value="paid">Pagato</option>
                          </select>
                        </div>
                      </>
                    ) : athlete ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Importo:</span>
                          <span className="font-medium">€{athlete.membershipFee}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Stato:</span>
                          <StatusBadge status={athlete.feeStatus === 'paid' ? 'valid' : 'warning'}>
                            {athlete.feeStatus === 'paid' ? 'Pagato' : 'In sospeso'}
                          </StatusBadge>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>

                {athlete && athlete.usesBus && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Quota Trasporto</h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Importo mensile:</span>
                        <span className="font-medium">€{athlete.busFee}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Stato:</span>
                        <StatusBadge status={athlete.busFeeStatus === 'paid' ? 'valid' : 'warning'}>
                          {athlete.busFeeStatus === 'paid' ? 'Pagato' : 'In sospeso'}
                        </StatusBadge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Zona:</span>
                        <span className="font-medium">{athlete.zone?.name}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Trasporti */}
          {activeTab === 'transport' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="usesBus"
                  checked={formData.usesBus}
                  onChange={(e) => handleChange('usesBus', e.target.checked)}
                  disabled={!isEditing}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="usesBus" className="text-sm font-medium text-gray-700">
                  Utilizza il servizio di trasporto
                </label>
              </div>

              {(formData.usesBus || athlete?.usesBus) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zona di residenza
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.zone}
                        onChange={(e) => handleChange('zone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleziona zona</option>
                        {data.zones.map(zone => (
                          <option key={zone.id} value={zone.id}>
                            {zone.name} - €{zone.monthlyFee}/mese
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900">
                        {athlete?.zone?.name} ({athlete?.zone?.distance})
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pulmino assegnato
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.assignedBus}
                        onChange={(e) => handleChange('assignedBus', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleziona pulmino</option>
                        {data.buses.map(bus => (
                          <option key={bus.id} value={bus.id}>
                            {bus.name} - {bus.route}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900">
                        {athlete?.assignedBus?.name}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {athlete?.usesBus && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Informazioni Trasporto</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Pulmino:</span>
                      <span className="ml-2 font-medium">{athlete.assignedBus?.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Percorso:</span>
                      <span className="ml-2 font-medium">{athlete.assignedBus?.route}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Autista:</span>
                      <span className="ml-2 font-medium">{athlete.assignedBus?.driver}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Targa:</span>
                      <span className="ml-2 font-medium">{athlete.assignedBus?.plate}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {athlete ? `ID: ${athlete.id} • Creato: ${new Date().toLocaleDateString('it-IT')}` : 'Nuova atleta'}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                {isEditing ? 'Annulla' : 'Chiudi'}
              </button>
              {isEditing && (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {athlete ? 'Aggiorna' : 'Crea Atleta'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthleteModal;