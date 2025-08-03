// components/matches/CalendarView.jsx
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Trophy } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const CalendarView = ({ matches, selectedMonth, setSelectedMonth, onMatchClick }) => {
  // Funzioni per navigazione mese
  const previousMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setSelectedMonth(new Date());
  };

  // Genera giorni del calendario
  const calendarDays = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    
    // Primo giorno del mese
    const firstDay = new Date(year, month, 1);
    // Ultimo giorno del mese
    const lastDay = new Date(year, month + 1, 0);
    
    // Primo lunedì da mostrare (settimana europea inizia da lunedì)
    const startCalendar = new Date(firstDay);
    const dayOfWeek = firstDay.getDay(); // 0 = domenica, 1 = lunedì
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startCalendar.setDate(firstDay.getDate() - daysToSubtract);
    
    // Ultimo giorno da mostrare (6 settimane complete)
    const endCalendar = new Date(startCalendar);
    endCalendar.setDate(startCalendar.getDate() + 41); // 6 settimane * 7 giorni - 1
    
    const days = [];
    const currentDate = new Date(startCalendar);
    
    while (currentDate <= endCalendar) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }, [selectedMonth]);

  // Raggruppa partite per data
  const matchesByDate = useMemo(() => {
    const grouped = {};
    matches.forEach(match => {
      const dateKey = new Date(match.date).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(match);
    });
    return grouped;
  }, [matches]);

  const getMatchesForDate = (date) => {
    const dateKey = date.toISOString().split('T')[0];
    return matchesByDate[dateKey] || [];
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === selectedMonth.getMonth() && 
           date.getFullYear() === selectedMonth.getFullYear();
  };

  const getMatchStatus = (match) => {
    if (match.status === 'completed') return 'completed';
    if (match.status === 'cancelled') return 'critical';
    
    const matchDate = new Date(match.date);
    const today = new Date();
    const diffDays = Math.ceil((matchDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'completed';
    if (diffDays <= 7) return 'warning';
    return 'scheduled';
  };

  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  const dayNames = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  return (
    <div className="p-6">
      {/* Header del calendario */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
          >
            Oggi
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Intestazioni giorni della settimana */}
      <div className="grid grid-cols-7 gap-px mb-2">
        {dayNames.map(day => (
          <div key={day} className="bg-gray-100 p-3 text-center text-sm font-medium text-gray-700">
            {day}
          </div>
        ))}
      </div>

      {/* Griglia calendario */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {calendarDays.map((date, index) => {
          const dayMatches = getMatchesForDate(date);
          const isCurrentDay = isToday(date);
          const isThisMonth = isCurrentMonth(date);
          
          return (
            <div
              key={index}
              className={`bg-white p-2 min-h-[120px] transition-colors ${
                isThisMonth ? 'text-gray-900' : 'text-gray-400'
              } ${isCurrentDay ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
            >
              {/* Numero del giorno */}
              <div className={`text-sm font-medium mb-2 ${
                isCurrentDay ? 'text-blue-600' : ''
              }`}>
                {date.getDate()}
              </div>

              {/* Partite del giorno */}
              <div className="space-y-1">
                {dayMatches.slice(0, 2).map((match) => (
                  <div
                    key={match.id}
                    onClick={() => onMatchClick(match)}
                    className="cursor-pointer group"
                  >
                    <div className={`text-xs p-1.5 rounded text-white text-center group-hover:shadow-md transition-shadow ${
                      getMatchStatus(match) === 'completed' ? 'bg-gray-600' :
                      getMatchStatus(match) === 'warning' ? 'bg-orange-500' :
                      getMatchStatus(match) === 'critical' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}>
                      <div className="font-medium truncate" title={`${match.teamName} vs ${match.opponent}`}>
                        vs {match.opponent}
                      </div>
                      <div className="text-xs opacity-90">
                        {match.time} • {match.venue === 'Casa' ? 'C' : 'T'}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Indicatore partite aggiuntive */}
                {dayMatches.length > 2 && (
                  <div className="text-xs text-center text-gray-500 font-medium">
                    +{dayMatches.length - 2} altre
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Programmate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded"></div>
          <span>Prossime (7 giorni)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-600 rounded"></div>
          <span>Giocate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Rimandate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-blue-500 rounded"></div>
          <span>Oggi</span>
        </div>
      </div>

      {/* Vista partite del mese selezionato */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">
          Partite di {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
        </h3>
        
        {matches.filter(match => {
          const matchDate = new Date(match.date);
          return matchDate.getMonth() === selectedMonth.getMonth() && 
                 matchDate.getFullYear() === selectedMonth.getFullYear();
        }).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Nessuna partita programmata per questo mese</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches
              .filter(match => {
                const matchDate = new Date(match.date);
                return matchDate.getMonth() === selectedMonth.getMonth() && 
                       matchDate.getFullYear() === selectedMonth.getFullYear();
              })
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map((match) => (
                <div
                  key={match.id}
                  onClick={() => onMatchClick(match)}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-sm">
                      {match.teamName} vs {match.opponent}
                    </h4>
                    <StatusBadge status={getMatchStatus(match)} size="sm">
                      {match.status === 'completed' ? 'Giocata' : 
                       match.status === 'cancelled' ? 'Rimandata' : 'Programmata'}
                    </StatusBadge>
                  </div>
                  
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {new Date(match.date).toLocaleDateString('it-IT', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {match.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {match.venue}
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-3 w-3" />
                      {match.competition}
                    </div>
                  </div>
                  
                  {match.status === 'completed' && match.homeGoals !== null && match.awayGoals !== null && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-sm font-semibold text-center">
                        Risultato: {match.venue === 'Casa' ? 
                          `${match.homeGoals} - ${match.awayGoals}` : 
                          `${match.awayGoals} - ${match.homeGoals}`
                        }
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;