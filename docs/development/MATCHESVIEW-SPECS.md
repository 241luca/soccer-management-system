# 🎯 SPECIFICHE TECNICHE MATCHESVIEW

## 📊 STRUTTURA DATI MATCHES

### Match Object Structure:
```javascript
{
  id: number,
  teamName: string,           // "Under 19", "Prima Squadra"
  opponent: string,           // "ASD Rimini"
  date: Date,                 // "2024-09-15T15:00:00Z"
  venue: string,              // "home" | "away"
  status: string,             // "scheduled" | "completed" | "cancelled" 
  competition: string,        // "Campionato", "Coppa", "Amichevole"
  homeTeam: string,
  awayTeam: string,
  result: {                   // null se non giocata
    homeScore: number,
    awayScore: number,
    scorers: [{ name, minute }],
    cards: [{ name, type, minute }]
  },
  lineup: {                   // null se non impostata
    formation: string,        // "4-4-2", "3-5-2"
    starters: [athlete_id],   // Array di 11 IDs
    bench: [athlete_id],      // Array di 7 IDs
    captain: athlete_id
  },
  stats: {
    possession: number,       // 0-100
    shots: number,
    shotsOnTarget: number,
    corners: number,
    fouls: number
  }
}
```

## 🎨 DESIGN COMPONENTS

### MatchesView Layout:
```javascript
<div className="space-y-6">
  {/* Header con azioni */}
  <Header />
  
  {/* Tab Navigation */}
  <TabNavigation tabs={['calendario', 'lista', 'statistiche']} />
  
  {/* Content Area */}
  <div className="bg-white rounded-lg shadow-lg">
    {activeTab === 'calendario' && <CalendarView />}
    {activeTab === 'lista' && <MatchesList />}
    {activeTab === 'statistiche' && <StatsView />}
  </div>
  
  {/* Modals */}
  {showMatchModal && <MatchModal />}
  {showLineupModal && <LineupModal />}
</div>
```

### Calendar Grid:
```javascript
// Grid 7x6 per mese
<div className="grid grid-cols-7 gap-1">
  {/* Header giorni settimana */}
  {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => 
    <div className="p-2 text-center font-medium">{day}</div>
  )}
  
  {/* Celle giorni */}
  {calendarDays.map(day => (
    <div className="aspect-square p-1 border">
      <div className="text-sm">{day.number}</div>
      {day.matches.map(match => 
        <div className="text-xs bg-blue-100 rounded px-1 mb-1">
          {match.opponent}
        </div>
      )}
    </div>
  ))}
</div>
```

### Match Card:
```javascript
<div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
  <div className="flex justify-between items-start mb-2">
    <div>
      <h3 className="font-semibold">{match.teamName} vs {match.opponent}</h3>
      <p className="text-sm text-gray-600">{formatDate(match.date)}</p>
    </div>
    <StatusBadge status={match.status}>
      {getStatusText(match.status)}
    </StatusBadge>
  </div>
  
  <div className="flex justify-between text-sm">
    <span>{match.venue === 'home' ? '🏠 Casa' : '✈️ Trasferta'}</span>
    <span>{match.competition}</span>
  </div>
  
  {match.result && (
    <div className="mt-2 text-center font-bold">
      {match.result.homeScore} - {match.result.awayScore}
    </div>
  )}
</div>
```

## ⚽ LINEUP FORMATION

### Formation Layouts:
```javascript
const formations = {
  '4-4-2': {
    positions: [
      { id: 'GK', x: 50, y: 10, label: 'P' },
      { id: 'RB', x: 80, y: 25, label: 'TD' },
      { id: 'CB1', x: 60, y: 25, label: 'DC' },
      { id: 'CB2', x: 40, y: 25, label: 'DC' },
      { id: 'LB', x: 20, y: 25, label: 'TS' },
      { id: 'RM', x: 80, y: 50, label: 'ED' },
      { id: 'CM1', x: 60, y: 50, label: 'CC' },
      { id: 'CM2', x: 40, y: 50, label: 'CC' },
      { id: 'LM', x: 20, y: 50, label: 'ES' },
      { id: 'ST1', x: 60, y: 75, label: 'A' },
      { id: 'ST2', x: 40, y: 75, label: 'A' }
    ]
  },
  // ... altre formazioni
};
```

### Football Field:
```javascript
<div className="relative bg-green-500 rounded-lg" style={{aspectRatio: '2/3'}}>
  {/* Campo da calcio SVG */}
  <svg className="absolute inset-0 w-full h-full">
    {/* Linee campo */}
    <rect x="10%" y="5%" width="80%" height="90%" 
          fill="none" stroke="white" strokeWidth="2"/>
    <circle cx="50%" cy="50%" r="10%" 
            fill="none" stroke="white" strokeWidth="2"/>
    {/* Area di rigore */}
    <rect x="25%" y="5%" width="50%" height="15%" 
          fill="none" stroke="white" strokeWidth="2"/>
    <rect x="25%" y="80%" width="50%" height="15%" 
          fill="none" stroke="white" strokeWidth="2"/>
  </svg>
  
  {/* Posizioni giocatori */}
  {formation.positions.map(pos => (
    <div 
      key={pos.id}
      className="absolute w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer"
      style={{left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)'}}
    >
      {pos.label}
    </div>
  ))}
</div>
```

## 🔧 UTILITIES FUNCTIONS

### Date Helpers:
```javascript
const formatMatchDate = (date) => {
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'short',
    day: 'numeric', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

const getWeekMatches = (matches, weekStart) => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  
  return matches.filter(match => {
    const matchDate = new Date(match.date);
    return matchDate >= weekStart && matchDate < weekEnd;
  });
};
```

### Status Helpers:
```javascript
const getMatchStatus = (match) => {
  const now = new Date();
  const matchDate = new Date(match.date);
  
  if (match.status === 'cancelled') return 'cancelled';
  if (match.result) return 'completed';
  if (matchDate < now) return 'completed';
  return 'scheduled';
};

const getStatusColor = (status) => {
  const colors = {
    scheduled: 'blue',
    completed: 'green', 
    cancelled: 'red'
  };
  return colors[status] || 'gray';
};
```

## 📱 RESPONSIVE DESIGN

### Breakpoints:
```javascript
// Mobile: Calendario compatto, lista stack
// Tablet: Calendario medium, modal fullscreen
// Desktop: Calendario full, modal overlay

const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return { isMobile };
};
```

## 🎯 STATE MANAGEMENT

### Component State:
```javascript
const [activeTab, setActiveTab] = useState('calendario');
const [selectedMonth, setSelectedMonth] = useState(new Date());
const [selectedMatch, setSelectedMatch] = useState(null);
const [showMatchModal, setShowMatchModal] = useState(false);
const [showLineupModal, setShowLineupModal] = useState(false);
const [filters, setFilters] = useState({
  team: '',
  competition: '',
  venue: '',
  status: ''
});
```

## 🚀 PERFORMANCE OPTIMIZATIONS

### Memoization:
```javascript
const filteredMatches = useMemo(() => {
  return data.matches.filter(match => {
    return (!filters.team || match.teamName === filters.team) &&
           (!filters.competition || match.competition === filters.competition) &&
           (!filters.venue || match.venue === filters.venue) &&
           (!filters.status || match.status === filters.status);
  });
}, [data.matches, filters]);

const calendarDays = useMemo(() => {
  return generateCalendarDays(selectedMonth, filteredMatches);
}, [selectedMonth, filteredMatches]);
```

**Segui queste specifiche per un'implementazione di qualità! 🚀**