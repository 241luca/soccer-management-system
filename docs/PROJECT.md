# 📋 Soccer Management System - Documentazione Progetto

## 🎯 Obiettivo
Sistema completo per la gestione di società di calcio femminile con focus su:
- Gestione categorie giovanili secondo normative FIGC
- Dashboard con KPI e alert automatici  
- Workflow ottimizzati per segreteria e staff tecnico
- AI Assistant per analisi e suggerimenti

## 🏗️ Architettura Tecnica

### Frontend
- **React 18** con hooks moderni
- **Vite** per sviluppo veloce
- **TailwindCSS** per styling responsive
- **Lucide React** per iconografia

### Struttura Dati
```javascript
{
  teams: [],      // Squadre con categorie e limiti età
  athletes: [],   // Atlete con documenti e pagamenti
  matches: [],    // Partite e calendario
  zones: [],      // Zone geografiche per trasporti
  buses: []       // Pulmini e percorsi
}
```

### Componenti Modulari
- **Common**: Componenti riutilizzabili (StatusBadge, Navigation, etc.)
- **Dashboard**: Moduli dashboard e statistiche
- **Athletes**: Gestione anagrafica e documenti
- **Matches**: Calendario, distinte, risultati
- **AI**: Assistente intelligente

## 📊 Metriche e KPI

### Dashboard Principale
1. **Totale Atlete** - Conteggio con trend mensile
2. **Documenti in Scadenza** - Alert per certificati medici/assicurazioni
3. **Anomalie Età** - Controllo conformità categorie FIGC
4. **Prossime Partite** - Calendario con azioni rapide
5. **Pagamenti Pendenti** - Situazione finanziaria
6. **Utenti Trasporto** - Gestione pulmini

---

*Documentazione aggiornata: Agosto 2025*