// components/payments/IncomeCenter.jsx
import React, { useState, useMemo } from 'react';
import { AlertTriangle, Clock, CheckCircle, Mail, Download, Users, Target } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const IncomeCenter = ({ payments, upcomingPayments, overduePayments, teams, onEditPayment }) => {
  const [selectedCategory, setSelectedCategory] = useState('overdue');
  const [selectedPayments, setSelectedPayments] = useState([]);

  // Categorizzazione pagamenti per priorità
  const categorizedPayments = useMemo(() => {
    const today = new Date();
    
    const critical = payments.filter(payment => {
      if (payment.status === 'paid') return false;
      const daysTodue = Math.ceil((new Date(payment.dueDate) - today) / (1000 * 60 * 60 * 24));
      return daysTodue < 0; // Scaduti
    });

    const urgent = payments.filter(payment => {
      if (payment.status === 'paid') return false;
      const daysTodue = Math.ceil((new Date(payment.dueDate) - today) / (1000 * 60 * 60 * 24));
      return daysTodue >= 0 && daysTodue <= 7; // Prossimi 7 giorni
    });

    const warning = payments.filter(payment => {
      if (payment.status === 'paid') return false;
      const daysTodue = Math.ceil((new Date(payment.dueDate) - today) / (1000 * 60 * 60 * 24));
      return daysTodue > 7 && daysTodue <= 30; // Prossimi 30 giorni
    });

    const pending = payments.filter(payment => {
      if (payment.status === 'paid') return false;
      const daysTodue = Math.ceil((new Date(payment.dueDate) - today) / (1000 * 60 * 60 * 24));
      return daysTodue > 30; // Oltre 30 giorni
    });

    return {
      overdue: critical,
      urgent: urgent,
      warning: warning,
      pending: pending
    };
  }, [payments]);

  // Selezione categoria attiva
  const activePayments = categorizedPayments[selectedCategory] || [];

  // Analisi per squadra nei pagamenti critici
  const teamAnalysis = useMemo(() => {
    const analysis = {};
    
    teams.forEach(team => {
      const teamOverduePayments = categorizedPayments.overdue.filter(p => p.teamId === team.id);
      const teamUrgentPayments = categorizedPayments.urgent.filter(p => p.teamId === team.id);
      const totalAmount = [...teamOverduePayments, ...teamUrgentPayments].reduce((sum, p) => sum + p.amount, 0);
      
      analysis[team.id] = {
        name: team.name,
        overdueCount: teamOverduePayments.length,
        urgentCount: teamUrgentPayments.length,
        totalAmount,
        athletes: new Set([...teamOverduePayments, ...teamUrgentPayments].map(p => p.athleteId)).size
      };
    });
    
    return Object.values(analysis).filter(team => team.overdueCount > 0 || team.urgentCount > 0);
  }, [categorizedPayments, teams]);

  const handleSelectPayment = (paymentKey) => {
    setSelectedPayments(prev => {
      if (prev.includes(paymentKey)) {
        return prev.filter(id => id !== paymentKey);
      } else {
        return [...prev, paymentKey];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedPayments.length === activePayments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(activePayments.map(p => `${p.athleteId}-${p.id}`));
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysOverdue = (dueDate) => {
    const days = Math.ceil((new Date() - new Date(dueDate)) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const getDaysTodue = (dueDate) => {
    return Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const categories = [
    {
      id: 'overdue',
      label: 'Scaduti',
      count: categorizedPayments.overdue.length,
      icon: AlertTriangle,
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700'
    },
    {
      id: 'urgent',
      label: 'Urgenti (7gg)',
      count: categorizedPayments.urgent.length,
      icon: Clock,
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700'
    },
    {
      id: 'warning',
      label: 'In Scadenza (30gg)',
      count: categorizedPayments.warning.length,
      icon: Target,
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700'
    },
    {
      id: 'pending',
      label: 'Futuri',
      count: categorizedPayments.pending.length,
      icon: CheckCircle,
      color: 'gray',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-700'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header con Statistiche Priorità */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {categories.map((category) => {
          const IconComponent = category.icon;
          const isActive = selectedCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                isActive 
                  ? `${category.bgColor} ${category.borderColor} ${category.textColor}` 
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-sm font-medium">{category.label}</p>
                  <p className="text-2xl font-bold">{category.count}</p>
                </div>
                <IconComponent className={`h-8 w-8 ${isActive ? '' : 'text-gray-400'}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Analisi Squadre a Rischio */}
      {teamAnalysis.length > 0 && (
        <div className="bg-red-50 rounded-lg p-6 border border-red-200">
          <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Squadre con Criticità Pagamenti
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamAnalysis.map((team) => (
              <div key={team.name} className="bg-white rounded-lg p-4 border">
                <div className="font-medium text-gray-900 mb-2">{team.name}</div>
                <div className="space-y-2">
                  {team.overdueCount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-red-600">Scaduti:</span>
                      <span className="font-medium text-red-800">{team.overdueCount}</span>
                    </div>
                  )}
                  {team.urgentCount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-orange-600">Urgenti:</span>
                      <span className="font-medium text-orange-800">{team.urgentCount}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Importo:</span>
                    <span className="font-medium">€{team.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Atlete:</span>
                    <span className="font-medium">{team.athletes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Azioni Bulk */}
      <div className="bg-white rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Azioni Rapide - {categories.find(c => c.id === selectedCategory)?.label}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedPayments.length} di {activePayments.length} selezionati
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            disabled={selectedPayments.length === 0}
          >
            <Mail className="h-4 w-4" />
            Invia Solleciti
          </button>
          
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            disabled={selectedPayments.length === 0}
          >
            <CheckCircle className="h-4 w-4" />
            Segna Pagati
          </button>
          
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            disabled={selectedPayments.length === 0}
          >
            <Download className="h-4 w-4" />
            Export Lista
          </button>
          
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            disabled={selectedPayments.length === 0}
          >
            <Users className="h-4 w-4" />
            Contatta Famiglie
          </button>
        </div>
      </div>

      {/* Lista Pagamenti Prioritari */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Lista {categories.find(c => c.id === selectedCategory)?.label}
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedPayments.length === activePayments.length && activePayments.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Seleziona tutti</span>
            </div>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {activePayments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">Nessun pagamento in questa categoria</p>
              <p className="text-sm">Ottimo lavoro! 🎉</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {activePayments.map((payment) => {
                const paymentKey = `${payment.athleteId}-${payment.id}`;
                const isSelected = selectedPayments.includes(paymentKey);
                const daysTodue = getDaysTodue(payment.dueDate);
                const daysOverdue = getDaysOverdue(payment.dueDate);
                
                return (
                  <div 
                    key={paymentKey} 
                    className={`p-4 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectPayment(paymentKey)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      
                      {/* Indicatore Priorità */}
                      <div className={`w-3 h-3 rounded-full ${
                        selectedCategory === 'overdue' ? 'bg-red-500' :
                        selectedCategory === 'urgent' ? 'bg-orange-500' :
                        selectedCategory === 'warning' ? 'bg-blue-500' : 'bg-gray-400'
                      }`}></div>
                      
                      {/* Dettagli Pagamento */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                        <div>
                          <div className="font-medium text-gray-900">{payment.athleteName}</div>
                          <div className="text-sm text-gray-500">{payment.teamName}</div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-900">{payment.description}</div>
                          <div className="text-xs text-gray-500">
                            {payment.type === 'membership' ? 'Quota Società' :
                             payment.type === 'transport' ? 'Trasporto' :
                             payment.type === 'equipment' ? 'Equipaggiamento' : 'Extra'}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="font-medium text-gray-900">€{payment.amount}</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm text-gray-900">{formatDate(payment.dueDate)}</div>
                          {selectedCategory === 'overdue' && (
                            <div className="text-xs text-red-600 font-medium">
                              Scaduto da {daysOverdue} giorni
                            </div>
                          )}
                          {selectedCategory === 'urgent' && (
                            <div className="text-xs text-orange-600 font-medium">
                              {daysTodue === 0 ? 'Scade oggi' : `${daysTodue} giorni`}
                            </div>
                          )}
                          {selectedCategory === 'warning' && (
                            <div className="text-xs text-blue-600">
                              {daysTodue} giorni rimanenti
                            </div>
                          )}
                        </div>
                        
                        <div className="text-center">
                          <StatusBadge 
                            status={selectedCategory === 'overdue' ? 'critical' : 
                                   selectedCategory === 'urgent' ? 'warning' : 'pending'} 
                            size="sm"
                          >
                            {selectedCategory === 'overdue' ? 'Scaduto' :
                             selectedCategory === 'urgent' ? 'Urgente' :
                             selectedCategory === 'warning' ? 'In scadenza' : 'Futuro'}
                          </StatusBadge>
                        </div>
                        
                        <div className="text-right">
                          <button
                            onClick={() => onEditPayment(payment)}
                            className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                          >
                            Gestisci
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Report Centro Incassi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-red-700">Importo Critico</p>
              <p className="text-xl font-bold text-red-900">
                €{categorizedPayments.overdue.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-xs text-red-600">Scaduti da recuperare urgentemente</p>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-orange-700">In Scadenza</p>
              <p className="text-xl font-bold text-orange-900">
                €{categorizedPayments.urgent.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-xs text-orange-600">Prossimi 7 giorni - azione richiesta</p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <Target className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">Tasso Recupero</p>
              <p className="text-xl font-bold text-blue-900">
                {payments.length > 0 ? Math.round((payments.filter(p => p.status === 'paid').length / payments.length) * 100) : 0}%
              </p>
            </div>
          </div>
          <p className="text-xs text-blue-600">Target societario: 95%</p>
        </div>
      </div>
    </div>
  );
};

export default IncomeCenter;