// components/ai/DataAnalyzer.jsx

class DataAnalyzer {
  constructor(data, stats) {
    this.data = data;
    this.stats = stats;
    this.queryPatterns = this.initializeQueryPatterns();
  }

  initializeQueryPatterns() {
    return {
      // Documenti e scadenze
      expiringDocuments: {
        keywords: ['documenti', 'scadenza', 'scadenze', 'scaduti', 'rinnovi', 'expiry'],
        handler: this.analyzeExpiringDocuments.bind(this)
      },
      
      // Gestione età e promozioni
      ageViolations: {
        keywords: ['età', 'promozione', 'categoria', 'anomalie', 'violazioni', 'cambio'],
        handler: this.analyzeAgeViolations.bind(this)
      },
      
      // Pagamenti e finanze
      payments: {
        keywords: ['pagamenti', 'ritardo', 'sospeso', 'incassi', 'finanze', 'quote'],
        handler: this.analyzePayments.bind(this)
      },
      
      // Trasporti e logistica
      transport: {
        keywords: ['trasporti', 'pulmini', 'zona', 'geografica', 'efficienza', 'utilizzo'],
        handler: this.analyzeTransport.bind(this)
      },
      
      // Performance sportive
      performance: {
        keywords: ['gol', 'performance', 'cartellini', 'statistiche', 'sportive'],
        handler: this.analyzePerformance.bind(this)
      },
      
      // Overview generale
      overview: {
        keywords: ['generale', 'riassunto', 'panoramica', 'stato', 'società'],
        handler: this.analyzeOverview.bind(this)
      },
      
      // Squadre e distribuzione
      teams: {
        keywords: ['squadra', 'squadre', 'distribuzione', 'categoria'],
        handler: this.analyzeTeams.bind(this)
      }
    };
  }

  async processQuery(query) {
    try {
      const normalizedQuery = query.toLowerCase();
      
      // Trova il pattern di query più rilevante
      const matchedPattern = this.findBestMatch(normalizedQuery);
      
      if (matchedPattern) {
        return await matchedPattern.handler(normalizedQuery);
      }
      
      // Fallback: analisi generica
      return this.generateGenericResponse(query);
      
    } catch (error) {
      console.error('Error processing query:', error);
      return {
        type: 'error',
        title: 'Errore nell\'elaborazione',
        message: 'Si è verificato un errore durante l\'analisi della query.',
        suggestions: [
          'Mostra atlete con documenti in scadenza',
          'Analizza pagamenti per squadra',
          'Stato generale società'
        ]
      };
    }
  }

  findBestMatch(query) {
    let bestMatch = null;
    let highestScore = 0;
    
    Object.entries(this.queryPatterns).forEach(([key, pattern]) => {
      const score = pattern.keywords.reduce((acc, keyword) => {
        return query.includes(keyword) ? acc + 1 : acc;
      }, 0);
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = pattern;
      }
    });
    
    return highestScore > 0 ? bestMatch : null;
  }

  // Analizzatori specifici

  async analyzeExpiringDocuments(query) {
    const today = new Date();
    const daysLimit = query.includes('30') ? 30 : query.includes('60') ? 60 : 30;
    const limitDate = new Date(today.getTime() + daysLimit * 24 * 60 * 60 * 1000);
    
    const expiringAthletes = this.data.athletes.filter(athlete => {
      const medicalExpiry = new Date(athlete.medicalExpiry);
      const insuranceExpiry = new Date(athlete.insuranceExpiry);
      
      return medicalExpiry <= limitDate || insuranceExpiry <= limitDate;
    }).map(athlete => {
      const medicalDays = Math.ceil((new Date(athlete.medicalExpiry) - today) / (1000 * 60 * 60 * 24));
      const insuranceDays = Math.ceil((new Date(athlete.insuranceExpiry) - today) / (1000 * 60 * 60 * 24));
      
      return {
        name: athlete.name,
        team: athlete.teamName,
        medicalExpiry: athlete.medicalExpiry,
        insuranceExpiry: athlete.insuranceExpiry,
        daysToExpiry: Math.min(medicalDays, insuranceDays),
        status: Math.min(medicalDays, insuranceDays) <= 7 ? 'Urgente' : 'Attenzione'
      };
    }).sort((a, b) => a.daysToExpiry - b.daysToExpiry);

    const urgentCount = expiringAthletes.filter(a => a.daysToExpiry <= 7).length;
    
    return {
      type: 'table',
      title: `Documenti in Scadenza (${daysLimit} giorni)`,
      data: expiringAthletes,
      summary: `${expiringAthletes.length} atlete hanno documenti in scadenza nei prossimi ${daysLimit} giorni. ${urgentCount} necessitano attenzione immediata (≤7 giorni).`,
      insights: [
        urgentCount > 0 ? `${urgentCount} documenti scadono entro 7 giorni` : 'Nessuna scadenza immediata',
        `${Math.round((expiringAthletes.length / this.stats.totalAthletes) * 100)}% delle atlete coinvolte`,
        `Squadra più colpita: ${this.getMostAffectedTeam(expiringAthletes, 'team')}`
      ],
      actions: [
        'Invia promemoria via email alle atlete interessate',
        'Programma appuntamenti per rinnovi',
        'Contatta i medici per le visite di idoneità',
        'Aggiorna il calendario scadenze'
      ],
      exportable: true
    };
  }

  async analyzeAgeViolations(query) {
    const violatingAthletes = this.data.athletes.filter(athlete => !athlete.isAgeValid)
      .map(athlete => ({
        name: athlete.name,
        age: athlete.age,
        currentTeam: athlete.teamName,
        suggestedTeam: athlete.suggestedTeam || 'Da valutare',
        status: athlete.needsPromotion ? 'Promozione necessaria' : 'Da verificare'
      }));

    const promotionsByTeam = {};
    violatingAthletes.forEach(athlete => {
      const team = athlete.currentTeam;
      promotionsByTeam[team] = (promotionsByTeam[team] || 0) + 1;
    });

    return {
      type: 'table',
      title: 'Anomalie Età Categorie',
      data: violatingAthletes,
      summary: `${violatingAthletes.length} atlete necessitano di cambio categoria per rispettare i regolamenti FIGC.`,
      insights: [
        `${violatingAthletes.filter(a => a.status.includes('Promozione')).length} promozioni obbligatorie`,
        `Squadra più interessata: ${Object.entries(promotionsByTeam).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}`,
        'Azione immediata necessaria per conformità regolamentare'
      ],
      actions: [
        'Contatta le famiglie per comunicare il cambio categoria',
        'Verifica disponibilità posti nelle squadre di destinazione',
        'Aggiorna la documentazione federale',
        'Pianifica il trasferimento per la prossima stagione'
      ],
      exportable: true
    };
  }

  async analyzePayments(query) {
    const pendingPayments = this.data.athletes.filter(athlete => 
      athlete.feeStatus === 'pending' || 
      (athlete.usesBus && athlete.busFeeStatus === 'pending')
    ).map(athlete => {
      const amounts = [];
      if (athlete.feeStatus === 'pending') amounts.push(athlete.membershipFee);
      if (athlete.usesBus && athlete.busFeeStatus === 'pending') amounts.push(athlete.busFee);
      
      return {
        name: athlete.name,
        team: athlete.teamName,
        membershipStatus: athlete.feeStatus,
        transportStatus: athlete.usesBus ? athlete.busFeeStatus : 'N/A',
        totalPending: amounts.reduce((sum, amount) => sum + amount, 0),
        zone: athlete.zone?.name || 'N/A'
      };
    });

    const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + p.totalPending, 0);
    const paymentsByTeam = {};
    pendingPayments.forEach(payment => {
      const team = payment.team;
      paymentsByTeam[team] = (paymentsByTeam[team] || 0) + payment.totalPending;
    });

    return {
      type: 'table',
      title: 'Analisi Pagamenti in Sospeso',
      data: pendingPayments,
      summary: `${pendingPayments.length} atlete hanno pagamenti in sospeso per un totale di €${totalPendingAmount}.`,
      insights: [
        `Importo medio in sospeso: €${Math.round(totalPendingAmount / pendingPayments.length)}`,
        `Squadra con più debiti: ${Object.entries(paymentsByTeam).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}`,
        `${Math.round((pendingPayments.length / this.stats.totalAthletes) * 100)}% del totale atlete`
      ],
      actions: [
        'Invia solleciti di pagamento personalizzati',
        'Organizza incontri con le famiglie in difficoltà',
        'Valuta piani di pagamento rateali',
        'Aggiorna il sistema di tracking pagamenti'
      ],
      exportable: true
    };
  }

  async analyzeTransport(query) {
    const transportData = this.data.athletes.filter(athlete => athlete.usesBus)
      .reduce((acc, athlete) => {
        const busId = athlete.assignedBus?.id;
        const zoneId = athlete.zone?.id;
        
        if (busId) {
          acc.buses[busId] = acc.buses[busId] || { 
            name: athlete.assignedBus.name, 
            capacity: athlete.assignedBus.capacity, 
            users: 0,
            zones: new Set()
          };
          acc.buses[busId].users++;
          acc.buses[busId].zones.add(athlete.zone?.name);
        }
        
        if (zoneId) {
          acc.zones[zoneId] = acc.zones[zoneId] || { 
            name: athlete.zone.name, 
            users: 0, 
            revenue: 0,
            distance: athlete.zone.distance
          };
          acc.zones[zoneId].users++;
          acc.zones[zoneId].revenue += athlete.busFee;
        }
        
        return acc;
      }, { buses: {}, zones: {} });

    const busEfficiency = Object.values(transportData.buses).map(bus => ({
      name: bus.name,
      occupancy: `${bus.users}/${bus.capacity}`,
      efficiency: `${Math.round((bus.users / bus.capacity) * 100)}%`,
      zones: Array.from(bus.zones).join(', '),
      status: bus.users / bus.capacity > 0.8 ? 'Pieno' : bus.users / bus.capacity > 0.5 ? 'Medio' : 'Sottoutilizzato'
    }));

    const totalTransportRevenue = Object.values(transportData.zones)
      .reduce((sum, zone) => sum + zone.revenue, 0);

    return {
      type: 'table',
      title: 'Analisi Efficienza Trasporti',
      data: busEfficiency,
      summary: `${this.stats.busUsers} atlete utilizzano i trasporti societari generando €${totalTransportRevenue} di ricavi mensili.`,
      insights: [
        `Utilizzo medio pulmini: ${Math.round(Object.values(transportData.buses).reduce((sum, bus) => sum + (bus.users / bus.capacity), 0) / Object.keys(transportData.buses).length * 100)}%`,
        `Zona più redditizia: ${Object.entries(transportData.zones).sort(([,a], [,b]) => b.revenue - a.revenue)[0]?.[1]?.name || 'N/A'}`,
        `Pulmini sottoutilizzati: ${busEfficiency.filter(b => b.status === 'Sottoutilizzato').length}`
      ],
      actions: [
        'Ottimizza i percorsi dei pulmini sottoutilizzati',
        'Valuta redistribuzione delle zone geografiche',
        'Promuovi il servizio trasporto nelle zone meno coperte',
        'Analizza possibilità di riduzione costi operativi'
      ],
      exportable: true
    };
  }

  async analyzePerformance(query) {
    const performanceData = this.data.athletes.map(athlete => ({
      name: athlete.name,
      team: athlete.teamName,
      position: athlete.position,
      gamesPlayed: athlete.gamesPlayed || 0,
      goals: athlete.goals || 0,
      yellowCards: athlete.yellowCards || 0,
      redCards: athlete.redCards || 0,
      goalsPerGame: athlete.gamesPlayed > 0 ? Math.round((athlete.goals / athlete.gamesPlayed) * 100) / 100 : 0
    })).sort((a, b) => b.goals - a.goals);

    const topScorers = performanceData.slice(0, 10);
    const teamStats = {};
    
    this.data.athletes.forEach(athlete => {
      const team = athlete.teamName;
      if (!teamStats[team]) {
        teamStats[team] = { goals: 0, games: 0, yellowCards: 0, redCards: 0 };
      }
      teamStats[team].goals += athlete.goals || 0;
      teamStats[team].games += athlete.gamesPlayed || 0;
      teamStats[team].yellowCards += athlete.yellowCards || 0;
      teamStats[team].redCards += athlete.redCards || 0;
    });

    return {
      type: 'table',
      title: 'Statistiche Performance Sportive',
      data: topScorers,
      summary: `Analisi delle performance delle migliori ${topScorers.length} atlete per numero di gol segnati.`,
      insights: [
        `Miglior marcatrice: ${topScorers[0]?.name} con ${topScorers[0]?.goals} gol`,
        `Media gol per partita: ${Math.round(performanceData.reduce((sum, p) => sum + p.goalsPerGame, 0) / performanceData.length * 100) / 100}`,
        `Squadra più prolifica: ${Object.entries(teamStats).sort(([,a], [,b]) => b.goals - a.goals)[0]?.[0] || 'N/A'}`
      ],
      actions: [
        'Riconosci le atlete con migliori performance',
        'Analizza le strategie di gioco più efficaci',
        'Programma allenamenti specifici per migliorare i gol',
        'Valuta premiazioni per le migliori marcatrici'
      ],
      exportable: true
    };
  }

  async analyzeTeams(query) {
    const teamAnalysis = this.data.teams.map(team => {
      const teamAthletes = this.data.athletes.filter(a => a.teamId === team.id);
      const averageAge = teamAthletes.reduce((sum, a) => sum + a.age, 0) / teamAthletes.length;
      const conformityRate = (teamAthletes.filter(a => a.isAgeValid).length / teamAthletes.length) * 100;
      const pendingPayments = teamAthletes.filter(a => a.feeStatus === 'pending').length;
      const totalGoals = teamAthletes.reduce((sum, a) => sum + (a.goals || 0), 0);
      
      return {
        team: team.name,
        category: team.category,
        athletes: teamAthletes.length,
        averageAge: Math.round(averageAge * 10) / 10,
        conformityRate: `${Math.round(conformityRate)}%`,
        pendingPayments: pendingPayments,
        totalGoals: totalGoals,
        avgGoalsPerPlayer: Math.round((totalGoals / teamAthletes.length) * 10) / 10
      };
    });

    return {
      type: 'table',
      title: 'Analisi Squadre e Distribuzione',
      data: teamAnalysis,
      summary: `Panoramica completa delle ${this.data.teams.length} squadre con metriche di performance e conformità.`,
      insights: [
        `Squadra più numerosa: ${teamAnalysis.sort((a, b) => b.athletes - a.athletes)[0]?.team}`,
        `Miglior tasso conformità età: ${teamAnalysis.sort((a, b) => parseFloat(b.conformityRate) - parseFloat(a.conformityRate))[0]?.team}`,
        `Squadra più prolifica: ${teamAnalysis.sort((a, b) => b.totalGoals - a.totalGoals)[0]?.team}`
      ],
      actions: [
        'Equilibra la distribuzione delle atlete tra squadre',
        'Risolvi i problemi di conformità età prioritari',
        'Migliora la gestione pagamenti nelle squadre problematiche',
        'Analizza le strategie delle squadre più prolifiche'
      ],
      exportable: true
    };
  }

  async analyzeOverview(query) {
    const overview = {
      totalAthletes: this.stats.totalAthletes,
      totalTeams: this.data.teams.length,
      upcomingMatches: this.stats.upcomingMatches,
      ageViolations: this.stats.ageViolations,
      expiringDocuments: this.stats.expiringDocuments,
      pendingPayments: this.stats.pendingPayments,
      busUsers: this.stats.busUsers,
      transportCoverage: `${Math.round((this.stats.busUsers / this.stats.totalAthletes) * 100)}%`
    };

    const criticalIssues = [];
    if (overview.ageViolations > 0) criticalIssues.push(`${overview.ageViolations} anomalie età`);
    if (overview.expiringDocuments > 0) criticalIssues.push(`${overview.expiringDocuments} documenti in scadenza`);
    if (overview.pendingPayments > 0) criticalIssues.push(`${overview.pendingPayments} pagamenti in sospeso`);

    return {
      type: 'summary',
      title: 'Stato Generale Società',
      content: `La società gestisce ${overview.totalAthletes} atlete distribuite in ${overview.totalTeams} squadre. 
        Ci sono ${overview.upcomingMatches} partite programmate. 
        Il servizio trasporti copre il ${overview.transportCoverage} delle atlete.
        ${criticalIssues.length > 0 ? `Aree che necessitano attenzione: ${criticalIssues.join(', ')}.` : 'Nessun problema critico rilevato.'}`,
      insights: [
        overview.ageViolations === 0 ? 'Tutte le squadre sono conformi ai regolamenti età' : 'Alcune squadre necessitano revisione categoria',
        overview.expiringDocuments < 5 ? 'Documentazione in regola' : 'Molti documenti necessitano rinnovo',
        overview.pendingPayments < 10 ? 'Situazione finanziaria sotto controllo' : 'Diversi pagamenti da sollecitare',
        parseFloat(overview.transportCoverage) > 60 ? 'Servizio trasporti molto utilizzato' : 'Trasporti sottoutilizzati'
      ],
      actions: [
        'Monitora regolarmente le scadenze documenti',
        'Mantieni aggiornato il sistema pagamenti',
        'Ottimizza continuamente il servizio trasporti',
        'Programma controlli periodici conformità squadre'
      ]
    };
  }

  // Metodi di utilità

  getMostAffectedTeam(athletes, teamField) {
    const teamCounts = {};
    athletes.forEach(athlete => {
      const team = athlete[teamField];
      teamCounts[team] = (teamCounts[team] || 0) + 1;
    });
    
    return Object.entries(teamCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
  }

  generateGenericResponse(query) {
    return {
      type: 'summary',
      title: 'Risposta Generica',
      content: `Non sono riuscito a identificare una query specifica per "${query}". Prova con domande più specifiche sui dati societari.`,
      insights: [
        'Usa parole chiave come "documenti", "pagamenti", "trasporti", "squadre"',
        'Specifica periodi temporali per analisi più precise',
        'Chiedi informazioni su metriche specifiche'
      ],
      actions: [
        'Consulta i suggerimenti nella barra laterale',
        'Prova query predefinite per iniziare',
        'Combina più criteri per analisi avanzate'
      ]
    };
  }
}

export default DataAnalyzer;