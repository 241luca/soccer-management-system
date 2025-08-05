import React, { useState, useEffect } from 'react';
import {
  Building2,
  Save,
  Upload,
  Palette,
  Contact,
  MapPin,
  Phone,
  Mail,
  Globe,
  CreditCard,
  Shield,
  Share2,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Users,
  FileText,
  Plus,
  Edit2,
  Trash2,
  Home,
  Shirt,
  Settings,
  ExternalLink,
  DollarSign,
  Calendar,
  Bell
} from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const OrganizationDetails = ({ organizationId, canEdit = true, onBack }) => {
  console.log('OrganizationDetails mounted with:', {
    organizationId, 
    canEdit,
    user: JSON.parse(localStorage.getItem('user') || '{}')
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [organization, setOrganization] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    loadOrganizationDetails();
  }, [organizationId]);

  const loadOrganizationDetails = async () => {
    try {
      setLoading(true);
      console.log('Loading organization details for ID:', organizationId);
      
      // Se abbiamo un organizationId specifico, usiamolo nell'URL
      const url = organizationId 
        ? `/organizations/${organizationId}/details`
        : '/organizations/current/details';
      
      const response = await api.get(url);
      console.log('Organization details response:', response);
      
      // La risposta potrebbe essere direttamente i dati o dentro response.data
      const organizationData = response.data || response;
      
      setOrganization(organizationData);
      setFormData(organizationData);
    } catch (error) {
      console.error('Error loading organization details:', error);
      
      // Se è un errore 403 per Super Admin o Admin, proviamo a caricare comunque i dati base
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if ((error.message?.includes('Super admin access required') || error.message?.includes('403')) && 
          (user.role === 'SUPER_ADMIN' || user.isSuperAdmin || user.role === 'Admin' || user.role === 'ADMIN')) {
        
        // Carica almeno i dati dal localStorage se disponibili
        const storedOrg = localStorage.getItem('organization');
        if (storedOrg) {
          const orgData = JSON.parse(storedOrg);
          if (orgData.id === organizationId) {
            setOrganization(orgData);
            setFormData(orgData);
            return;
          }
        }
      }
      
      setErrors({ general: 'Errore nel caricamento dei dati: ' + (error.message || 'Errore sconosciuto') });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate emails
    const emailFields = ['email', 'presidentEmail', 'secretaryEmail'];
    emailFields.forEach(field => {
      if (formData[field] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[field])) {
        newErrors[field] = 'Email non valida';
      }
    });

    // Validate colors
    const colorFields = ['primaryColor', 'secondaryColor'];
    colorFields.forEach(field => {
      if (formData[field] && !/^#[0-9A-F]{6}$/i.test(formData[field])) {
        newErrors[field] = 'Formato colore non valido (es. #3B82F6)';
      }
    });

    // Validate postal code
    if (formData.postalCode && !/^\d{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'CAP deve essere di 5 cifre';
    }

    // Validate province
    if (formData.province && formData.province.length !== 2) {
      newErrors.province = 'Provincia deve essere di 2 caratteri';
    }

    // Validate founded year
    if (formData.foundedYear) {
      const year = parseInt(formData.foundedYear);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear) {
        newErrors.foundedYear = `Anno deve essere tra 1900 e ${currentYear}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setSuccessMessage('');
      
      // Filtra solo i campi che sono effettivamente modificabili
      const fieldsToUpdate = {
        name: formData.name,
        fullName: formData.fullName,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        postalCode: formData.postalCode,
        country: formData.country,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        fiscalCode: formData.fiscalCode,
        vatNumber: formData.vatNumber,
        iban: formData.iban,
        bankName: formData.bankName,
        presidentName: formData.presidentName,
        presidentEmail: formData.presidentEmail,
        presidentPhone: formData.presidentPhone,
        secretaryName: formData.secretaryName,
        secretaryEmail: formData.secretaryEmail,
        secretaryPhone: formData.secretaryPhone,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        socialFacebook: formData.socialFacebook,
        socialInstagram: formData.socialInstagram,
        socialTwitter: formData.socialTwitter,
        socialYoutube: formData.socialYoutube,
        foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : null,
        federationNumber: formData.federationNumber
      };
      
      // Rimuovi i campi null o undefined
      Object.keys(fieldsToUpdate).forEach(key => {
        if (fieldsToUpdate[key] === null || fieldsToUpdate[key] === undefined || fieldsToUpdate[key] === '') {
          delete fieldsToUpdate[key];
        }
      });
      
      // Se abbiamo un organizationId specifico, usiamolo nell'URL
      const url = organizationId 
        ? `/organizations/${organizationId}/details`
        : '/organizations/current/details';
      
      const options = {};
      
      // Se stiamo modificando un'organizzazione specifica come Super Admin
      // NON inviare X-Organization-ID header
      if (!organizationId) {
        // Solo per l'organizzazione corrente
        const org = localStorage.getItem('organization');
        if (org) {
          const orgData = JSON.parse(org);
          options.headers = {
            'X-Organization-ID': orgData.id
          };
        }
      }
      
      console.log('Saving organization with data:', fieldsToUpdate);
      const response = await api.patch(url, fieldsToUpdate, options);
      
      // Aggiorna i dati locali con la risposta del server
      const updatedData = response.data || response;
      setOrganization(updatedData);
      setFormData(updatedData);
      
      // Se abbiamo cambiato il nome dell'organizzazione corrente, aggiorna localStorage
      if (!organizationId) {
        const org = localStorage.getItem('organization');
        if (org && updatedData.name) {
          const orgData = JSON.parse(org);
          orgData.name = updatedData.name;
          localStorage.setItem('organization', JSON.stringify(orgData));
        }
      }
      
      setSuccessMessage('✅ Dati salvati con successo!');
      
      // Mostra notifica toast se disponibile
      if (window.showToast) {
        window.showToast('success', 'Anagrafica aggiornata con successo!');
      }
      
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error saving organization details:', error);
      setErrors({ general: 'Errore nel salvataggio dei dati' });
      
      // Mostra notifica toast di errore se disponibile
      if (window.showToast) {
        window.showToast('error', 'Errore nel salvataggio dei dati');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ logo: 'Il file deve essere un\'immagine' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ logo: 'Il file non può superare i 5MB' });
      return;
    }

    const formData = new FormData();
    formData.append('logo', file);

    try {
      setSaving(true);
      const response = await api.post('/organizations/current/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update logo URL
      handleInputChange('logoUrl', response.data.logoUrl);
      setSuccessMessage('Logo caricato con successo!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error uploading logo:', error);
      setErrors({ logo: 'Errore nel caricamento del logo' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!organization) {
    return <ErrorMessage message="Organizzazione non trovata" />;
  }

  const tabs = [
    { id: 'general', label: 'Informazioni Generali', icon: Building2 },
    { id: 'contacts', label: 'Contatti', icon: Contact },
    { id: 'legal', label: 'Dati Legali', icon: Shield },
    { id: 'appearance', label: 'Aspetto', icon: Palette },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'facilities', label: 'Strutture', icon: Home },
    { id: 'kits', label: 'Maglie', icon: Shirt },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'sponsors', label: 'Sponsor', icon: CreditCard },
    { id: 'documents', label: 'Documenti', icon: FileText }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Torna indietro"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                Anagrafica Società
                {organization && (
                  <span className="text-lg font-medium text-gray-600 animate-fade-in-down">
                    - {organization.name}
                  </span>
                )}
              </h1>
              <p className="text-gray-600 mt-1">
                Gestisci i dettagli completi della tua organizzazione
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Info Card - Prima dei tab */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">
                {organization?.name || 'Organizzazione'}
              </h3>
              <p className="text-sm text-gray-600">
                Stai visualizzando i dati di questa società
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Solo per Super Admin o Owner Multi-Società - pulsante cambio società */}
            {(JSON.parse(localStorage.getItem('user') || '{}').role === 'SUPER_ADMIN' || 
              JSON.parse(localStorage.getItem('user') || '{}').role === 'Owner') && (
              <button
                onClick={() => {
                  const event = new CustomEvent('navigate', { detail: { view: 'organizations' } });
                  window.dispatchEvent(event);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>Cambia Società</span>
              </button>
            )}
            <button
              onClick={() => {
                const event = new CustomEvent('navigate', { detail: { view: 'system-settings' } });
                window.dispatchEvent(event);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <span>Altri Dati</span>
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center animate-fade-in-down">
          <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}
      
      {errors.general && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center animate-shake">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Logo Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Logo e Identità</h3>
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {formData.logoUrl ? (
                      <img 
                        src={formData.logoUrl} 
                        alt="Logo" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Building2 className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  {canEdit && (
                    <label className="mt-3 block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={saving}
                      />
                      <button
                        type="button"
                        onClick={(e) => e.currentTarget.previousElementSibling.click()}
                        className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center justify-center"
                        disabled={saving}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Carica Logo
                      </button>
                    </label>
                  )}
                  {errors.logo && (
                    <p className="mt-1 text-sm text-red-600">{errors.logo}</p>
                  )}
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nome Breve
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      disabled={!canEdit}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Codice
                    </label>
                    <input
                      type="text"
                      value={formData.code || ''}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                      disabled
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={formData.fullName || ''}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="es. Associazione Sportiva Dilettantistica..."
                      disabled={!canEdit}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Descrizione
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Breve descrizione della società..."
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Sede Legale
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Indirizzo
                  </label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Via/Piazza..."
                    disabled={!canEdit}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Città
                  </label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={!canEdit}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Provincia
                  </label>
                  <input
                    type="text"
                    value={formData.province || ''}
                    onChange={(e) => handleInputChange('province', e.target.value.toUpperCase())}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.province ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="XX"
                    maxLength={2}
                    disabled={!canEdit}
                  />
                  {errors.province && (
                    <p className="mt-1 text-sm text-red-600">{errors.province}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    CAP
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode || ''}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.postalCode ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="00000"
                    maxLength={5}
                    disabled={!canEdit}
                  />
                  {errors.postalCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Paese
                  </label>
                  <select
                    value={formData.country || 'IT'}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={!canEdit}
                  >
                    <option value="IT">Italia</option>
                    <option value="SM">San Marino</option>
                    <option value="VA">Città del Vaticano</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Other Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Altre Informazioni</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Anno di Fondazione
                  </label>
                  <input
                    type="number"
                    value={formData.foundedYear || ''}
                    onChange={(e) => handleInputChange('foundedYear', parseInt(e.target.value))}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.foundedYear ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="es. 1985"
                    min="1900"
                    max={new Date().getFullYear()}
                    disabled={!canEdit}
                  />
                  {errors.foundedYear && (
                    <p className="mt-1 text-sm text-red-600">{errors.foundedYear}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Numero Federazione
                  </label>
                  <input
                    type="text"
                    value={formData.federationNumber || ''}
                    onChange={(e) => handleInputChange('federationNumber', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Numero FIGC/Federazione"
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sponsors' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Sponsor e Partner
              </h3>
              {canEdit && (
                <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Aggiungi Sponsor
                </button>
              )}
            </div>
            
            {/* Categorie sponsor */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <p className="text-sm font-medium">Main Sponsor</p>
                <p className="text-xs text-gray-500">0 sponsor</p>
              </div>
              <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Shirt className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium">Technical Sponsor</p>
                <p className="text-xs text-gray-500">0 sponsor</p>
              </div>
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <CreditCard className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium">Partner</p>
                <p className="text-xs text-gray-500">0 partner</p>
              </div>
            </div>
            
            {/* Placeholder per lista sponsor */}
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>Nessuno sponsor registrato</p>
              <p className="text-sm mt-1">Aggiungi sponsor principali, tecnici e partner commerciali</p>
            </div>
          </div>
        )}

        {activeTab === 'facilities' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Home className="h-5 w-5 mr-2" />
                Strutture Sportive
              </h3>
              {canEdit && (
                <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Aggiungi Struttura
                </button>
              )}
            </div>
            
            {/* Placeholder per lista strutture */}
            <div className="text-center py-8 text-gray-500">
              <Home className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>Nessuna struttura registrata</p>
              <p className="text-sm mt-1">Aggiungi le strutture sportive utilizzate dalla società</p>
            </div>
          </div>
        )}

        {activeTab === 'kits' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Shirt className="h-5 w-5 mr-2" />
                Maglie e Divise
              </h3>
              {canEdit && (
                <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Aggiungi Maglia
                </button>
              )}
            </div>
            
            {/* Placeholder per lista maglie */}
            <div className="text-center py-8 text-gray-500">
              <Shirt className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>Nessuna maglia registrata</p>
              <p className="text-sm mt-1">Aggiungi le maglie e divise ufficiali delle squadre</p>
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Staff Tecnico e Dirigenziale
              </h3>
              {canEdit && (
                <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Aggiungi Membro Staff
                </button>
              )}
            </div>
            
            {/* Staff esistente dal database */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Presidente */}
              {formData.presidentName && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{formData.presidentName}</h4>
                      <p className="text-sm text-gray-600">Presidente</p>
                      {formData.presidentEmail && (
                        <p className="text-sm text-gray-500 mt-1">{formData.presidentEmail}</p>
                      )}
                      {formData.presidentPhone && (
                        <p className="text-sm text-gray-500">{formData.presidentPhone}</p>
                      )}
                    </div>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Dirigenza</span>
                  </div>
                </div>
              )}
              
              {/* Segretario */}
              {formData.secretaryName && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{formData.secretaryName}</h4>
                      <p className="text-sm text-gray-600">Segretario</p>
                      {formData.secretaryEmail && (
                        <p className="text-sm text-gray-500 mt-1">{formData.secretaryEmail}</p>
                      )}
                      {formData.secretaryPhone && (
                        <p className="text-sm text-gray-500">{formData.secretaryPhone}</p>
                      )}
                    </div>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Dirigenza</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Placeholder per altri membri staff */}
            {!formData.presidentName && !formData.secretaryName && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Nessun membro dello staff registrato</p>
                <p className="text-sm mt-1">Aggiungi allenatori, dirigenti e staff tecnico</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Documenti Societari
              </h3>
              {canEdit && (
                <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm">
                  <Upload className="h-4 w-4 mr-1" />
                  Carica Documento
                </button>
              )}
            </div>
            
            {/* Categorie documenti */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <p className="text-sm font-medium">Statuto</p>
                <p className="text-xs text-gray-500">0 documenti</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <p className="text-sm font-medium">Bilanci</p>
                <p className="text-xs text-gray-500">0 documenti</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <p className="text-sm font-medium">Verbali</p>
                <p className="text-xs text-gray-500">0 documenti</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <p className="text-sm font-medium">Certificati</p>
                <p className="text-xs text-gray-500">0 documenti</p>
              </div>
            </div>
            
            {/* Placeholder per lista documenti */}
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>Nessun documento caricato</p>
              <p className="text-sm mt-1">Carica statuto, bilanci, verbali e altri documenti societari</p>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="space-y-6">
            {/* Organization Contacts */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contatti Società</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Telefono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="+39 000 0000000"
                    disabled={!canEdit}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="info@società.it"
                    disabled={!canEdit}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <Globe className="inline h-4 w-4 mr-1" />
                    Sito Web
                  </label>
                  <input
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://www.società.it"
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </div>

            {/* President Contacts */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Presidente</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nome e Cognome
                  </label>
                  <input
                    type="text"
                    value={formData.presidentName || ''}
                    onChange={(e) => handleInputChange('presidentName', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={!canEdit}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.presidentEmail || ''}
                    onChange={(e) => handleInputChange('presidentEmail', e.target.value)}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.presidentEmail ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={!canEdit}
                  />
                  {errors.presidentEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.presidentEmail}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    value={formData.presidentPhone || ''}
                    onChange={(e) => handleInputChange('presidentPhone', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </div>

            {/* Secretary Contacts */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Segretario</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nome e Cognome
                  </label>
                  <input
                    type="text"
                    value={formData.secretaryName || ''}
                    onChange={(e) => handleInputChange('secretaryName', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={!canEdit}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.secretaryEmail || ''}
                    onChange={(e) => handleInputChange('secretaryEmail', e.target.value)}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.secretaryEmail ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={!canEdit}
                  />
                  {errors.secretaryEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.secretaryEmail}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    value={formData.secretaryPhone || ''}
                    onChange={(e) => handleInputChange('secretaryPhone', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'legal' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dati Fiscali</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Codice Fiscale
                  </label>
                  <input
                    type="text"
                    value={formData.fiscalCode || ''}
                    onChange={(e) => handleInputChange('fiscalCode', e.target.value.toUpperCase())}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="00000000000"
                    disabled={!canEdit}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Partita IVA
                  </label>
                  <input
                    type="text"
                    value={formData.vatNumber || ''}
                    onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="00000000000"
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Dati Bancari
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    IBAN
                  </label>
                  <input
                    type="text"
                    value={formData.iban || ''}
                    onChange={(e) => handleInputChange('iban', e.target.value.toUpperCase())}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="IT00X0000000000000000000000"
                    disabled={!canEdit}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nome Banca
                  </label>
                  <input
                    type="text"
                    value={formData.bankName || ''}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="es. Banca Intesa"
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Colori Societari</h3>
              <p className="text-sm text-gray-600 mb-4">
                I colori societari verranno utilizzati nell'interfaccia per personalizzare l'aspetto.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Colore Primario
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.primaryColor || '#3B82F6'}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value.toUpperCase())}
                      className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                      disabled={!canEdit}
                    />
                    <input
                      type="text"
                      value={formData.primaryColor || '#3B82F6'}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value.toUpperCase())}
                      className={`flex-1 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        errors.primaryColor ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="#3B82F6"
                      disabled={!canEdit}
                    />
                  </div>
                  {errors.primaryColor && (
                    <p className="mt-1 text-sm text-red-600">{errors.primaryColor}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Colore Secondario
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.secondaryColor || '#1E40AF'}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value.toUpperCase())}
                      className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                      disabled={!canEdit}
                    />
                    <input
                      type="text"
                      value={formData.secondaryColor || '#1E40AF'}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value.toUpperCase())}
                      className={`flex-1 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        errors.secondaryColor ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="#1E40AF"
                      disabled={!canEdit}
                    />
                  </div>
                  {errors.secondaryColor && (
                    <p className="mt-1 text-sm text-red-600">{errors.secondaryColor}</p>
                  )}
                </div>
              </div>
              
              {/* Color Preview */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-3">Anteprima Colori</p>
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-24 h-12 rounded shadow-sm flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: formData.primaryColor || '#3B82F6' }}
                  >
                    Primario
                  </div>
                  <div 
                    className="w-24 h-12 rounded shadow-sm flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: formData.secondaryColor || '#1E40AF' }}
                  >
                    Secondario
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profili Social Media</h3>
              <p className="text-sm text-gray-600 mb-4">
                Inserisci gli URL completi dei profili social della società.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="inline-flex items-center">
                      <span className="mr-2">📘</span> Facebook
                    </span>
                  </label>
                  <input
                    type="url"
                    value={formData.socialFacebook || ''}
                    onChange={(e) => handleInputChange('socialFacebook', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://www.facebook.com/tuapagina"
                    disabled={!canEdit}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="inline-flex items-center">
                      <span className="mr-2">📷</span> Instagram
                    </span>
                  </label>
                  <input
                    type="url"
                    value={formData.socialInstagram || ''}
                    onChange={(e) => handleInputChange('socialInstagram', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://www.instagram.com/tuoprofilo"
                    disabled={!canEdit}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="inline-flex items-center">
                      <span className="mr-2">🐦</span> Twitter/X
                    </span>
                  </label>
                  <input
                    type="url"
                    value={formData.socialTwitter || ''}
                    onChange={(e) => handleInputChange('socialTwitter', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://twitter.com/tuoprofilo"
                    disabled={!canEdit}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="inline-flex items-center">
                      <span className="mr-2">📺</span> YouTube
                    </span>
                  </label>
                  <input
                    type="url"
                    value={formData.socialYoutube || ''}
                    onChange={(e) => handleInputChange('socialYoutube', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://www.youtube.com/c/tuocanale"
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      {canEdit && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Salva Modifiche
              </>
            )}
          </button>
        </div>
      )}

      {/* Stats Footer */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{organization._count?.users || 0}</p>
            <p className="text-sm text-gray-600">Utenti</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{organization._count?.athletes || 0}</p>
            <p className="text-sm text-gray-600">Atlete</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{organization._count?.teams || 0}</p>
            <p className="text-sm text-gray-600">Squadre</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetails;
