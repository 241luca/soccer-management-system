# 🧭 DEVELOPER GUIDE - Quick Navigation

## 🎯 DOVE TROVARE COSA

### 📊 Per modifiche alla Dashboard
```bash
src/components/dashboard/
├── DashboardView.jsx     # Vista principale dashboard
├── StatsCards.jsx        # Le 6 card con metriche
└── TeamOverview.jsx      # Panoramica squadre
```

### 🎨 Per componenti UI riutilizzabili
```bash
src/components/common/
├── Navigation.jsx        # Menu principale con badge
├── StatusBadge.jsx       # Badge colorati per stati
└── LoadingScreen.jsx     # Schermata caricamento
```

### 📱 Per il routing principale
```bash
src/App.jsx              # Router e orchestratore principale
```

### 💾 Per i dati e la logica
```bash
src/data/demoData.js     # Generazione dati demo realistici
src/hooks/useData.js     # Hook per gestione stati e calcoli
```

## 🔧 COMANDI SVILUPPO

### Avvio rapido
```bash
cd /Users/lucamambelli/Desktop/soccer-management-system
npm run dev
```

### Build e deploy
```bash
npm run build
npm run preview
```

### Git workflow
```bash
git add .
git commit -m "feat: descrizione modifiche"
git push origin main
```

## 🎯 TASK PRONTI DA SVILUPPARE

### 1. Athletes Management (PRIORITÀ ALTA)
**Cosa fare:**
- Creare `AthletesView.jsx` in `/components/athletes/`
- Tabella con filtri per squadra, età, stato
- Ricerca per nome/posizione
- Modal dettaglio atleta

**File da creare:**
```bash
src/components/athletes/
├── AthletesView.jsx      # Vista principale tabella
├── AthleteModal.jsx      # Modal dettaglio/modifica
├── AthleteCard.jsx       # Card singola atleta
└── AthletesFilters.jsx   # Componente filtri
```

**Dati disponibili:**
- `data.athletes` → Array completo atlete
- `data.teams` → Info squadre per filtri
- Ogni atleta ha: nome, età, squadra, posizione, documenti, pagamenti

### 2. Matches Calendar (PRIORITÀ ALTA)
**Cosa fare:**
- Creare `MatchesView.jsx` in `/components/matches/`
- Calendario partite con filtri per squadra
- Preparazione distinte e convocazioni
- Gestione risultati

**File da creare:**
```bash
src/components/matches/
├── MatchesView.jsx       # Vista calendario
├── MatchCard.jsx         # Card singola partita
├── LineupModal.jsx       # Modal formazione
└── MatchFilters.jsx      # Filtri partite
```

**Dati disponibili:**
- `data.matches` → Array partite generate
- Ogni match ha: squadra, avversario, data, venue, stato

### 3. AI Assistant (PRIORITÀ MEDIA)
**Cosa fare:**
- Creare `AIAssistant.jsx` in `/components/ai/`
- Modal con query predefinite
- Analisi automatiche categorie, pagamenti, partite
- Suggerimenti intelligenti

**File da creare:**
```bash
src/components/ai/
├── AIAssistant.jsx       # Modal principale
├── AIQueryInput.jsx      # Input query
├── AIResponse.jsx        # Visualizzazione risposte
└── AIPresets.jsx         # Query predefinite
```

## 🎨 PATTERN DI SVILUPPO

### Struttura componente tipo
```javascript
// components/[categoria]/ComponentName.jsx
import React, { useState } from 'react';
import { IconName } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const ComponentName = ({ data, onAction }) => {
  const [localState, setLocalState] = useState(initialValue);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Titolo Sezione</h2>
      {/* Contenuto componente */}
    </div>
  );
};

export default ComponentName;
```

### Come aggiungere al routing
```javascript
// In App.jsx, funzione renderCurrentView()
case 'nuova-vista':
  return (
    <NuovoComponente 
      data={data}
      stats={stats}
      onAction={handleAction}
    />
  );
```

### Come aggiungere al menu
```javascript
// In Navigation.jsx, array navItems
{ 
  id: 'nuova-vista', 
  label: 'Nuova Vista', 
  icon: IconName, 
  badge: stats.relevantStat 
}
```

## 🎯 TESTING VELOCE

### Componenti esistenti da testare
1. **Dashboard** → http://localhost:5173 (default)
2. **Navigation** → Click sui menu items
3. **StatsCards** → Verifica metriche calcolate
4. **TeamOverview** → Verifica conformità età
5. **Dati demo** → Console.log(data) per esplorare

### Debugging rapido
```javascript
// In qualsiasi componente, aggiungi:
console.log('Debug data:', { data, stats });

// Per vedere la struttura dati completa:
console.table(data.athletes.slice(0, 5));
console.table(data.teams);
```

## 🚀 DEPLOY VELOCE

### GitHub Pages (automatico)
Il repository è già configurato. Ogni push su main deployerà automaticamente.

### Vercel (alternativo)
1. Vai su vercel.com
2. Import da GitHub
3. Deploy automatico

---

**Il progetto è modulare e pronto per sviluppo rapido!** 🎉
**Inizia con AthletesView per avere subito un impatto visibile.** ⚡