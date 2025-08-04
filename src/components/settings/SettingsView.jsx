// components/settings/SettingsView.jsx
import React, { useState } from 'react';
import { 
  Settings, Save, Building2, Users, MapPin, Shirt, 
  Calendar, Shield, Upload, Camera, Palette, Phone, Mail,
  Globe, Star, Award, Clock, FileText, AlertTriangle
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const SettingsView = ({ data, stats, onSave, setCurrentView }) => {
  const [activeTab, setActiveTab] = useState('society');
  const [settings, setSettings] = useState({
    // Dati Società
    society: {
      name: 'ASD Calcio Femminile Ravenna',
      shortName: 'CF Ravenna',
      foundedYear: 1985,
      logo: null,
      website: 'https://cfravenna.it',
      email: 'info@cfravenna.it',
      phone: '+39 0544 123456',
      address: {
        street: 'Via dello Sport 123',
        city: 'Ravenna',
        province: 'RA',
        zipCode: '48121',
        country: 'Italia'
      },
      fiscalCode: 'IT12345678901',
      vatNumber: '12345678901',
      iban: 'IT60 X054 2811 1010 0000 0123 456',
      description: 'Società di calcio femminile fondata nel 1985, impegnata nella promozione dello sport femminile e nella formazione di giovani atlete.'
    },
    
    // Colori e Branding
    branding: {
      primaryColor: '#1e40af',
      secondaryColor: '#dc2626', 
      accentColor: '#059669',
      logoUrl: null,
      motto: 'Passione, Rispetto, Vittoria',
      socialMedia: {
        facebook: '@cfravenna',
        instagram: '@cfravenna_official',
        twitter: '@cfravenna',
        youtube: 'CF Ravenna Official'
      }
    },
    
    // Staff
    staff: [
      {
        id: 1,
        name: 'Mario Rossi',
        role: 'Presidente',
        phone: '+39 333 1234567',
        email: 'presidente@cfravenna.it',
        photo: null,
        bio: 'Presidente della società dal 2018, ex calciatore professionista.',
        responsibilities: ['Gestione generale', 'Rapporti istituzionali', 'Pianificazione strategica']
      },
      {
        id: 2,
        name: 'Anna Verdi',
        role: 'Allenatrice Prima Squadra',
        phone: '+39 333 2345678',
        email: 'coach@cfravenna.it',
        photo: null,
        bio: 'Allenatrice UEFA B, specializzata in calcio femminile.',
        responsibilities: ['Allenamenti Prima Squadra', 'Tattica', 'Preparazione partite']
      },
      {
        id: 3,
        name: 'Luigi Bianchi',
        role: 'Direttore Sportivo',
        phone: '+39 333 3456789',
        email: 'ds@cfravenna.it',
        photo: null,
        bio: 'Direttore sportivo con esperienza ventennale nel settore giovanile.',
        responsibilities: ['Mercato', 'Rapporti con FIGC', 'Coordinamento tecnico']
      }
    ],
    
    // Strutture
    facilities: [
      {
        id: 1,
        name: 'Campo Principale "Stadio Comunale"',
        type: 'Campo di gioco',
        address: 'Via dello Sport 123, Ravenna',
        capacity: 1500,
        surface: 'Erba naturale',
        lighting: true,
        covered: false,
        facilities: ['Spogliatoi', 'Tribuna coperta', 'Bar/Ristoro', 'Parcheggio'],
        notes: 'Campo omologato per campionati regionali',
        photo: null
      },
      {
        id: 2,
        name: 'Campo di Allenamento',
        type: 'Campo di allenamento',
        address: 'Via dello Sport 125, Ravenna',
        capacity: 200,
        surface: 'Erba sintetica',
        lighting: true,
        covered: false,
        facilities: ['Spogliatoi', 'Deposito attrezzi'],
        notes: 'Dedicato agli allenamenti quotidiani',
        photo: null
      },
      {
        id: 3,
        name: 'Palestra',
        type: 'Struttura coperta',
        address: 'Via dello Sport 127, Ravenna',
        capacity: 50,
        surface: 'Parquet',
        lighting: true,
        covered: true,
        facilities: ['Attrezzi fitness', 'Spogliatoi', 'Sala medica'],
        notes: 'Per preparazione atletica e riabilitazione',
        photo: null
      }
    ],
    
    // Maglie e Divise
    kits: [
      {
        id: 1,
        name: 'Maglia Home',
        type: 'home',
        primaryColor: '#1e40af',
        secondaryColor: '#ffffff',
        description: 'Maglia principale blu con dettagli bianchi',
        sponsor: 'Sport Store Ravenna',
        manufacturer: 'Nike',
        season: '2024-25',
        photo: null,
        components: {
          shirt: { color: '#1e40af', details: 'Collo bianco, maniche blu' },
          shorts: { color: '#1e40af', details: 'Pantaloncini blu' },
          socks: { color: '#1e40af', details: 'Calzettoni blu con righe bianche' }
        }
      },
      {
        id: 2,
        name: 'Maglia Away',
        type: 'away',
        primaryColor: '#ffffff',
        secondaryColor: '#1e40af',
        description: 'Maglia trasferta bianca con dettagli blu',
        sponsor: 'Sport Store Ravenna',
        manufacturer: 'Nike',
        season: '2024-25',
        photo: null,
        components: {
          shirt: { color: '#ffffff', details: 'Collo blu, maniche bianche' },
          shorts: { color: '#ffffff', details: 'Pantaloncini bianchi' },
          socks: { color: '#ffffff', details: 'Calzettoni bianchi con righe blu' }
        }
      }
    ],
    
    // Configurazioni Generali
    config: {
      currentSeason: '2024-25',
      defaultCurrency: 'EUR',
      timezone: 'Europe/Rome',
      language: 'it',
      dateFormat: 'dd/MM/yyyy',
      fiscalYearStart: '07-01', // 1 luglio
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      integrations: {
        figc: true,
        lnd: true,
        insurance: 'Generali',
        accounting: 'TeamSystem'
      }
    }
  });

  const tabs = [
    { id: 'society', label: 'Società', icon: Building2 },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'facilities', label: 'Strutture', icon: MapPin },
    { id: 'kits', label: 'Maglie', icon: Shirt },
    { id: 'config', label: 'Configurazioni', icon: Settings }
  ];

  const handleInputChange = (section, field, value, subField = null) => {
    setSettings(prev => ({
      ...prev,
      [section]: subField 
        ? { ...prev[section], [field]: { ...prev[section][field], [subField]: value } }
        : { ...prev[section], [field]: value }
    }));
  };

  const handleSave = () => {
    onSave(settings);
    console.log('Saving settings:', settings);
  };

  const addStaffMember = () => {
    const newMember = {
      id: Date.now(),
      name: '',
      role: '',
      phone: '',
      email: '',
      photo: null,
      bio: '',
      responsibilities: []
    };
    setSettings(prev => ({
      ...prev,
      staff: [...prev.staff, newMember]
    }));
  };

  const removeStaffMember = (id) => {
    setSettings(prev => ({
      ...prev,
      staff: prev.staff.filter(member => member.id !== id)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="h-6 w-6 text-blue-500" />
              Impostazioni Società
            </h1>
            <p className="text-gray-600 mt-1">
              Gestisci dati società, staff, strutture e configurazioni
            </p>
          </div>
          
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Salva Modifiche
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="border-b">
          <nav className="flex">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium transition-colors
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
        <div className="p-6">
          {/* Tab Società */}
          {activeTab === 'society' && (
            <div className="space-y-6">
              {/* Avviso per l'anagrafica completa */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Anagrafica Completa Società</p>
                    <p className="text-sm text-blue-700">Gestisci tutti i dettagli della società inclusi logo, colori, contatti e dati legali</p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentView('organization-details')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Apri Anagrafica
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Logo e Branding */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4">
                      {settings.society.shortName.charAt(0)}
                    </div>
                    <button className="flex items-center gap-2 mx-auto px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Upload className="h-4 w-4" />
                      Carica Logo
                    </button>
                  </div>
                </div>

                {/* Dati Principali */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome Società *
                      </label>
                      <input
                        type="text"
                        value={settings.society.name}
                        onChange={(e) => handleInputChange('society', 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome Abbreviato *
                      </label>
                      <input
                        type="text"
                        value={settings.society.shortName}
                        onChange={(e) => handleInputChange('society', 'shortName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Anno di Fondazione
                      </label>
                      <input
                        type="number"
                        value={settings.society.foundedYear}
                        onChange={(e) => handleInputChange('society', 'foundedYear', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sito Web
                      </label>
                      <input
                        type="url"
                        value={settings.society.website}
                        onChange={(e) => handleInputChange('society', 'website', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="inline h-4 w-4 mr-1" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={settings.society.email}
                        onChange={(e) => handleInputChange('society', 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="inline h-4 w-4 mr-1" />
                        Telefono
                      </label>
                      <input
                        type="tel"
                        value={settings.society.phone}
                        onChange={(e) => handleInputChange('society', 'phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Indirizzo */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  Indirizzo Sede
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Via/Piazza</label>
                    <input
                      type="text"
                      value={settings.society.address.street}
                      onChange={(e) => handleInputChange('society', 'address', e.target.value, 'street')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Città</label>
                    <input
                      type="text"
                      value={settings.society.address.city}
                      onChange={(e) => handleInputChange('society', 'address', e.target.value, 'city')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CAP</label>
                    <input
                      type="text"
                      value={settings.society.address.zipCode}
                      onChange={(e) => handleInputChange('society', 'address', e.target.value, 'zipCode')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Staff */}
          {activeTab === 'staff' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Gestione Staff</h3>
                <button
                  onClick={addStaffMember}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Aggiungi Membro
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {settings.staff.map(member => (
                  <div key={member.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                          {member.name.charAt(0) || '?'}
                        </div>
                        <div>
                          <h4 className="font-semibold">{member.name || 'Nuovo Membro'}</h4>
                          <p className="text-sm text-gray-600">{member.role}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeStaffMember(member.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Nome Completo</label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => {
                              setSettings(prev => ({
                                ...prev,
                                staff: prev.staff.map(m => 
                                  m.id === member.id ? { ...m, name: e.target.value } : m
                                )
                              }));
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Ruolo</label>
                          <input
                            type="text"
                            value={member.role}
                            onChange={(e) => {
                              setSettings(prev => ({
                                ...prev,
                                staff: prev.staff.map(m => 
                                  m.id === member.id ? { ...m, role: e.target.value } : m
                                )
                              }));
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Strutture */}
          {activeTab === 'facilities' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Strutture Sportive</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {settings.facilities.map(facility => (
                  <div key={facility.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                      <Camera className="h-8 w-8 text-gray-400" />
                    </div>
                    
                    <h4 className="font-semibold text-lg mb-2">{facility.name}</h4>
                    <StatusBadge status="valid" size="sm" className="mb-3">
                      {facility.type}
                    </StatusBadge>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{facility.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Capienza: {facility.capacity} persone</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Maglie */}
          {activeTab === 'kits' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Maglie e Divise</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {settings.kits.map(kit => (
                  <div key={kit.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="text-center mb-4">
                      <div 
                        className="w-20 h-20 mx-auto rounded-lg mb-3 flex items-center justify-center"
                        style={{ backgroundColor: kit.primaryColor }}
                      >
                        <Shirt className="h-10 w-10 text-white" />
                      </div>
                      <h4 className="font-semibold">{kit.name}</h4>
                      <StatusBadge status="valid" size="sm" className="mt-1">
                        {kit.type.toUpperCase()}
                      </StatusBadge>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium">Descrizione:</span>
                        <p className="text-gray-600">{kit.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Configurazioni */}
          {activeTab === 'config' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Configurazioni Generali</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Impostazioni Base</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stagione Corrente</label>
                      <input
                        type="text"
                        value={settings.config.currentSeason}
                        onChange={(e) => handleInputChange('config', 'currentSeason', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Integrazioni</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">FIGC</span>
                      <StatusBadge status={settings.config.integrations.figc ? 'valid' : 'critical'}>
                        {settings.config.integrations.figc ? 'Attiva' : 'Disattiva'}
                      </StatusBadge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;