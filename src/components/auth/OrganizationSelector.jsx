import { useState } from 'react';
import { Building2, ChevronRight, Users, Trophy, Flag } from 'lucide-react';

export default function OrganizationSelector({ organizations, onSelect }) {
  const [selectedOrg, setSelectedOrg] = useState(null);

  const handleSelect = () => {
    if (selectedOrg) {
      onSelect(selectedOrg);
    }
  };

  // Funzione per determinare l'icona e il colore in base al tipo di società
  const getOrgStyle = (org) => {
    if (org.code === 'DEMO') {
      return {
        icon: Flag,
        color: 'green',
        badge: 'DEMO',
        badgeColor: 'bg-green-100 text-green-800'
      };
    } else if (org.code === 'RAVENNA') {
      return {
        icon: Trophy,
        color: 'blue',
        badge: 'PRODUZIONE',
        badgeColor: 'bg-blue-100 text-blue-800'
      };
    }
    return {
      icon: Building2,
      color: 'gray',
      badge: org.plan,
      badgeColor: 'bg-gray-100 text-gray-800'
    };
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl w-full space-y-8 px-4">
        <div>
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <Building2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Seleziona la Società
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hai accesso a più società sportive. Scegli con quale vuoi lavorare oggi.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {organizations.map((org) => {
            const style = getOrgStyle(org);
            const Icon = style.icon;
            
            return (
              <button
                key={org.id}
                onClick={() => setSelectedOrg(org.id)}
                className={`w-full group relative flex items-center px-6 py-5 border-2 rounded-xl transition-all transform hover:scale-[1.02] ${
                  selectedOrg === org.id
                    ? 'border-indigo-500 bg-white shadow-lg ring-2 ring-indigo-500 ring-opacity-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white shadow hover:shadow-md'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                  selectedOrg === org.id 
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-600' 
                    : 'bg-gray-100'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    selectedOrg === org.id ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {org.name}
                    </h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${style.badgeColor}`}>
                      {style.badge}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {org.role || 'Admin'}
                    </span>
                    {org.teams && (
                      <span>• {org.teams} squadre</span>
                    )}
                    {org.athletes && (
                      <span>• {org.athletes} atleti</span>
                    )}
                  </div>
                  
                  {org.lastAccess && (
                    <p className="text-xs text-gray-400 mt-1">
                      Ultimo accesso: {new Date(org.lastAccess).toLocaleDateString('it-IT')}
                    </p>
                  )}
                </div>
                
                <ChevronRight className={`w-5 h-5 transition-all ${
                  selectedOrg === org.id 
                    ? 'text-indigo-600 translate-x-1' 
                    : 'text-gray-400 group-hover:translate-x-1'
                }`} />
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSelect}
            disabled={!selectedOrg}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {selectedOrg ? 'Accedi alla Società' : 'Seleziona una società per continuare'}
          </button>
          
          <p className="text-center text-xs text-gray-500">
            Potrai sempre cambiare società dal menu utente
          </p>
        </div>
      </div>
    </div>
  );
}