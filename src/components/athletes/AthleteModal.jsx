// components/athletes/AthleteModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, User, Calendar, MapPin, Phone, Mail, CreditCard, FileText, Bus, Award } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import AthleteDocuments from './AthleteDocuments';

const AthleteModal = ({ athlete, data, onClose, onSave, toast }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '', // Cambiato da age a birthDate
    teamId: '',
    position: 'Centrocampista',
    jerseyNumber: '', // Cambiato da number
    phone: '',
    email: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    fiscalCode: '',
    status: 'ACTIVE',
    usesTransport: false,
    transportZoneId: '',
    notes: ''
  });

  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(!athlete); // true se stiamo creando un nuovo atleta

  useEffect(() => {
    if (athlete) {
      // Calcola birthDate dall'età se non presente
      let birthDate = '';
      if (athlete.birthDate) {
        birthDate = new Date(athlete.birthDate).toISOString().split('T')[0];
      } else if (athlete.age) {
        const year = new Date().getFullYear() - athlete.age;
        birthDate = `${year}-01-01`;
      }
      
      setFormData({
        firstName: athlete.firstName || '',
        lastName: athlete.lastName || '',
        birthDate: birthDate,
        teamId: athlete.teamId || '',
        position: athlete.position || 'Centrocampista',
        jerseyNumber: athlete.jerseyNumber || athlete.number || '',
        phone: athlete.phone || '',
        email: athlete.email || '',
        address: athlete.address || '',
        city: athlete.city || '',
        province: athlete.province || '',
        postalCode: athlete.postalCode || '',
        fiscalCode: athlete.fiscalCode || '',
        status: athlete.status || 'ACTIVE',
        usesTransport: athlete.usesTransport || athlete.usesBus || false,
        transportZoneId: athlete.transportZoneId || athlete.zone?.id || '',
        notes: athlete.notes || ''
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
    
    if (!formData.birthDate) {
      alert('La data di nascita è obbligatoria');
      return;
    }
    
    if (!formData.teamId) {
      alert('Seleziona una squadra');
      return;
    }
    
    // Prepara i dati per il salvataggio
    const dataToSave = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      birthDate: formData.birthDate,
      teamId: formData.teamId,
      position: formData.position,
      jerseyNumber: formData.jerseyNumber ? parseInt(formData.jerseyNumber) : null,
      phone: formData.phone || null,
      email: formData.email || null,
      address: formData.address || null,
      city: formData.city || null,
      province: formData.province || null,
      postalCode: formData.postalCode || null,
      fiscalCode: formData.fiscalCode || null,
      status: formData.status,
      usesTransport: formData.usesTransport,
      transportZoneId: formData.transportZoneId || null,
      notes: formData.notes || null
    };
    
    // Rimuovi campi null per l'update
    if (athlete) {
      Object.keys(dataToSave).forEach(key => {
        if (dataToSave[key] === null || dataToSave[key] === '') {
          delete dataToSave[key];
        }
      });
    }
    
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
                    Data di nascita *
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleChange('birthDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900">
                        {athlete?.birthDate ? new Date(athlete.birthDate).toLocaleDateString('it-IT') : ''}
                        {athlete?.age && ` (${athlete.age} anni)`}
                      </span>
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
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Via/Piazza"
                    />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Città"
                      />
                      <input
                        type="text"
                        value={formData.province}
                        onChange={(e) => handleChange('province', e.target.value.toUpperCase())}
                        maxLength="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="PR"
                      />
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => handleChange('postalCode', e.target.value)}
                        maxLength="5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="CAP"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-900">
                    {athlete?.address && `${athlete.address}, `}
                    {athlete?.city} {athlete?.province} {athlete?.postalCode}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Codice Fiscale
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.fiscalCode}
                      onChange={(e) => handleChange('fiscalCode', e.target.value.toUpperCase())}
                      maxLength="16"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="RSSMRA85M01H501Z"
                    />
                  ) : (
                    <p className="text-gray-900">{athlete?.fiscalCode}</p>
                  )}
                </div>
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
                      onChange={(e) => handleChange('teamId', e.target.value)} // Rimuovi parseInt
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
                      value={formData.jerseyNumber}
                      onChange={(e) => handleChange('jerseyNumber', e.target.value)}
                      min="1"
                      max="99"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">#{athlete?.jerseyNumber || athlete?.number}</p>
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
                  id="usesTransport"
                  checked={formData.usesTransport}
                  onChange={(e) => handleChange('usesTransport', e.target.checked)}
                  disabled={!isEditing}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="usesTransport" className="text-sm font-medium text-gray-700">
                  Utilizza il servizio di trasporto
                </label>
              </div>

              {(formData.usesTransport || athlete?.usesTransport) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zona di residenza
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.transportZoneId}
                        onChange={(e) => handleChange('transportZoneId', e.target.value)}
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