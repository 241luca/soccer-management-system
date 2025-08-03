// components/payments/PaymentsView.jsx
import React, { useState, useMemo } from 'react';
import { CreditCard, DollarSign, Calendar, AlertTriangle, TrendingUp, Filter, Download, Plus } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import PaymentsDashboard from './PaymentsDashboard';
import PaymentsList from './PaymentsList';
import IncomeCenter from './IncomeCenter';
import PaymentModal from './PaymentModal';

const PaymentsView = ({ data, stats, selectedTeam, setCurrentView }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTeam, setFilterTeam] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Calcolo stati pagamenti
  const calculatePaymentStatus = (payment) => {
    const today = new Date();
    const dueDate = new Date(payment.dueDate);
    const daysTodue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    if (payment.status === 'paid') return 'valid';
    if (payment.status === 'overdue' || daysTodue < 0) return 'critical';
    if (daysTodue <= 7) return 'warning';
    return 'pending';
  };

  // Estrazione e elaborazione pagamenti
  const allPayments = useMemo(() => {
    const payments = [];
    data.athletes.forEach(athlete => {
      if (athlete.payments && athlete.payments.length > 0) {
        athlete.payments.forEach(payment => {
          payments.push({
            ...payment,
            athleteId: athlete.id,
            athleteName: athlete.name,
            teamId: athlete.teamId,
            teamName: athlete.teamName,
            displayStatus: calculatePaymentStatus(payment)
          });
        });
      }
    });
    return payments;
  }, [data.athletes]);

  // Filtri avanzati
  const filteredPayments = useMemo(() => {
    return allPayments.filter(payment => {
      const matchesType = filterType === 'all' || payment.type === filterType;
      const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
      const matchesTeam = filterTeam === 'all' || payment.teamId.toString() === filterTeam;
      const matchesSearch = !searchTerm || 
        payment.athleteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesType && matchesStatus && matchesTeam && matchesSearch;
    });
  }, [allPayments, filterType, filterStatus, filterTeam, searchTerm]);

  // Statistiche pagamenti
  const paymentStats = useMemo(() => {
    const totalPayments = allPayments.length;
    const paidPayments = allPayments.filter(p => p.status === 'paid').length;
    const pendingPayments = allPayments.filter(p => p.status === 'pending').length;
    const overduePayments = allPayments.filter(p => p.status === 'overdue').length;
    const totalAmount = allPayments.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = allPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = allPayments.filter(p => p.status !== 'paid').reduce((sum, p) => sum + p.amount, 0);

    return {
      totalPayments,
      paidPayments,
      pendingPayments,
      overduePayments,
      totalAmount,
      paidAmount,
      pendingAmount,
      paymentRate: totalPayments > 0 ? Math.round((paidPayments / totalPayments) * 100) : 0
    };
  }, [allPayments]);

  // Pagamenti in scadenza (prossimi 30 giorni)
  const upcomingPayments = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    return allPayments.filter(payment => {
      const dueDate = new Date(payment.dueDate);
      return payment.status !== 'paid' && dueDate >= today && dueDate <= thirtyDaysFromNow;
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [allPayments]);

  const handleNewPayment = () => {
    setSelectedPayment(null);
    setShowModal(true);
  };

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPayment(null);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: DollarSign },
    { id: 'payments', label: 'Lista Pagamenti', icon: CreditCard },
    { id: 'income', label: 'Centro Incassi', icon: TrendingUp }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-green-500" />
              Gestione Pagamenti
            </h1>
            <p className="text-gray-600 mt-1">Quote, incassi e report finanziari</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span className="font-medium">{paymentStats.totalPayments}</span>
                <span>pagamenti totali</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <span className="font-medium">{paymentStats.paidPayments}</span>
                <span>pagati</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-orange-600">
                <span className="font-medium">{paymentStats.pendingPayments}</span>
                <span>in attesa</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-red-600">
                <span className="font-medium">{paymentStats.overduePayments}</span>
                <span>scaduti</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleNewPayment}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nuovo Pagamento
            </button>
            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors">
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Totale Incassi</p>
              <p className="text-2xl font-bold text-gray-900">€{paymentStats.paidAmount.toLocaleString()}</p>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="mt-2">
            <StatusBadge status="valid" size="sm">
              {paymentStats.paymentRate}% pagati
            </StatusBadge>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Attesa</p>
              <p className="text-2xl font-bold text-gray-900">€{paymentStats.pendingAmount.toLocaleString()}</p>
            </div>
            <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <div className="mt-2">
            <StatusBadge status="warning" size="sm">
              {paymentStats.pendingPayments} pagamenti
            </StatusBadge>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scadenze 30gg</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingPayments.length}</p>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-2">
            <StatusBadge status={upcomingPayments.length > 5 ? "warning" : "valid"} size="sm">
              {upcomingPayments.length > 0 ? "Controllare" : "In regola"}
            </StatusBadge>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scaduti</p>
              <p className="text-2xl font-bold text-gray-900">{paymentStats.overduePayments}</p>
            </div>
            <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="mt-2">
            <StatusBadge status={paymentStats.overduePayments > 0 ? "critical" : "valid"} size="sm">
              {paymentStats.overduePayments > 0 ? "Azione richiesta" : "Tutto ok"}
            </StatusBadge>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'dashboard' && (
            <PaymentsDashboard 
              payments={allPayments}
              stats={paymentStats}
              upcomingPayments={upcomingPayments}
              teams={data.teams}
              onEditPayment={handleEditPayment}
            />
          )}
          
          {activeTab === 'payments' && (
            <PaymentsList 
              payments={filteredPayments}
              teams={data.teams}
              filterType={filterType}
              setFilterType={setFilterType}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterTeam={filterTeam}
              setFilterTeam={setFilterTeam}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onEditPayment={handleEditPayment}
            />
          )}
          
          {activeTab === 'income' && (
            <IncomeCenter 
              payments={allPayments}
              upcomingPayments={upcomingPayments}
              overduePayments={allPayments.filter(p => p.status === 'overdue')}
              teams={data.teams}
              onEditPayment={handleEditPayment}
            />
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <PaymentModal
          payment={selectedPayment}
          athletes={data.athletes}
          teams={data.teams}
          onClose={handleCloseModal}
          onSave={(paymentData) => {
            // Qui implementerei il salvataggio reale
            console.log('Saving payment:', paymentData);
            handleCloseModal();
          }}
        />
      )}
    </div>
  );
};

export default PaymentsView;