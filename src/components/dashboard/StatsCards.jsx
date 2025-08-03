// components/dashboard/StatsCards.jsx
import React from 'react';
import { 
  Users, 
  AlertTriangle, 
  DollarSign, 
  Calendar,
  Trophy,
  Bus
} from 'lucide-react';

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Totale Atlete',
      value: stats.totalAthletes,
      icon: Users,
      color: 'blue',
      trend: '↗ +5% questo mese',
      trendColor: 'green'
    },
    {
      title: 'Documenti in Scadenza',
      value: stats.expiringDocuments,
      icon: AlertTriangle,
      color: 'orange',
      trend: 'Richiede attenzione',
      trendColor: 'orange'
    },
    {
      title: 'Anomalie Età',
      value: stats.ageViolations,
      icon: Trophy,
      color: 'purple',
      trend: `${stats.athletesNeedingPromotion} promozioni`,
      trendColor: 'purple'
    },
    {
      title: 'Prossime Partite',
      value: stats.upcomingMatches,
      icon: Calendar,
      color: 'green',
      trend: 'Da programmare',
      trendColor: 'green'
    },
    {
      title: 'Pagamenti Pendenti',
      value: stats.pendingPayments,
      icon: DollarSign,
      color: 'red',
      trend: 'Da riscuotere',
      trendColor: 'red'
    },
    {
      title: 'Utenti Pulmino',
      value: stats.busUsers,
      icon: Bus,
      color: 'indigo',
      trend: `${Math.round(stats.busUsers/stats.totalAthletes*100)}% del totale`,
      trendColor: 'indigo'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'border-blue-500 text-blue-500',
      orange: 'border-orange-500 text-orange-500',
      purple: 'border-purple-500 text-purple-500',
      green: 'border-green-500 text-green-500',
      red: 'border-red-500 text-red-500',
      indigo: 'border-indigo-500 text-indigo-500'
    };
    return colors[color];
  };

  const getTrendColor = (color) => {
    const colors = {
      green: 'text-green-600',
      orange: 'text-orange-600',
      purple: 'text-purple-600',
      red: 'text-red-600',
      indigo: 'text-indigo-600'
    };
    return colors[color];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
      {cards.map((card, index) => (
        <div 
          key={index}
          className={`bg-white p-6 rounded-lg shadow-lg border-l-4 hover:shadow-xl transition-shadow ${getColorClasses(card.color)}`}
        >
          <div className="flex items-center">
            <card.icon className={`h-8 w-8 ${getColorClasses(card.color)}`} />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className={`text-xs ${getTrendColor(card.trendColor)}`}>
                {card.trend}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;