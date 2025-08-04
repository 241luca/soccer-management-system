import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Mail, 
  User, 
  Lock,
  Globe,
  CreditCard,
  Save,
  ArrowLeft
} from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const OrganizationForm = ({ organizationId, onNavigate }) => {
  const isEditMode = !!organizationId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    subdomain: '',
    plan: 'Basic',
    ownerEmail: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerPassword: '',
    maxUsers: 5,
    maxTeams: 3,
    maxAthletes: 50,
    isActive: true
  });

  const plans = [
    {
      name: 'Basic',
      price: '€29.99/mese',
      limits: { users: 5, teams: 3, athletes: 50 }
    },
    {
      name: 'Pro',
      price: '€79.99/mese',
      limits: { users: 20, teams: 10, athletes: 200 }
    },
    {
      name: 'Enterprise',
      price: '€199.99/mese',
      limits: { users: -1, teams: -1, athletes: -1 }
    }
  ];

  useEffect(() => {
    if (isEditMode) {
      loadOrganization();
    }
  }, [organizationId]);

  const loadOrganization = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/organizations/${organizationId}`);
      const org = response.data;
      
      setFormData({
        name: org.name,
        code: org.code,
        subdomain: org.subdomain,
        plan: org.plan,
        maxUsers: org.maxUsers,
        maxTeams: org.maxTeams,
        maxAthletes: org.maxAthletes,
        isActive: org.isActive,
        // Owner fields not loaded in edit mode
        ownerEmail: '',
        ownerFirstName: '',
        ownerLastName: '',
        ownerPassword: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = (planName) => {
    const plan = plans.find(p => p.name === planName);
    setFormData({
      ...formData,
      plan: planName,
      maxUsers: plan.limits.users === -1 ? 999999 : plan.limits.users,
      maxTeams: plan.limits.teams === -1 ? 999999 : plan.limits.teams,
      maxAthletes: plan.limits.athletes === -1 ? 999999 : plan.limits.athletes
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isEditMode) {
        await api.put(`/organizations/${organizationId}`, {
          name: formData.name,
          code: formData.code,
          subdomain: formData.subdomain,
          plan: formData.plan,
          maxUsers: formData.maxUsers,
          maxTeams: formData.maxTeams,
          maxAthletes: formData.maxAthletes,
          isActive: formData.isActive
        });
      } else {
        await api.post('/organizations/create', formData);
      }
      
      if (onNavigate) onNavigate('organizations');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => onNavigate && onNavigate('organizations')}
          className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna alle organizzazioni
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Modifica Organizzazione' : 'Nuova Organizzazione'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode 
            ? 'Modifica i dettagli dell\'organizzazione' 
            : 'Crea una nuova società nel sistema'}
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Organization Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Dettagli Organizzazione
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Organizzazione *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ASD Ravenna Calcio"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Codice *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ASDRAV"
                maxLength="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subdomain
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={formData.subdomain}
                  onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ravenna"
                />
                <span className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-lg text-gray-500">
                  .soccermanager.com
                </span>
              </div>
            </div>

            {isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stato
                </label>
                <select
                  value={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="true">Attiva</option>
                  <option value="false">Sospesa</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Plan Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Piano di Abbonamento
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                onClick={() => handlePlanChange(plan.name)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.plan === plan.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <p className="text-2xl font-bold mt-2">{plan.price}</p>
                <ul className="mt-3 space-y-1 text-sm text-gray-600">
                  <li>• {plan.limits.users === -1 ? 'Utenti illimitati' : `Max ${plan.limits.users} utenti`}</li>
                  <li>• {plan.limits.teams === -1 ? 'Squadre illimitate' : `Max ${plan.limits.teams} squadre`}</li>
                  <li>• {plan.limits.athletes === -1 ? 'Atleti illimitati' : `Max ${plan.limits.athletes} atleti`}</li>
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Owner Details (only for new organizations) */}
        {!isEditMode && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Proprietario Organizzazione
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ownerFirstName}
                  onChange={(e) => setFormData({ ...formData, ownerFirstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mario"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cognome *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ownerLastName}
                  onChange={(e) => setFormData({ ...formData, ownerLastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Rossi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="admin@asdravenna.it"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={formData.ownerPassword}
                  onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  minLength="8"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('organizations')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Salvataggio...' : (isEditMode ? 'Salva Modifiche' : 'Crea Organizzazione')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrganizationForm;