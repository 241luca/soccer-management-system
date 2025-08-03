import { useState } from 'react';
import { Building2, ChevronRight } from 'lucide-react';

export default function OrganizationSelector({ organizations, onSelect }) {
  const [selectedOrg, setSelectedOrg] = useState(null);

  const handleSelect = () => {
    if (selectedOrg) {
      onSelect(selectedOrg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
              <Building2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Seleziona Organizzazione
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hai accesso a multiple organizzazioni. Seleziona quella con cui vuoi lavorare.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {organizations.map((org) => (
            <button
              key={org.id}
              onClick={() => setSelectedOrg(org.id)}
              className={`w-full group relative flex items-center px-6 py-4 border rounded-lg transition-all ${
                selectedOrg === org.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
            >
              <div className="flex-1 text-left">
                <h3 className="text-lg font-medium text-gray-900">{org.name}</h3>
                <p className="text-sm text-gray-500">
                  Piano {org.plan} • Ruolo: {org.role}
                </p>
              </div>
              <ChevronRight className={`w-5 h-5 transition-colors ${
                selectedOrg === org.id ? 'text-blue-600' : 'text-gray-400'
              }`} />
            </button>
          ))}
        </div>

        <div>
          <button
            onClick={handleSelect}
            disabled={!selectedOrg}
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continua
          </button>
        </div>
      </div>
    </div>
  );
}
