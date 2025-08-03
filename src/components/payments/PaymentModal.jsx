// components/payments/PaymentModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, CreditCard, Calendar, User, DollarSign, FileText, Receipt } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const PaymentModal = ({ payment, athletes, teams, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    athleteId: '',
    type: 'membership',
    description: '',
    amount: '',
    dueDate: '',
    status: 'pending',
    method: '',
    paidDate: '',
    receiptNumber: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inizializza form con dati esistenti o vuoti
  useEffect(() => {
    if (payment) {
      setFormData({
        athleteId: payment.athleteId || '',
        type: payment.type || 'membership',
        description: payment.description || '',
        amount: payment.amount || '',
        dueDate: payment.dueDate ? new Date(payment.dueDate).toISOString().split('T')[0] : '',
        status: payment.status || 'pending',
        method: payment.method || '',
        paidDate: payment.paidDate ? new Date(payment.paidDate).toISOString().split('T')[0] : '',
        receiptNumber: payment.receiptNumber || '',
        notes: payment.notes || ''
      });
    } else {
      // Nuovo pagamento - imposta valori di default
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 15);
      
      setFormData(prev => ({
        ...prev,
        dueDate: nextMonth.toISOString().split('T')[0],
        description: 'Quota Mensile ' + nextMonth.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
      }));
    }
  }, [payment]);

  // Aggiorna descrizione automaticamente in base al tipo
  useEffect(() => {
    if (!payment && formData.type) {
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 15);
      const monthYear = nextMonth.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
      
      const descriptions = {
        membership: `Quota Mensile ${monthYear}`,
        transport: `Trasporto ${monthYear}`,
        equipment: 'Equipaggiamento Sportivo',
        extra: 'Pagamento Aggiuntivo'
      };
      
      setFormData(prev => ({
        ...prev,
        description: descriptions[formData.type] || ''
      }));
    }
  }, [formData.type, payment]);

  // Aggiorna importo in base alla squadra dell'atleta selezionata
  useEffect(() => {
    if (!payment && formData.athleteId && formData.type === 'membership') {
      const selectedAthlete = athletes.find(a => a.id.toString() === formData.athleteId);
      if (selectedAthlete) {
        const team = teams.find(t => t.id === selectedAthlete.teamId);
        if (team) {
          const amounts = {
            'Under 15': 80,
            'Under 17': 80,
            'Under 19': 90,
            'Prima Squadra': 120,
            'Seconda Squadra': 100
          };
          setFormData(prev => ({
            ...prev,
            amount: amounts[team.name] || 100
          }));
        }
      }
    }
  }, [formData.athleteId, formData.type, athletes, teams, payment]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.athleteId) {
      newErrors.athleteId = 'Seleziona un\'atleta';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Inserisci una descrizione';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Inserisci un importo valido';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Inserisci una data di scadenza';
    }

    if (formData.status === 'paid') {
      if (!formData.paidDate) {
        newErrors.paidDate = 'Inserisci la data di pagamento';
      }
      if (!formData.method) {
        newErrors.method = 'Seleziona il metodo di pagamento';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const paymentData = {
        ...formData,
        amount: parseFloat(formData.amount),
        dueDate: new Date(formData.dueDate),
        paidDate: formData.paidDate ? new Date(formData.paidDate) : null,
        athleteId: parseInt(formData.athleteId),
        id: payment?.id || Date.now() // In produzione userebbe un ID generato dal backend
      };

      await onSave(paymentData);
    } catch (error) {
      console.error('Errore nel salvataggio del pagamento:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Rimuovi errore quando l'utente corregge il campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      membership: 'Quota Società',
      transport: 'Trasporto',
      equipment: 'Equipaggiamento',
      extra: 'Extra'
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status) => {
    const labels = {
      paid: 'Pagato',
      pending: 'In Attesa',
      overdue: 'Scaduto',
      partial: 'Parziale'
    };
    return labels[status] || status;
  };

  const getMethodLabel = (method) => {
    const labels = {
      bank_transfer: 'Bonifico Bancario',
      cash: 'Contanti',
      card: 'Carta di Credito',
      check: 'Assegno'
    };
    return labels[method] || method;
  };

  const selectedAthlete = athletes.find(a => a.id.toString() === formData.athleteId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-green-500" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {payment ? 'Modifica Pagamento' : 'Nuovo Pagamento'}
              </h2>
              {selectedAthlete && (
                <p className="text-sm text-gray-600">
                  {selectedAthlete.name} - {selectedAthlete.teamName}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Selezione Atleta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-1" />
              Atleta *
            </label>
            <select
              value={formData.athleteId}
              onChange={(e) => handleChange('athleteId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.athleteId ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={!!payment} // Non modificabile se è modifica
            >
              <option value="">Seleziona un'atleta...</option>
              {teams.map(team => (
                <optgroup key={team.id} label={team.name}>
                  {athletes
                    .filter(athlete => athlete.teamId === team.id)
                    .map(athlete => (
                      <option key={athlete.id} value={athlete.id}>
                        {athlete.name} - {athlete.position}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
            {errors.athleteId && (
              <p className="mt-1 text-sm text-red-600">{errors.athleteId}</p>
            )}
          </div>

          {/* Tipo e Descrizione */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo Pagamento *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="membership">Quota Società</option>
                <option value="transport">Trasporto</option>
                <option value="equipment">Equipaggiamento</option>
                <option value="extra">Extra</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Importo (€) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.amount ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>
          </div>

          {/* Descrizione */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Descrizione *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Descrizione del pagamento..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Data Scadenza e Stato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Data Scadenza *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.dueDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stato Pagamento
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">In Attesa</option>
                <option value="paid">Pagato</option>
                <option value="partial">Parziale</option>
                <option value="overdue">Scaduto</option>
              </select>
            </div>
          </div>

          {/* Campi aggiuntivi se pagamento è stato effettuato */}
          {formData.status === 'paid' && (
            <div className="bg-green-50 rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-medium text-green-800 mb-3">Dettagli Pagamento</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Pagamento *
                  </label>
                  <input
                    type="date"
                    value={formData.paidDate}
                    onChange={(e) => handleChange('paidDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.paidDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.paidDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.paidDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metodo Pagamento *
                  </label>
                  <select
                    value={formData.method}
                    onChange={(e) => handleChange('method', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.method ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleziona metodo...</option>
                    <option value="bank_transfer">Bonifico Bancario</option>
                    <option value="cash">Contanti</option>
                    <option value="card">Carta di Credito</option>
                    <option value="check">Assegno</option>
                  </select>
                  {errors.method && (
                    <p className="mt-1 text-sm text-red-600">{errors.method}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Receipt className="h-4 w-4 inline mr-1" />
                  Numero Ricevuta
                </label>
                <input
                  type="text"
                  value={formData.receiptNumber}
                  onChange={(e) => handleChange('receiptNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="RIC-123456"
                />
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note Aggiuntive
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Note opzionali..."
            />
          </div>

          {/* Preview */}
          {formData.athleteId && formData.amount && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Preview Pagamento</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Atleta:</span>
                  <span className="ml-2 font-medium">{selectedAthlete?.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Squadra:</span>
                  <span className="ml-2 font-medium">{selectedAthlete?.teamName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Tipo:</span>
                  <span className="ml-2 font-medium">{getTypeLabel(formData.type)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Importo:</span>
                  <span className="ml-2 font-medium">€{formData.amount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Scadenza:</span>
                  <span className="ml-2 font-medium">
                    {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString('it-IT') : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Stato:</span>
                  <StatusBadge 
                    status={formData.status === 'paid' ? 'valid' : 
                           formData.status === 'overdue' ? 'critical' : 'warning'} 
                    size="sm"
                  >
                    {getStatusLabel(formData.status)}
                  </StatusBadge>
                </div>
              </div>
            </div>
          )}

          {/* Azioni */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Salvando...' : payment ? 'Aggiorna' : 'Crea Pagamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;