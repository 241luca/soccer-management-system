// components/dashboard/DashboardView.jsx
import React from 'react';
import { AlertTriangle, Calendar, Bot } from 'lucide-react';
import StatsCards from './StatsCards';
import TeamOverview from './TeamOverview';
import StatusBadge from '../common/StatusBadge';
import ExportButton from '../export/ExportButton';

const DashboardView = ({ data, stats, setCurrentView, setSelectedTeam, setShowAIAssistant }) => {
  return (
    <div className="space-y-6">
      {/* Header Dashboard */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">⚽ Società Calcio Femminile</h1>
        <p className="text-blue-100">Dashboard di gestione completa - Versione 2.2 Enterprise</p>
        <div className="mt-4 flex gap-2 flex-wrap">
          <button 
            onClick={() => setShowAIAssistant(true)}
            className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 flex items-center transition-all"
          >
            <Bot className="h-4 w-4 mr-2" />
            AI Assistant
          </button>
          <div className="ml-2">
            <ExportButton 
              data={data}
              stats={stats}
              dataType="all"
              buttonText="Esporta Report"
              variant="outline"
              size="normal"
            />
          </div>
          <span className="bg-green-500/20 text-green-100 px-3 py-1 rounded-full text-sm">
            ✅ {stats.totalAthletes} Atlete Attive
          </span>
          {stats.upcomingMatches > 0 && (
            <span className="bg-orange-500/20 text-orange-100 px-3 py-1 rounded-full text-sm">
              ⚽ {stats.upcomingMatches} Partite in Programma
            </span>
          )}
          {stats.ageViolations > 0 && (
            <span className="bg-red-500/20 text-red-100 px-3 py-1 rounded-full text-sm">
              ⚠️ {stats.ageViolations} Anomalie Età
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Alert per gestione categorie */}
      {stats.ageViolations > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Attenzione: Anomalie nell'età delle categorie
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Ci sono {stats.ageViolations} atlete che non rispettano i limiti di età per la loro categoria:</p>
                <ul className="list-disc list-inside mt-1">
                  {data.athletes.filter(a => !a.isAgeValid).slice(0, 3).map(athlete => (
                    <li key={athlete.id}>
                      {athlete.name} ({athlete.age} anni) in {athlete.teamName}
                      {athlete.suggestedTeam && ` → Suggeriamo: ${athlete.suggestedTeam}`}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <button 
                  onClick={() => setCurrentView('athletes')}
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                >
                  Gestisci Trasferimenti
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prossime partite */}
      {stats.upcomingMatches > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-green-500" />
            Prossime Partite ({stats.upcomingMatches})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.matches?.filter(m => m.status === 'scheduled').slice(0, 6).map(match => (
              <div key={match.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-sm">{match.teamName}</h3>
                    <p className="text-gray-600 text-xs">{match.competition}</p>
                  </div>
                  <StatusBadge status={match.venue === 'Casa' ? 'valid' : 'warning'}>
                    {match.venue}
                  </StatusBadge>
                </div>
                <p className="text-sm font-medium">vs {match.opponent}</p>
                <p className="text-xs text-gray-500">
                  {new Date(match.date).toLocaleDateString('it-IT')} • {match.time}
                </p>
                <button 
                  onClick={() => setCurrentView('matches')}
                  className="mt-2 w-full bg-green-500 text-white py-1 px-3 rounded text-xs hover:bg-green-600 transition-colors"
                >
                  Prepara Distinta
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Overview */}
      <TeamOverview 
        data={data}
        setSelectedTeam={setSelectedTeam}
        setCurrentView={setCurrentView}
      />
    </div>
  );
};

export default DashboardView;