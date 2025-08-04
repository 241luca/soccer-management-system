# 📋 Soccer Management System - Documentazione Progetto

## 🎯 Obiettivo
Sistema completo per la gestione di società di calcio femminile con focus su:
- Gestione categorie giovanili secondo normative FIGC
- Dashboard con KPI e alert automatici  
- Workflow ottimizzati per segreteria e staff tecnico
- AI Assistant per analisi e suggerimenti
- Multi-tenant per gestione multiple società

## 🏗️ Architettura Tecnica

### Frontend
- **React 18** con hooks moderni
- **Vite** per sviluppo veloce  
- **TailwindCSS** per styling responsive
- **Lucide React** per iconografia
- **Sistema di navigazione custom** (no react-router)
- **100% API-driven** (nessun dato demo)

### Backend
- **Node.js + Express** con TypeScript
- **PostgreSQL** database relazionale
- **Prisma ORM** per gestione DB
- **JWT** per autenticazione
- **Multi-tenant** con isolamento dati

### Struttura Dati
```javascript
{
  organizations: [],  // Società con piani abbonamento
  teams: [],         // Squadre con categorie e limiti età
  athletes: [],      // Atlete con documenti e pagamenti
  matches: [],       // Partite e calendario
  zones: [],         // Zone geografiche per trasporti
  buses: [],         // Pulmini e percorsi
  documents: [],     // Documenti con tracking scadenze
  payments: []       // Pagamenti e quote
}
```

### Componenti Modulari
- **Common**: Componenti riutilizzabili (StatusBadge, Navigation, LoadingSpinner, ErrorMessage)
- **Dashboard**: Moduli dashboard e statistiche
- **Athletes**: Gestione anagrafica e documenti
- **Matches**: Calendario, distinte, risultati
- **Organizations**: Gestione società multi-tenant
- **AI**: Assistente intelligente

## 📊 Metriche e KPI

### Dashboard Principale
1. **Totale Atlete** - Conteggio con trend mensile
2. **Documenti in Scadenza** - Alert per certificati medici/assicurazioni
3. **Anomalie Età** - Controllo conformità categorie FIGC
4. **Prossime Partite** - Calendario con azioni rapide
5. **Pagamenti Pendenti** - Situazione finanziaria
6. **Utenti Trasporto** - Gestione pulmini

## 🔄 Funzionalità Multi-Tenant

### Gestione Organizzazioni
- **Super Admin Dashboard** - Gestione globale società
- **Piani Abbonamento** - Basic, Pro, Enterprise
- **Organization Switcher** - Cambio rapido società
- **Isolamento Dati** - Ogni società vede solo i suoi dati

### Credenziali Demo
- **Demo Soccer Club**: demo@soccermanager.com / demo123456
- **ASD Ravenna**: admin@asdravennacalcio.it / ravenna2024!
- **Super Admin**: superadmin@soccermanager.com / superadmin123456

## 🚀 Stato del Progetto

### Completato (v2.1.0)
- ✅ Sistema multi-tenant completo
- ✅ Gestione organizzazioni per Super Admin
- ✅ Organization Switcher
- ✅ Rimozione completa dati demo
- ✅ Dashboard con statistiche real-time
- ✅ CRUD completo atleti e squadre
- ✅ Sistema notifiche
- ✅ Autenticazione JWT con refresh token

### In Sviluppo
- 🔄 Sistema fatturazione automatica
- 🔄 Report avanzati con export
- 🔄 App mobile React Native
- 🔄 Integrazione federazioni sportive

---

*Documentazione aggiornata: Agosto 2025*