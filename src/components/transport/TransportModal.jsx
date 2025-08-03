// components/transport/TransportModal.jsx
import React, { useState, useEffect } from 'react';
import { Bus, MapPin, User, X } from 'lucide-react';

const TransportModal = ({ type, item, data, onClose, onSave }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Inizializza form data
  useEffect(() => {
    if (type === 'bus') {
      setFormData({
        id: item?.id || '',
        name: item?.name || '',
        capacity: item?.capacity || '',
        driver: item?.driver || '',
        plate: item?.plate || '',
        route: item?.route || '',
        insuranceExpiry: item?.insuranceExpiry || '',
        maintenanceDate: item?.maintenanceDate || ''
      });
    } else if (type === 'zone') {
      setFormData({
        id: item?.id || '',
        name: item?.name || '',
        distance: item?.distance || '',
        monthlyFee: item?.monthlyFee || '',
        color: item?.color || 'blue',
        description: item?.description || ''
      });
    }
  }, [type, item]);

  // Gestione cambiamenti form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Rimuovi errore se campo viene compilato
    if (errors[name] && value.trim() !== '') {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validazione form
  const validateForm = () => {
    const newErrors = {};

    if (type === 'bus') {
      if (!formData.name?.trim()) newErrors.name = 'Nome pulmino richiesto';
      if (!formData.capacity || formData.capacity < 1) newErrors.capacity = 'Capienza deve essere maggiore di 0';
      if (!formData.driver?.trim()) newErrors.driver = 'Nome autista richiesto';
      if (!formData.plate?.trim()) newErrors.plate = 'Targa richiesta';
      if (!formData.route?.trim()) newErrors.route = 'Percorso richiesto';
    } else if (type === 'zone') {
      if (!formData.name?.trim()) newErrors.name = 'Nome zona richiesto';
      if (!formData.distance?.trim()) newErrors.distance = 'Distanza richiesta';
      if (!formData.monthlyFee || formData.monthlyFee < 0) newErrors.monthlyFee = 'Tariffa deve essere maggiore o uguale a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestione salvataggio
  const handleSave = () => {
    if (validateForm()) {
      onSave({
        ...formData,
        id: formData.id || Date.now(), // Genera ID se nuovo
        capacity: type === 'bus' ? parseInt(formData.capacity) : undefined,
        monthlyFee: type === 'zone' ? parseFloat(formData.monthlyFee) : undefined
      });
    }
  };

  const isEditing = !!item;
  const title = isEditing 
    ? `Modifica ${type === 'bus' ? 'Pulmino' : 'Zona'}` 
    : `Nuovo ${type === 'bus' ? 'Pulmino' : 'Zona'}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {type === 'bus' ? <Bus className="h-5 w-5 text-blue-500" /> : <MapPin className="h-5 w-5 text-green-500" />}
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {type === 'bus' ? (
            <>
              {/* Informazioni Base Pulmino */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Pulmino *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="es. Pulmino Nord"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capienza (posti) *
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity || ''}
                    onChange={handleChange}
                    min="1"
                    max="50"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.capacity ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="16"
                  />
                  {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Autista *
                  </label>
                  <input
                    type="text"
                    name="driver"
                    value={formData.driver || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.driver ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Mario Rossi"
                  />
                  {errors.driver && <p className="text-red-500 text-xs mt-1">{errors.driver}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Targa *
                  </label>
                  <input
                    type="text"
                    name="plate"
                    value={formData.plate || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.plate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="AB123CD"
                  />
                  {errors.plate && <p className="text-red-500 text-xs mt-1">{errors.plate}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Percorso *
                </label>
                <input
                  type="text"
                  name="route"
                  value={formData.route || ''}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.route ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Percorso A-B"
                />
                {errors.route && <p className="text-red-500 text-xs mt-1">{errors.route}</p>}
              </div>

              {/* Informazioni Aggiuntive */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">Informazioni Aggiuntive</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scadenza Assicurazione
                    </label>
                    <input
                      type="date"
                      name="insuranceExpiry"
                      value={formData.insuranceExpiry || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ultima Manutenzione
                    </label>
                    <input
                      type="date"
                      name="maintenanceDate"
                      value={formData.maintenanceDate || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Informazioni Base Zona */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Zona *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="es. Centro"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distanza *
                  </label>
                  <input
                    type="text"
                    name="distance"
                    value={formData.distance || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                      errors.distance ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0-5km"
                  />
                  {errors.distance && <p className="text-red-500 text-xs mt-1">{errors.distance}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tariffa Mensile (€) *
                  </label>
                  <input
                    type="number"
                    name="monthlyFee"
                    value={formData.monthlyFee || ''}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                      errors.monthlyFee ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="30"
                  />
                  {errors.monthlyFee && <p className="text-red-500 text-xs mt-1">{errors.monthlyFee}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Colore Identificativo
                  </label>
                  <select
                    name="color"
                    value={formData.color || 'blue'}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="green">Verde</option>
                    <option value="blue">Blu</option>
                    <option value="orange">Arancione</option>
                    <option value="red">Rosso</option>
                    <option value="purple">Viola</option>
                    <option value="yellow">Giallo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione
                </label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Descrizione opzionale della zona geografica..."
                />
              </div>

              {/* Anteprima Colore */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">Anteprima</h3>
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                  <div className={`w-4 h-4 rounded-full bg-${formData.color || 'blue'}-500`}></div>
                  <div>
                    <div className="font-medium">Zona {formData.name || 'Nome'}</div>
                    <div className="text-sm text-gray-600">{formData.distance || 'Distanza'}</div>
                    <div className="text-sm text-green-600">€{formData.monthlyFee || '0'}/mese</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 text-white rounded-lg ${
              type === 'bus' 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isEditing ? 'Salva Modifiche' : 'Crea'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransportModal;