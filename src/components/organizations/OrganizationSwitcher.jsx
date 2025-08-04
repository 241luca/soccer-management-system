import React, { useState, useEffect } from 'react';
import { Building2, ChevronDown, Check } from 'lucide-react';
import { api } from '../../services/api';

const OrganizationSwitcher = ({ currentOrganization, onSwitch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    loadUserOrganizations();
  }, []);

  // Chiudi dropdown quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.org-switcher-container')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadUserOrganizations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/user-organizations');
      setOrganizations(response.data);
    } catch (error) {
      console.error('Error loading organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = async (orgId) => {
    if (orgId === currentOrganization?.id) {
      setIsOpen(false);
      return;
    }

    try {
      setSwitching(true);
      const response = await api.post('/auth/switch-organization', {
        organizationId: orgId
      });
      
      // Salva il nuovo token
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      // Chiama il callback per aggiornare l'app
      onSwitch(response.data);
      setIsOpen(false);
      
      // Ricarica la pagina per aggiornare tutto il contesto
      window.location.reload();
    } catch (error) {
      console.error('Error switching organization:', error);
      alert('Errore durante il cambio società');
    } finally {
      setSwitching(false);
    }
  };

  // Se c'è solo un'organizzazione, non mostrare il switcher
  if (organizations.length <= 1) {
    return null;
  }

  return (
    <div className="org-switcher-container relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        disabled={loading || switching}
      >
        <Building2 className="h-4 w-4 text-gray-600" />
        <span className="font-medium text-gray-900 max-w-[150px] truncate">
          {currentOrganization?.name || 'Seleziona società'}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-2">
            <p className="text-xs text-gray-500 px-2 py-1">Le tue società</p>
            
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => handleSwitch(org.id)}
                disabled={switching}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between group ${
                  org.id === currentOrganization?.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    org.id === currentOrganization?.id
                      ? 'bg-blue-200'
                      : 'bg-gray-200'
                  }`}>
                    <Building2 className={`h-4 w-4 ${
                      org.id === currentOrganization?.id
                        ? 'text-blue-700'
                        : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{org.name}</p>
                    <p className="text-xs text-gray-500">{org.code}</p>
                  </div>
                </div>
                
                {org.id === currentOrganization?.id && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
          
          {switching && (
            <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
              <div className="text-sm text-gray-600">Cambio società...</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrganizationSwitcher;