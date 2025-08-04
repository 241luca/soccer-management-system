import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  CreditCard, 
  Calendar,
  MoreVertical,
  Plus,
  Edit,
  Eye,
  Settings,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import { api } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const OrganizationList = ({ onNavigate }) => {
  const { data: organizations, loading, error, refetch } = useApiData('/organizations');
  const [showDropdown, setShowDropdown] = useState(null);

  // Chiudi dropdown quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const getPlanBadgeColor = (plan) => {
    switch (plan) {
      case 'Enterprise':
        return 'bg-purple-100 text-purple-800';
      case 'Pro':
        return 'bg-blue-100 text-blue-800';
      case 'Basic':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="flex items-center text-green-600">
        <CheckCircle className="w-4 h-4 mr-1" />
        Attiva
      </span>
    ) : (
      <span className="flex items-center text-red-600">
        <XCircle className="w-4 h-4 mr-1" />
        Sospesa
      </span>
    );
  };

  const handleViewDetails = (orgId) => {
    if (onNavigate) onNavigate('organizations-detail', { orgId });
  };

  const handleEdit = (orgId) => {
    if (onNavigate) onNavigate('organizations-edit', { orgId });
  };

  const handleSettings = (orgId) => {
    if (onNavigate) onNavigate('organizations-settings', { orgId });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizzazioni</h1>
          <p className="text-gray-600 mt-1">Gestisci tutte le società nel sistema</p>
        </div>
        <button
          onClick={() => onNavigate && onNavigate('organizations-new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuova Organizzazione
        </button>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations?.map((org) => (
          <div
            key={org.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            {/* Card Header */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{org.name}</h3>
                    <p className="text-sm text-gray-500">{org.code}</p>
                  </div>
                </div>
                
                {/* Dropdown Menu */}
                <div className="relative dropdown-container">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(showDropdown === org.id ? null : org.id);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                  
                  {showDropdown === org.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <button
                        onClick={() => handleViewDetails(org.id)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Visualizza
                      </button>
                      <button
                        onClick={() => handleEdit(org.id)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Modifica
                      </button>
                      <button
                        onClick={() => handleSettings(org.id)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Impostazioni
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Organization Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Piano</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanBadgeColor(org.plan)}`}>
                    {org.plan}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Stato</span>
                  {getStatusBadge(org.isActive)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Utenti
                  </span>
                  <span className="text-sm font-medium">
                    {org.userCount || 0}/{org.maxUsers || '∞'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Creata
                  </span>
                  <span className="text-sm">
                    {new Date(org.createdAt).toLocaleDateString('it-IT')}
                  </span>
                </div>

                {org.subdomain && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-500">Subdomain</p>
                    <p className="text-sm font-mono text-blue-600">
                      {org.subdomain}.soccermanager.com
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t">
              <button
                onClick={() => handleViewDetails(org.id)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Gestisci →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {organizations?.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Nessuna organizzazione</h3>
          <p className="text-gray-500 mt-1">Crea la prima organizzazione per iniziare</p>
          <button
            onClick={() => onNavigate && onNavigate('organizations-new')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Crea Organizzazione
          </button>
        </div>
      )}
    </div>
  );
};

export default OrganizationList;