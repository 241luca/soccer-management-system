# 🗺️ COMPONENT MAP - Soccer Management System

## 📊 DEPENDENCY GRAPH

```
App.jsx (Main Router)
├── useData() ──→ demoData.js
├── Navigation ──→ stats
├── LoadingScreen (standalone)
└── DashboardView
    ├── StatsCards ──→ stats
    ├── TeamOverview ──→ data.teams, data.athletes
    └── StatusBadge (utility)
```

## 🎯 COMPONENT DETAILS

### 🏠 App.jsx (Central Hub)
**Ruolo:** Router principale e state management
**Props:** Nessuna (root component)
**State:** 
- `currentView` → routing viste
- `selectedTeam` → squadra selezionata
- `searchTerm` → ricerca globale
- `showAIAssistant` → modal AI

**Imports:**
```javascript
import { useData } from './hooks/useData'
import LoadingScreen from './components/common/LoadingScreen'
import Navigation from './components/common/Navigation'
import DashboardView from './components/dashboard/DashboardView'
```

**Viste gestite:**
- ✅ `dashboard` → DashboardView
- 🚧 `athletes` → Placeholder
- 🚧 `matches` → Placeholder
- 🚧 `documents` → Placeholder
- 🚧 `payments` → Placeholder
- 🚧 `transport` → Placeholder
- 🚧 `settings` → Placeholder

---

### 🧭 Navigation.jsx
**Ruolo:** Menu principale responsivo con badge
**Props:** `currentView`, `setCurrentView`, `stats`
**Features:**
- 7 menu items con icons (Lucide React)
- Badge dinamici con contatori
- Responsive design (desktop/mobile)
- Notifiche aggregate

**Badge Logic:**
```javascript
totalAthletes → badge numero
expiringDocuments → se > 0 mostra numero
pendingPayments → se > 0 mostra numero
busUsers → badge numero
upcomingMatches → badge numero
```

---

### 📊 DashboardView.jsx
**Ruolo:** Vista dashboard completa
**Props:** `data`, `stats`, `setCurrentView`, `setSelectedTeam`, `setShowAIAssistant`
**Sections:**
1. **Header** → Titolo + badges + AI button
2. **StatsCards** → 6 metriche principali
3. **Age Alerts** → Violazioni età (condizionale)
4. **Upcoming Matches** → Prossime partite (condizionale)
5. **TeamOverview** → Panoramica squadre

**Conditional Rendering:**
- Age alerts → se `stats.ageViolations > 0`
- Upcoming matches → se `stats.upcomingMatches > 0`

---

### 📈 StatsCards.jsx
**Ruolo:** 6 cards con metriche principali
**Props:** `stats`
**Cards Array:**
1. **Totale Atlete** (blue) → stats.totalAthletes
2. **Documenti Scadenza** (orange) → stats.expiringDocuments  
3. **Anomalie Età** (purple) → stats.ageViolations
4. **Prossime Partite** (green) → stats.upcomingMatches
5. **Pagamenti Pendenti** (red) → stats.pendingPayments
6. **Utenti Pulmino** (indigo) → stats.busUsers

**Color System:**
```javascript
blue: 'border-blue-500 text-blue-500'
orange: 'border-orange-500 text-orange-500'
purple: 'border-purple-500 text-purple-500'
// etc...
```

---

### 🏆 TeamOverview.jsx
**Ruolo:** Cards squadre con conformità età
**Props:** `data`, `setSelectedTeam`, `setCurrentView`
**Logic per team:**
```javascript
const teamAthletes = data.athletes.filter(a => a.teamId === team.id)
const validAgeAthletes = teamAthletes.filter(a => a.isAgeValid).length
const ageConformity = Math.round((validAgeAthletes / teamAthletes.length) * 100)
```

**Actions:**
- **Visualizza Rosa** → setCurrentView('athletes') + setSelectedTeam
- **Partite** → setCurrentView('matches') + setSelectedTeam

---

### 🎨 StatusBadge.jsx (Utility)
**Ruolo:** Badge colorati riutilizzabili
**Props:** `status`, `children`, `className`
**Status supportati:**
```javascript
expired, critical, warning, valid, paid, pending, 
overdue, not_applicable, scheduled, completed
```

---

### ⏳ LoadingScreen.jsx
**Ruolo:** Schermata caricamento animata
**Props:** Nessuna (standalone)
**Features:** Spinner + animazioni pulse

---

### 🎣 useData.js (Hook)
**Ruolo:** Gestione dati e calcoli derivati
**Returns:**
```javascript
{
  data: { teams, athletes, matches, zones, buses },
  setData: function,
  loading: boolean,
  stats: { calculated metrics }
}
```

**Calcoli automatici:**
- `totalAthletes` → data.athletes.length
- `expiringDocuments` → filtro scadenze < 30 giorni
- `pendingPayments` → filtro feeStatus === 'pending'
- `ageViolations` → filtro !isAgeValid
- etc...

---

### 💾 demoData.js
**Ruolo:** Generazione dataset realistico
**Export:** `generateDemoData()`
**Genera:**
- **5 Teams** → categorie U15, U17, U19, Prima, Seconda
- **~60 Athletes** → con documenti, pagamenti, trasporti
- **15 Matches** → calendario autunnale 2025
- **4 Zones** → aree geografiche
- **3 Buses** → pulmini e percorsi

**Data Validation:**
- Controlli età/categoria automatici
- Scadenze documenti realistiche
- Stati pagamenti variabili
- Coordinate GPS per mappe

## 🎯 INTEGRATION POINTS

### Dove aggiungere nuovi componenti:

1. **Athletes Module:**
   - Create in `/components/athletes/`
   - Import in `App.jsx`
   - Add to `renderCurrentView()` switch

2. **Matches Module:**
   - Create in `/components/matches/`
   - Import in `App.jsx`
   - Add to `renderCurrentView()` switch

3. **AI Assistant:**
   - Create in `/components/ai/`
   - Already hooked in `DashboardView`
   - Modal controlled by `showAIAssistant` state

### Data flow:
```
demoData.js → useData() → App.jsx → Components
                ↓
           stats calculations
```

**Il sistema è pronto per expansion modulare!** 🚀