// components/payments/PaymentsList.jsx
import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, Eye, Edit, CreditCard, Calendar, User, Building } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const PaymentsList = ({ 
  payments, 
  teams, 
  filterType, 
  setFilterType, 
  filterStatus, 
  setFilterStatus, 
  filterTeam, 
  setFilterTeam, 
  searchTerm, 
  setSearchTerm, 
  onEditPayment 
}) => {
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedPayments, setSelectedPayments] = useState([]);

  // Ordinamento
  const sortedPayments = useMemo(() => {
    const sorted = [...payments].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Gestione ordinamento per date
      if (sortBy === 'dueDate' || sortBy === 'paidDate') {
        aValue = aValue ? new Date(aValue) : new Date('1900-01-01');
        bValue = bValue ? new Date(bValue) : new Date('1900-01-01');
      }
      
      // Gestione ordinamento per stringhe
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [payments, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectPayment = (paymentId) => {
    setSelectedPayments(prev => {
      if (prev.includes(paymentId)) {
        return prev.filter(id => id !== paymentId);
      } else {
        return [...prev, paymentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedPayments.length === payments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(payments.map(p => `${p.athleteId}-${p.id}`));
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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

  const getStatusBadgeType = (status) => {
    switch(status) {
      case 'paid': return 'valid';
      case 'pending': return 'warning';
      case 'overdue': return 'critical';
      case 'partial': return 'pending';
      default: return 'pending';
    }
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
      bank_transfer: 'Bonifico',
      cash: 'Contanti',
      card: 'Carta',
      check: 'Assegno'
    };
    return labels[method] || method;
  };

  const SortableHeader = ({ field, children }) => (
    <th 
      className="py-3 px-4 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        <ArrowUpDown className="h-4 w-4 text-gray-400" />
      </div>
    </th>
  );

  return (
    <div className="space-y-6">
      {/* Filtri e Ricerca */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Ricerca */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca per atleta o descrizione..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro Tipo */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tutti i tipi</option>
            <option value="membership">Quote Società</option>
            <option value="transport">Trasporto</option>
            <option value="equipment">Equipaggiamento</option>
            <option value="extra">Extra</option>
          </select>

          {/* Filtro Stato */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tutti gli stati</option>
            <option value="paid">Pagati</option>
            <option value="pending">In Attesa</option>
            <option value="overdue">Scaduti</option>
            <option value="partial">Parziali</option>
          </select>

          {/* Filtro Squadra */}
          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tutte le squadre</option>
            {teams.map(team => (
              <option key={team.id} value={team.id.toString()}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        {/* Azioni Bulk */}
        {selectedPayments.length > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-sm text-blue-700 font-medium">
              {selectedPayments.length} pagamenti selezionati
            </span>
            <button className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors">
              Sollecito Multiplo
            </button>
            <button className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition-colors">
              Segna come Pagati
            </button>
            <button className="px-3 py-1 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors">
              Export Selezionati
            </button>
          </div>
        )}
      </div>

      {/* Statistiche Filtrate */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Totali</p>
              <p className="text-lg font-bold">{payments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Importo</p>
              <p className="text-lg font-bold">
                €{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">In Scadenza</p>
              <p className="text-lg font-bold">
                {payments.filter(p => {
                  const daysTodue = Math.ceil((new Date(p.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                  return p.status !== 'paid' && daysTodue <= 7;
                }).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Atlete Coinvolte</p>
              <p className="text-lg font-bold">
                {new Set(payments.map(p => p.athleteId)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabella Pagamenti */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedPayments.length === payments.length && payments.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <SortableHeader field="athleteName">Atleta</SortableHeader>
                <SortableHeader field="teamName">Squadra</SortableHeader>
                <SortableHeader field="type">Tipo</SortableHeader>
                <SortableHeader field="description">Descrizione</SortableHeader>
                <SortableHeader field="amount">Importo</SortableHeader>
                <SortableHeader field="dueDate">Scadenza</SortableHeader>
                <SortableHeader field="status">Stato</SortableHeader>
                <SortableHeader field="method">Metodo</SortableHeader>
                <th className="py-3 px-4 text-left font-medium text-gray-700">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedPayments.map((payment) => {
                const paymentKey = `${payment.athleteId}-${payment.id}`;
                const isSelected = selectedPayments.includes(paymentKey);
                const daysTodue = Math.ceil((new Date(payment.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                
                return (
                  <tr 
                    key={paymentKey} 
                    className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectPayment(paymentKey)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{payment.athleteName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">{payment.teamName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getTypeLabel(payment.type)}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="text-sm text-gray-900 truncate" title={payment.description}>
                        {payment.description}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">€{payment.amount}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900">{formatDate(payment.dueDate)}</div>
                      {payment.status !== 'paid' && (
                        <div className={`text-xs ${
                          daysTodue < 0 ? 'text-red-600' : 
                          daysTodue <= 7 ? 'text-orange-600' : 
                          'text-gray-500'
                        }`}>
                          {daysTodue < 0 ? `Scaduto da ${Math.abs(daysTodue)} giorni` : 
                           daysTodue === 0 ? 'Scade oggi' :
                           `${daysTodue} giorni rimanenti`}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={getStatusBadgeType(payment.status)} size="sm">
                        {getStatusLabel(payment.status)}
                      </StatusBadge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {payment.method ? getMethodLabel(payment.method) : '-'}
                      </span>
                      {payment.receiptNumber && (
                        <div className="text-xs text-gray-400">
                          {payment.receiptNumber}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEditPayment(payment)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                          title="Modifica pagamento"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                          title="Visualizza dettagli"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {sortedPayments.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Nessun pagamento trovato</p>
              <p className="text-sm">Prova a modificare i filtri di ricerca</p>
            </div>
          )}
        </div>
      </div>

      {/* Paginazione (da implementare se necessario) */}
      {sortedPayments.length > 50 && (
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-gray-700">
            Mostrando {Math.min(50, sortedPayments.length)} di {sortedPayments.length} pagamenti
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
              Precedente
            </button>
            <span className="px-3 py-1 text-sm bg-blue-500 text-white rounded">1</span>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
              Successivo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsList;