# ⚡ CLAUDE-GUIDE - Sviluppo Rapido

*Questa guida permette a Claude di riprendere velocemente lo sviluppo*

## 🎯 STATO PROGETTO (Quick Reference)

### ✅ FUNZIONANTE AL 100%
- **Dashboard completa** con 6 metriche live
- **AthletesView completa** - tabella, filtri, modal dettaglio
- **SettingsView completa** - gestione società, staff, strutture, maglie
- **MatchesView completa** - calendario, distinte, risultati ✅
- **DocumentsView completa** - gestione documenti e scadenze ✅
- **PaymentsView completa** - sistema pagamenti e quote ✅
- **TransportView completa** - gestione pulmini e zone geografiche ✅
- **AIAssistant completo** - query intelligenti, analytics, export ✅ 🎆
- **NotificationSystem completo** - toast + persistent + settings ✅ 🎆 NUOVO!
- **AdminArea completa** - dashboard + config manager + CRUD ✅ 🎆 NUOVO!
- **ExportSystem completo** - PDF/Excel/CSV con 9 componenti ✅ 🎆
- **Navigazione responsiva** con badge intelligenti
- **Sistema dati** con ~60 atlete e 5 squadre
- **Alert automatici** per anomalie età/documenti
- **Architecture modulare** pronta per expansion
- **🔐 Push automatici** configurati (vedi sezione Git)

### 🎨 TECH STACK
- React 18 + Vite + TailwindCSS + Lucide Icons
- Custom hooks: `useData()` 
- Demo data: realistic soccer dataset
- Git: configured, repository online

### 📁 FILE STRUCTURE (Essentials)
```
src/
├── App.jsx                    # Router centrale 11 moduli ✅
├── components/
│   ├── common/               # StatusBadge, Navigation, Loading ✅
│   ├── dashboard/            # DashboardView, StatsCards, TeamOverview ✅
│   ├── athletes/             # AthletesView, AthleteModal ✅ COMPLETATO!
│   ├── matches/              # MatchesView, CalendarView, MatchModal ✅ COMPLETATO!
│   ├── documents/            # DocumentsView, Dashboard, Lista, Modal ✅ COMPLETATO!
│   ├── payments/             # PaymentsView, Dashboard, Lista, Modal ✅ COMPLETATO!
│   ├── transport/            # TransportView, Dashboard, Pulmini, Zone ✅ COMPLETATO!
│   ├── ai/                   # AIAssistant, QuerySuggestions, DataAnalyzer ✅ COMPLETATO! 🎆
│   ├── export/               # ExportManager, PDFExporter, ExcelExporter, CSVExporter ✅ 🎆
│   ├── notifications/        # NotificationCenter, ToastNotification, Settings ✅ 🎆 NUOVO!
│   └── admin/                # AdminDashboard, ConfigurationManager, ConfigTable ✅ 🎆 NUOVO!
├── hooks/
│   ├── useData.js            # Gestione stati e calcoli ✅
│   ├── useNotifications.js   # Hook notifiche complete ✅ 🎆 NUOVO!
│   └── useToast.js           # Hook toast temporanei ✅ 🎆 NUOVO!
├── data/
│   ├── demoData.js           # Dataset realistico ✅
│   ├── notificationDemoData.js # Dati notifiche demo ✅ 🎆 NUOVO!
│   └── configTables.js       # Tabelle configurazione admin ✅ 🎆 NUOVO!
└── utils/
    ├── libraryLoader.js      # Caricamento dinamico export ✅ 🎆
    └── toastActions.js       # Utility azioni standard ✅ 🎆 NUOVO!
```

## 🚀 QUICK COMMANDS

### Sviluppo
```bash
cd /Users/lucamambelli/Desktop/soccer-management-system

# PRIMA VOLTA: Installa dipendenze
npm install

# Avvia server sviluppo
npm run dev  # → http://localhost:5173
```

### 🔐 Push Automatico (NUOVO!)
```bash
# IMPORTANTE: Prima volta, dai permessi di esecuzione:
chmod +x /Users/lucamambelli/Desktop/soccer-management-system/.config/claude-push.sh

# Push rapido dopo modifiche
cd /Users/lucamambelli/Desktop/soccer-management-system
./.config/claude-push.sh "feat: descrizione modifiche"
```

### Debug dati
```javascript
// In qualsiasi componente:
console.log('Data:', data);
console.log('Stats:', stats);
console.table(data.athletes.slice(0, 3));
```

## 🔐 GIT AUTOMATION (IMPORTANTE!)

### ⚡ Push Automatico Configurato
Ho configurato tutto per push automatici senza chiedere credenziali:

**Per push rapido dopo modifiche:**
```bash
cd /Users/lucamambelli/Desktop/soccer-management-system && ./.config/claude-push.sh "feat: development progress"
```

**Script disponibili:**
- `.config/claude-push.sh` → Push rapido per Claude
- `.config/auto-push.sh` → Push interattivo per utente
- `.config/git-credentials.env` → Configurazione centrale

### 📋 Workflow Claude
1. **Sviluppa** → Modifica componenti
2. **Testa** → `npm run dev`
3. **Push** → `./.config/claude-push.sh "descrizione"`
4. **Verifica** → https://github.com/241luca/Gestione-societ--di-calcio

**Nessuna credenziale richiesta, tutto automatizzato!** 🎉

## 🎯 PROSSIMI SVILUPPI (Priorità)

### 1️⃣ MatchesView (✅ COMPLETATO!) - 🎆 NUOVO!
**File implementati:**
```bash
src/components/matches/MatchesView.jsx       # Vista principale ✅
src/components/matches/CalendarView.jsx      # Calendario mensile ✅
src/components/matches/MatchModal.jsx        # Modal dettaglio partita ✅
```

**Funzionalità implementate:**
- Calendario partite mensile/settimanale con navigazione fluida
- Gestione distinte complete con titolari/panchina
- Modal dettaglio con 3 tab: Informazioni, Formazione, Risultato
- Filtri avanzati per squadra/competizione/stato
- Statistiche partite integrate nella header
- Sistema risultati con calcolo automatico
- Validazione formazioni (11 titolari obbligatori)
- Gestione dinamica giocatrici disponibili

### 2️⃣ AthletesView (✅ COMPLETATO!)
**File implementati:**
```bash
src/components/athletes/AthletesView.jsx     # Vista principale ✅
src/components/athletes/AthleteModal.jsx     # Modal dettaglio ✅
```

**Funzionalità implementate:**
- Tabella completa con filtri avanzati (squadra, età, documenti, pagamenti)
- Vista doppia: tabella dettagliata + vista schede responsive
- Modal dettaglio con 5 tab: dati personali, sportivi, documenti, pagamenti, trasporti
- Ricerca in tempo reale per nome/squadra
- Statistiche rapide con contatori dinamici
- Indicatori visivi per scadenze e anomalie
- Integrazione completa nel routing App.jsx

### 3️⃣ SettingsView (✅ COMPLETATO!)
**File implementati:**
```bash
src/components/settings/SettingsView.jsx    # Sistema completo ✅
```

**Funzionalità implementate:**
- **Tab Società**: Dati aziendali, indirizzo, branding, colori
- **Tab Staff**: Gestione dirigenti, allenatori, staff tecnico
- **Tab Strutture**: Campi, palestre, spogliatoi con dettagli
- **Tab Maglie**: Divise home/away/third con componenti
- **Tab Configurazioni**: Stagione, integrazioni, valute
- Sistema modifica in tempo reale con stato locale
- Interfaccia professionale con upload placeholder
- Integrazione completa nel routing App.jsx

### 4️⃣ DocumentsView (✅ COMPLETATO!) - 🎆 NUOVO!
**File implementati:**
```bash
src/components/documents/DocumentsView.jsx       # Vista principale ✅
src/components/documents/DocumentsDashboard.jsx  # Dashboard overview ✅
src/components/documents/DocumentsList.jsx       # Lista documenti ✅
src/components/documents/DocumentModal.jsx       # Modal dettaglio/upload ✅
src/components/documents/ExpiryCenter.jsx        # Centro scadenze ✅
```

**Funzionalità implementate:**
- Dashboard scadenze con alert automatici e statistiche live
- Gestione completa documenti per atleta con calcolo stati
- Centro scadenze con prioritizzazione e azioni bulk
- Sistema notifiche e conformità per squadra
- Export e report documenti per controlli FIGC
- Upload simulation con validazioni e drag-and-drop
- Filtri avanzati per tipo, stato, squadra, scadenze
- Tab navigation: Dashboard, Lista, Centro Scadenze
- Modal professionale per upload/modifica documenti
- Integrazione completa nel routing App.jsx

### 6️⃣ TransportView (✅ COMPLETATO!) - 🎆 NUOVO!
**File implementati:**
```bash
src/components/transport/TransportView.jsx       # Vista principale ✅
src/components/transport/TransportDashboard.jsx  # Dashboard overview ✅
src/components/transport/BusesList.jsx           # Gestione pulmini ✅
src/components/transport/ZonesManagement.jsx     # Gestione zone ✅
src/components/transport/TransportModal.jsx      # Modal dettaglio/modifica ✅
```

**Funzionalità implementate:**
- Dashboard trasporti con statistiche live e alert automatici
- Gestione completa pulmini con assegnazioni e capienza
- Sistema zone geografiche con tariffe e ottimizzazione
- Tracking utilizzo e costi operativi per zona
- Analytics utilizzo per squadra e efficienza
- Integrazione pagamenti trasporto esistenti
- Modal professionale per gestione pulmini/zone
- Filtri avanzati e ricerca intelligente
- Tab navigation: Dashboard, Pulmini, Zone
- Suggerimenti ottimizzazione automatici
- Sistema alert per sovraffollamento e problemi
- Integrazione completa nel routing App.jsx

### 7️⃣ AIAssistant (✅ COMPLETATO!) - 🎆 NUOVO!
**File implementati:**
```bash
src/components/ai/AIAssistant.jsx           # Modal AI completo ✅
src/components/ai/QuerySuggestions.jsx      # Suggerimenti predefiniti ✅
src/components/ai/ResponseFormatter.jsx     # Formattazione risposte ✅
src/components/ai/DataAnalyzer.jsx          # Analisi dati intelligente ✅
```

**Funzionalità implementate:**
- Sistema query intelligenti sui dati societari
- Interface chat-like con conversazione persistente
- Suggerimenti contestuali automatici per ogni modulo
- Response formatting con tabelle, grafici e insights
- Export risultati query in CSV/JSON
- Analisi cross-module (documenti, pagamenti, trasporti, etc.)
- Insights automatici e raccomandazioni
- Tab navigation: Chat + Insights dashboard
- Pattern matching avanzato per interpretazione query
- Integrazione completa nel dashboard esistente

### 5️⃣ PaymentsView (✅ COMPLETATO!) - 🎆 NUOVO!
**File implementati:**
```bash
src/components/payments/PaymentsView.jsx       # Vista principale ✅
src/components/payments/PaymentsDashboard.jsx  # Dashboard overview ✅
src/components/payments/PaymentsList.jsx       # Lista pagamenti ✅
src/components/payments/PaymentModal.jsx       # Modal dettaglio/modifica ✅
src/components/payments/IncomeCenter.jsx       # Centro incassi ✅
```

**Funzionalità implementate:**
- Dashboard incassi con statistiche live e trend mensili
- Gestione completa pagamenti per atleta con stati dinamici
- Centro incassi con prioritizzazione scadenze
- Sistema solleciti e reminder automatici
- Export report per contabilità
- Generazione quote automatica per periodi
- Tracking metodi di pagamento e ricevute
- Filtri avanzati e ricerca in tempo reale
- Modal professionale per gestione pagamenti
- Integrazione completa nel routing App.jsx

### 6️⃣ TransportView (ALTA PRIORITÀ) - 🎯 PROSSIMO SVILUPPO
**Obiettivo:** Sistema completo gestione pagamenti e quote
**Dati disponibili:** `athlete.payments` già strutturati
**File da creare:**
```bash
src/components/payments/PaymentsView.jsx       # Vista principale
src/components/payments/PaymentsDashboard.jsx  # Dashboard overview
src/components/payments/PaymentsList.jsx       # Lista pagamenti
src/components/payments/PaymentModal.jsx       # Modal dettaglio/modifica
src/components/payments/IncomeCenter.jsx       # Centro incassi
```

**Funzionalità da implementare:**
- Dashboard incassi con statistiche live e trend
- Gestione completa pagamenti per atleta con stati
- Centro incassi con scadenze prioritarie
- Sistema solleciti e reminder automatici
- Export report per contabilità
- Generazione quote automatica per periodi
- Tracking metodi di pagamento e ricevute

## 🎨 DEVELOPMENT PATTERNS

### Component Template
```javascript
// components/[categoria]/ComponentName.jsx
import React, { useState } from 'react';
import StatusBadge from '../common/StatusBadge';

const ComponentName = ({ data, stats, onAction }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Title</h1>
        {/* Content */}
      </div>
    </div>
  );
};

export default ComponentName;
```

### Add to Routing (App.jsx)
```javascript
// In renderCurrentView() switch:
case 'athletes':
  return (
    <AthletesView 
      data={data}
      stats={stats}
      selectedTeam={selectedTeam}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    />
  );
```

### Navigation Integration (già fatto)
Menu items già configurati, badge automatici via stats.

## 📊 DATA STRUCTURE (Quick Ref)

### Athletes Array
```javascript
athlete = {
  id, name, age, teamId, teamName, position, number,
  medicalExpiry, insuranceExpiry, feeStatus,
  isAgeValid, needsPromotion, suggestedTeam,
  documents: [{ type, name, status, expiryDate }],
  payments: [{ type, amount, status, dueDate }]
}
```

### Teams Array  
```javascript
team = {
  id, name, category, players, budget, 
  minAge, maxAge, season
}
```

### Stats Object (Calculated)
```javascript
stats = {
  totalAthletes, expiringDocuments, pendingPayments,
  busUsers, athletesNeedingPromotion, ageViolations, 
  upcomingMatches
}
```

## 🎯 COMMON TASKS

### Filtri standard
```javascript
// Filter athletes by team
const teamAthletes = data.athletes.filter(a => a.teamId === selectedTeam?.id);

// Filter by age violations  
const problematicAthletes = data.athletes.filter(a => !a.isAgeValid);

// Filter upcoming matches
const upcomingMatches = data.matches.filter(m => m.status === 'scheduled');
```

### StatusBadge usage
```javascript
<StatusBadge status="valid">Conforme</StatusBadge>
<StatusBadge status="warning">Attenzione</StatusBadge>
<StatusBadge status="critical">Critico</StatusBadge>
<StatusBadge status="valid" size="sm">OK</StatusBadge>
```

### Modal pattern
```javascript
const [showModal, setShowModal] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);

// Trigger
onClick={() => {
  setSelectedItem(item);
  setShowModal(true);
}}

// Modal JSX
{showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto mt-20">
      {/* Modal content */}
    </div>
  </div>
)}
```

## 🔥 QUICK WINS (30min tasks)

1. **Add search to athletes** → Filter athletes by name ✅ FATTO
2. **Add team filter** → Dropdown to filter by team ✅ FATTO
3. **Expand athlete cards** → Show more details in TeamOverview ✅ FATTO  
4. **Society settings** → Complete management system ✅ FATTO
5. **Add loading states** → Skeleton loading for lists
6. **Add toast notifications** → Success/error messages
7. **Logo upload** → Real file upload for society logo
8. **Color picker integration** → Live preview of society colors

## 🎯 DEVELOPMENT FOCUS

**L'obiettivo è sempre: funzionalità concrete e visibili subito.**

Workflow ottimale:
1. **Vista base** → Layout e dati mockup
2. **Integrazione dati** → Usa data/stats esistenti
3. **Interattività** → Click handlers e stato locale
4. **Polish** → Animazioni e dettagli UX
5. **🚀 Push automatico** → `./.config/claude-push.sh "feat: descrizione"`

## 🎉 TUTTO PRONTO!

**Il progetto è strutturato per sviluppo rapido e incrementale con push automatici!** ⚡

**AthletesView è completato! SettingsView è completato! Prossimo obiettivo: MatchesView!** 🚀

## 🎨 DEVELOPMENT PATTERNS

### Component Template
```javascript
// components/[categoria]/ComponentName.jsx
import React, { useState } from 'react';
import StatusBadge from '../common/StatusBadge';

const ComponentName = ({ data, stats, onAction }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Title</h1>
        {/* Content */}
      </div>
    </div>
  );
};

export default ComponentName;
```

### Add to Routing (App.jsx)
```javascript
// In renderCurrentView() switch:
case 'athletes':
  return (
    <AthletesView 
      data={data}
      stats={stats}
      selectedTeam={selectedTeam}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    />
  );
```

### Navigation Integration (già fatto)
Menu items già configurati, badge automatici via stats.

## 📊 DATA STRUCTURE (Quick Ref)

### Athletes Array
```javascript
athlete = {
  id, name, age, teamId, teamName, position, number,
  medicalExpiry, insuranceExpiry, feeStatus,
  isAgeValid, needsPromotion, suggestedTeam,
  documents: [{ type, name, status, expiryDate }],
  payments: [{ type, amount, status, dueDate }]
}
```

### Teams Array  
```javascript
team = {
  id, name, category, players, budget, 
  minAge, maxAge, season
}
```

### Stats Object (Calculated)
```javascript
stats = {
  totalAthletes, expiringDocuments, pendingPayments,
  busUsers, athletesNeedingPromotion, ageViolations, 
  upcomingMatches
}
```

## 🎯 COMMON TASKS

### Filtri standard
```javascript
// Filter athletes by team
const teamAthletes = data.athletes.filter(a => a.teamId === selectedTeam?.id);

// Filter by age violations  
const problematicAthletes = data.athletes.filter(a => !a.isAgeValid);

// Filter upcoming matches
const upcomingMatches = data.matches.filter(m => m.status === 'scheduled');
```

### StatusBadge usage
```javascript
<StatusBadge status="valid">Conforme</StatusBadge>
<StatusBadge status="warning">Attenzione</StatusBadge>
<StatusBadge status="critical">Critico</StatusBadge>
```

### Modal pattern
```javascript
const [showModal, setShowModal] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);

// Trigger
onClick={() => {
  setSelectedItem(item);
  setShowModal(true);
}}

// Modal JSX
{showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto mt-20">
      {/* Modal content */}
    </div>
  </div>
)}
```

## 🔥 QUICK WINS (30min tasks)

1. **Add search to athletes** → Filter athletes by name
2. **Add team filter** → Dropdown to filter by team
3. **Expand athlete cards** → Show more details in TeamOverview
4. **Add loading states** → Skeleton loading for lists
5. **Add toast notifications** → Success/error messages

## 🎯 DEVELOPMENT FOCUS

**L'obiettivo è sempre: funzionalità concrete e visibili subito.**

Workflow ottimale:
1. **Vista base** → Layout e dati mockup
2. **Integrazione dati** → Usa data/stats esistenti
3. **Interattività** → Click handlers e stato locale
4. **Polish** → Animazioni e dettagli UX
5. **🚀 Push automatico** → `./.config/claude-push.sh "feat: descrizione"`

## 🎉 TUTTO PRONTO!

**Il progetto è strutturato per sviluppo rapido e incrementale con push automatici!** ⚡

**Inizia subito con AthletesView e usa push automatico per salvare il progresso!** 🚀