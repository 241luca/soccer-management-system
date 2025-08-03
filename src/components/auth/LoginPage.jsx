import { useState } from 'react';
import { api } from '../../services/api';
import { LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import OrganizationSelector from './OrganizationSelector';

export default function LoginPage({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [organizations, setOrganizations] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.login(formData.email, formData.password);
      
      // Check if user needs to select organization
      if (data.requiresOrganizationSelection) {
        setOrganizations(data.organizations);
      } else {
        onLogin(data.user);
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizationSelect = async (organizationId) => {
    setLoading(true);
    setError('');

    try {
      const data = await api.login(formData.email, formData.password, organizationId);
      onLogin(data.user);
    } catch (err) {
      setError(err.message || 'Login failed');
      setOrganizations(null);
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = () => {
    setFormData({
      email: 'admin@demosoccerclub.com',
      password: 'admin123'
    });
  };

  const setSuperAdminCredentials = () => {
    setFormData({
      email: 'superadmin@soccermanager.com',
      password: 'superadmin123456'
    });
  };

  // Show organization selector if needed
  if (organizations) {
    return (
      <OrganizationSelector 
        organizations={organizations} 
        onSelect={handleOrganizationSelect}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
              <LogIn className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Soccer Management System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Accedi al sistema di gestione
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Inserisci la tua email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Inserisci la password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </div>

          <div className="border-t pt-4">
            <p className="text-center text-sm text-gray-600 mb-3">
              Credenziali di accesso disponibili:
            </p>
            
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-700">Admin Demo:</p>
                <p className="text-xs font-mono text-gray-600">admin@demosoccerclub.com / admin123</p>
                <button
                  type="button"
                  onClick={setDemoCredentials}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-500 font-medium"
                >
                  Usa queste credenziali
                </button>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-700">Super Admin:</p>
                <p className="text-xs font-mono text-gray-600">superadmin@soccermanager.com / superadmin123456</p>
                <button
                  type="button"
                  onClick={setSuperAdminCredentials}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-500 font-medium"
                >
                  Usa queste credenziali
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
