// components/payments/PaymentsDashboard.jsx
import React, { useMemo } from 'react';
import { BarChart3, PieChart, Calendar, AlertTriangle, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const PaymentsDashboard = ({ payments, stats, upcomingPayments, teams, onEditPayment }) => {
  
  // Analisi per squadra
  const teamAnalysis = useMemo(() => {
    const analysis = {};
    
    teams.forEach(team => {
      const teamPayments = payments.filter(p => p.teamId === team.id);
      const paidCount = teamPayments.filter(p => p.status === 'paid').length;
      const totalAmount = teamPayments.reduce((sum, p) => sum + p.amount, 0);
      const paidAmount = teamPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
      
      analysis[team.id] = {
        name: team.name,
        totalPayments: teamPayments.length,
        paidPayments: paidCount,
        pendingPayments: teamPayments.filter(p => p.status === 'pending').length,
        overduePayments: teamPayments.filter(p => p.status === 'overdue').length,
        totalAmount,
        paidAmount,
        pendingAmount: totalAmount - paidAmount,
        paymentRate: teamPayments.length > 0 ? Math.round((paidCount / teamPayments.length) * 100) : 0
      };
    });
    
    return analysis;
  }, [payments, teams]);

  // Analisi per tipo pagamento
  const typeAnalysis = useMemo(() => {
    const types = ['membership', 'transport', 'equipment', 'extra'];
    const analysis = {};
    
    types.forEach(type => {
      const typePayments = payments.filter(p => p.type === type);
      const paidCount = typePayments.filter(p => p.status === 'paid').length;
      const totalAmount = typePayments.reduce((sum, p) => sum + p.amount, 0);
      const paidAmount = typePayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
      
      analysis[type] = {
        label: getTypeLabel(type),
        totalPayments: typePayments.length,
        paidPayments: paidCount,
        totalAmount,
        paidAmount,
        paymentRate: typePayments.length > 0 ? Math.round((paidCount / typePayments.length) * 100) : 0
      };
    });
    
    return analysis;
  }, [payments]);

  // Trend mensile (simulato - in produzione utilizzerebbe date reali)
  const monthlyTrend = useMemo(() => {
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago'];
    return months.map(month => ({
      month,
      amount: Math.floor(Math.random() * 5000) + 2000,
      payments: Math.floor(Math.random() * 30) + 15
    }));
  }, []);

  function getTypeLabel(type) {
    const labels = {
      membership: 'Quote Società',
      transport: 'Trasporto',
      equipment: 'Equipaggiamento', 
      extra: 'Extra'
    };
    return labels[type] || type;
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  return (
    <div className="space-y-6">
      {/* Panoramica Generale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Incassi Mensili */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Trend Incassi Mensili
            </h3>
            <span className="text-sm text-gray-500">2025</span>
          </div>
          <div className="space-y-3">
            {monthlyTrend.slice(-6).map((item, index) => (
              <div key={item.month} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.month}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(item.amount / 5000) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">€{item.amount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stato Pagamenti per Tipo */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-green-500" />
            Pagamenti per Tipologia
          </h3>
          <div className="space-y-4">
            {Object.entries(typeAnalysis).map(([type, data]) => (
              <div key={type} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{data.label}</p>
                  <p className="text-sm text-gray-500">
                    {data.paidPayments}/{data.totalPayments} pagamenti
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">€{data.paidAmount.toLocaleString()}</p>
                  <StatusBadge 
                    status={data.paymentRate >= 80 ? "valid" : data.paymentRate >= 60 ? "warning" : "critical"} 
                    size="sm"
                  >
                    {data.paymentRate}%
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analisi per Squadra */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          Performance Incassi per Squadra
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Squadra</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Pagamenti</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Pagati</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">In Attesa</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Scaduti</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Incassato</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Tasso</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(teamAnalysis).map((team) => (
                <tr key={team.name} className="border-b border-gray-100 hover:bg-white">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{team.name}</div>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600">
                    {team.totalPayments}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      {team.paidPayments}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-orange-600">
                      <Clock className="h-4 w-4" />
                      {team.pendingPayments}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      {team.overduePayments}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    €{team.paidAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge 
                      status={team.paymentRate >= 80 ? "valid" : team.paymentRate >= 60 ? "warning" : "critical"}
                      size="sm"
                    >
                      {team.paymentRate}%
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scadenze Imminenti */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-red-500" />
            Scadenze Prossimi 30 Giorni
          </h3>
          <StatusBadge status={upcomingPayments.length > 5 ? "warning" : "valid"} size="sm">
            {upcomingPayments.length} scadenze
          </StatusBadge>
        </div>
        
        {upcomingPayments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>Nessuna scadenza nei prossimi 30 giorni</p>
            <p className="text-sm">Tutti i pagamenti sono in regola!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {upcomingPayments.slice(0, 10).map((payment) => {
              const daysTodue = Math.ceil((new Date(payment.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={`${payment.athleteId}-${payment.id}`} className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      daysTodue <= 3 ? 'bg-red-500' : daysTodue <= 7 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{payment.athleteName}</p>
                      <p className="text-sm text-gray-500">{payment.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">€{payment.amount}</p>
                    <p className="text-sm text-gray-500">
                      {daysTodue <= 0 ? 'Scaduto' : `${daysTodue} giorni`}
                    </p>
                  </div>
                  <button
                    onClick={() => onEditPayment(payment)}
                    className="ml-3 px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                  >
                    Gestisci
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Report Rapidi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-green-700">Media Incasso Mensile</p>
              <p className="text-xl font-bold text-green-900">
                €{Math.round(stats.paidAmount / 8).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-xs text-green-600">Basato sugli ultimi 8 mesi</p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">Tasso Riscossione</p>
              <p className="text-xl font-bold text-blue-900">{stats.paymentRate}%</p>
            </div>
          </div>
          <p className="text-xs text-blue-600">Target societario: 85%</p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-purple-700">Previsione Annuale</p>
              <p className="text-xl font-bold text-purple-900">
                €{Math.round(stats.paidAmount * 1.5).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-xs text-purple-600">Proiezione basata sui trend</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentsDashboard;