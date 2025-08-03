// components/matches/MatchesView.jsx - STEP 3: Con MatchModal
import React, { useState, useMemo } from 'react';
import { Calendar, List, Trophy, Plus } from 'lucide-react';
import CalendarView from './CalendarView';
import MatchModal from './MatchModal';

const MatchesView = ({ data, stats, selectedTeam, setCurrentView }) => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showNewMatchModal, setShowNewMatchModal] = useState(false);

  console.log('MatchesView rendering with data:', data);
  
  const filteredMatches = data?.matches || [];

  // Statistiche rapide
  const matchStats = useMemo(() => {
    const total = filteredMatches.length;
    const scheduled = filteredMatches.filter(m => m.status === 'scheduled').length;
    const completed = filteredMatches.filter(m => m.status === 'completed').length;
    const home = filteredMatches.filter(m => m.venue === 'Casa').length;
    
    return { total, scheduled, completed, home };
  }, [filteredMatches]);

  const handleMatchClick = (match) => {
    setSelectedMatch(match);
    setShowMatchModal(true);
  };

  const handleNewMatch = () => {
    setSelectedMatch(null);
    setShowNewMatchModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6 text-blue-500" />
              Gestione Partite
            </h1>
            <p className="text-gray-600 mt-1">Calendario, distinte e risultati</p>
          </div>
          <button 
            onClick={handleNewMatch}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuova Partita
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{matchStats.total}</div>
            <div className="text-sm text-gray-600">Totale Partite</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{matchStats.scheduled}</div>
            <div className="text-sm text-gray-600">Programmate</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{matchStats.completed}</div>
            <div className="text-sm text-gray-600">Giocate</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{matchStats.home}</div>
            <div className="text-sm text-gray-600">In Casa</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'calendar'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendario
              </div>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Lista
              </div>
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'results'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Risultati
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-lg">
        {activeTab === 'calendar' && (
          <CalendarView 
            matches={filteredMatches}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            onMatchClick={handleMatchClick}
          />
        )}

        {activeTab === 'list' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Lista Partite</h3>
            <div className="space-y-4">
              {filteredMatches.slice(0, 10).map((match) => (
                <div 
                  key={match.id} 
                  onClick={() => handleMatchClick(match)}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{match.teamName} vs {match.opponent}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(match.date).toLocaleDateString('it-IT')} • {match.time} • {match.venue}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{match.competition}</p>
                    </div>
                    <div className="text-right">
                      {match.status === 'completed' && match.homeGoals !== null && match.awayGoals !== null && (
                        <div className="text-lg font-bold">
                          {match.venue === 'Casa' ? 
                            `${match.homeGoals} - ${match.awayGoals}` : 
                            `${match.awayGoals} - ${match.homeGoals}`
                          }
                        </div>
                      )}
                      <div className={`text-xs px-2 py-1 rounded ${
                        match.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                        match.status === 'scheduled' ? 'bg-blue-100 text-blue-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {match.status === 'completed' ? 'Giocata' :
                         match.status === 'scheduled' ? 'Programmata' : 'Rimandata'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Risultati</h3>
            <div className="space-y-4">
              {filteredMatches
                .filter(match => match.status === 'completed')
                .slice(0, 5)
                .map((match) => (
                  <div 
                    key={match.id}
                    onClick={() => handleMatchClick(match)}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{match.teamName} vs {match.opponent}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(match.date).toLocaleDateString('it-IT')} • {match.venue}
                        </p>
                      </div>
                      {match.homeGoals !== null && match.awayGoals !== null && (
                        <div className="text-2xl font-bold">
                          {match.venue === 'Casa' ? 
                            `${match.homeGoals} - ${match.awayGoals}` : 
                            `${match.awayGoals} - ${match.homeGoals}`
                          }
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              
              {filteredMatches.filter(match => match.status === 'completed').length === 0 && (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun risultato disponibile</h3>
                  <p className="text-gray-500">I risultati appariranno qui dopo aver giocato le partite.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Dettaglio Partita */}
      {showMatchModal && selectedMatch && (
        <MatchModal
          match={selectedMatch}
          data={data}
          onClose={() => {
            setShowMatchModal(false);
            setSelectedMatch(null);
          }}
          onSave={(updatedMatch) => {
            console.log('Match updated:', updatedMatch);
            setShowMatchModal(false);
            setSelectedMatch(null);
          }}
        />
      )}

      {/* Modal Nuova Partita */}
      {showNewMatchModal && (
        <MatchModal
          match={null}
          data={data}
          onClose={() => setShowNewMatchModal(false)}
          onSave={(newMatch) => {
            console.log('New match created:', newMatch);
            setShowNewMatchModal(false);
          }}
        />
      )}
    </div>
  );
};

export default MatchesView;