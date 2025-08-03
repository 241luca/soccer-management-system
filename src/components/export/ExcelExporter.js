// components/export/ExcelExporter.js
class ExcelExporter {
  constructor() {
    this.workbook = null;
    this.XLSX = null;
  }

  async export(dataType, data, stats, options) {
    try {
      // Carica XLSX library se non disponibile
      this.XLSX = window.XLSX || await this.loadXLSX();
      
      // Crea workbook
      this.workbook = this.XLSX.utils.book_new();
      
      // Aggiunge fogli basati sul tipo di dato
      switch (dataType) {
        case 'athletes':
          await this.exportAthletes(data, options);
          break;
        case 'matches':
          await this.exportMatches(data, options);
          break;
        case 'payments':
          await this.exportPayments(data, options);
          break;
        case 'transport':
          await this.exportTransport(data, options);
          break;
        case 'all':
          await this.exportComplete(data, stats, options);
          break;
        default:
          throw new Error('Tipo di dato non supportato');
      }
      
      // Download del file Excel
      const filename = this.generateFilename(dataType);
      this.XLSX.writeFile(this.workbook, filename);
      
    } catch (error) {
      console.error('Errore export Excel:', error);
      throw error;
    }
  }

  async loadXLSX() {
    // Carica XLSX dinamicamente se non disponibile
    if (!window.XLSX) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      document.head.appendChild(script);
      
      return new Promise((resolve, reject) => {
        script.onload = () => resolve(window.XLSX);
        script.onerror = reject;
      });
    }
    return window.XLSX;
  }

  async exportAthletes(data, options) {
    let athletes = data.athletes || [];
    
    // Filtra per squadra se specificato
    if (options.teamFilter !== 'all') {
      athletes = athletes.filter(a => a.teamId == options.teamFilter);
    }
    
    // Foglio principale con dati atlete
    const athleteData = athletes.map(athlete => ({
      'Nome': athlete.name,
      'Età': athlete.age,
      'Squadra': athlete.teamName,
      'Posizione': athlete.position,
      'Numero Maglia': athlete.number,
      'Telefono': athlete.phone,
      'Email': athlete.email,
      'Indirizzo': athlete.address,
      'Scadenza Medico': this.formatDate(athlete.medicalExpiry),
      'Scadenza Assicurazione': this.formatDate(athlete.insuranceExpiry),
      'Stato Documenti': this.getDocumentStatus(athlete),
      'Quota Sociale': `€${athlete.membershipFee}`,
      'Stato Pagamento': athlete.feeStatus === 'paid' ? 'Pagato' : 'In sospeso',
      'Usa Trasporto': athlete.usesBus ? 'Sì' : 'No',
      'Zona Trasporto': athlete.zone?.name || 'N/A',
      'Tariffa Trasporto': athlete.usesBus ? `€${athlete.busFee}` : 'N/A',
      'Stato Trasporto': athlete.usesBus ? (athlete.busFeeStatus === 'paid' ? 'Pagato' : 'In sospeso') : 'N/A',
      'Pulmino Assegnato': athlete.assignedBus?.name || 'N/A',
      'Partite Giocate': athlete.gamesPlayed || 0,
      'Gol Segnati': athlete.goals || 0,
      'Cartellini Gialli': athlete.yellowCards || 0,
      'Cartellini Rossi': athlete.redCards || 0,
      'Minuti Giocati': athlete.minutesPlayed || 0,
      'Conformità Età': athlete.isAgeValid ? 'Conforme' : 'Non conforme',
      'Promozione Necessaria': athlete.needsPromotion ? 'Sì' : 'No',
      'Squadra Suggerita': athlete.suggestedTeam || 'N/A'
    }));
    
    const worksheet = this.XLSX.utils.json_to_sheet(athleteData);
    
    // Applica stili e formattazione
    this.formatWorksheet(worksheet, athleteData.length);
    this.autoSizeColumns(worksheet);
    
    this.XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Atlete');
    
    // Foglio statistiche se richiesto
    if (options.includeStats) {
      this.addAthleteStatsSheet(athletes);
    }
    
    // Foglio per squadra
    this.addTeamBreakdownSheet(athletes, data.teams);
  }

  async exportMatches(data, options) {
    let matches = data.matches || [];
    
    // Foglio partite
    const matchData = matches.map(match => ({
      'Data': this.formatDate(match.date),
      'Ora': match.time || 'TBD',
      'Squadra Casa': match.homeTeam,
      'Squadra Ospite': match.awayTeam,
      'Risultato': match.result || 'TBD',
      'Competizione': match.competition,
      'Venue': match.venue,
      'Stato': this.getMatchStatusText(match.status),
      'Note': match.notes || '',
      'Arbitro': match.referee || 'TBD'
    }));
    
    const worksheet = this.XLSX.utils.json_to_sheet(matchData);
    this.formatWorksheet(worksheet, matchData.length);
    this.autoSizeColumns(worksheet);
    
    this.XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Partite');
    
    // Foglio statistiche partite
    this.addMatchStatsSheet(matches);
  }

  async exportPayments(data, options) {
    const athletes = data.athletes || [];
    
    // Foglio pagamenti dettagliato
    const paymentData = athletes.map(athlete => {
      const membershipAmount = athlete.feeStatus === 'pending' ? athlete.membershipFee : 0;
      const transportAmount = (athlete.usesBus && athlete.busFeeStatus === 'pending') ? athlete.busFee : 0;
      const totalPending = membershipAmount + transportAmount;
      
      return {
        'Nome': athlete.name,
        'Squadra': athlete.teamName,
        'Quota Sociale': `€${athlete.membershipFee}`,
        'Stato Quota': athlete.feeStatus === 'paid' ? 'Pagata' : 'In sospeso',
        'Usa Trasporto': athlete.usesBus ? 'Sì' : 'No',
        'Tariffa Trasporto': athlete.usesBus ? `€${athlete.busFee}` : 'N/A',
        'Stato Trasporto': athlete.usesBus ? (athlete.busFeeStatus === 'paid' ? 'Pagato' : 'In sospeso') : 'N/A',
        'Totale Dovuto': totalPending > 0 ? `€${totalPending}` : '€0',
        'Zona': athlete.zone?.name || 'N/A',
        'Email': athlete.phone,
        'Telefono': athlete.phone
      };
    });
    
    const worksheet = this.XLSX.utils.json_to_sheet(paymentData);
    this.formatWorksheet(worksheet, paymentData.length);
    this.autoSizeColumns(worksheet);
    
    this.XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Pagamenti');
    
    // Foglio riassunto finanziario
    this.addFinancialSummarySheet(athletes);
  }

  async exportTransport(data, options) {
    const buses = data.buses || [];
    const zones = data.zones || [];
    const athletes = data.athletes || [];
    
    // Foglio pulmini
    const busData = buses.map(bus => {
      const assignedAthletes = athletes.filter(a => a.assignedBus?.id === bus.id);
      const occupancy = `${assignedAthletes.length}/${bus.capacity}`;
      const efficiency = `${Math.round((assignedAthletes.length / bus.capacity) * 100)}%`;
      
      return {
        'Nome Pulmino': bus.name,
        'Capacità': bus.capacity,
        'Autista': bus.driver,
        'Targa': bus.plate,
        'Percorso': bus.route,
        'Occupazione': occupancy,
        'Efficienza': efficiency,
        'Atlete Assegnate': assignedAthletes.map(a => a.name).join(', ')
      };
    });
    
    const busWorksheet = this.XLSX.utils.json_to_sheet(busData);
    this.formatWorksheet(busWorksheet, busData.length);
    this.autoSizeColumns(busWorksheet);
    
    this.XLSX.utils.book_append_sheet(this.workbook, busWorksheet, 'Pulmini');
    
    // Foglio zone
    const zoneData = zones.map(zone => {
      const zoneAthletes = athletes.filter(a => a.zone?.id === zone.id);
      const totalRevenue = zoneAthletes.reduce((sum, a) => sum + (a.usesBus ? a.busFee : 0), 0);
      
      return {
        'Zona': zone.name,
        'Distanza': zone.distance,
        'Tariffa Mensile': `€${zone.monthlyFee}`,
        'Atlete Totali': zoneAthletes.length,
        'Atlete con Trasporto': zoneAthletes.filter(a => a.usesBus).length,
        'Ricavi Mensili': `€${totalRevenue}`,
        'Utilizzo': `${Math.round((zoneAthletes.filter(a => a.usesBus).length / zoneAthletes.length) * 100)}%`
      };
    });
    
    const zoneWorksheet = this.XLSX.utils.json_to_sheet(zoneData);
    this.formatWorksheet(zoneWorksheet, zoneData.length);
    this.autoSizeColumns(zoneWorksheet);
    
    this.XLSX.utils.book_append_sheet(this.workbook, zoneWorksheet, 'Zone');
  }

  async exportComplete(data, stats, options) {
    // Dashboard con panoramica
    this.addDashboardSheet(data, stats);
    
    // Tutti i fogli dettagliati
    await this.exportAthletes(data, options);
    await this.exportMatches(data, options);
    await this.exportPayments(data, options);
    await this.exportTransport(data, options);
  }

  // Fogli aggiuntivi e utility

  addDashboardSheet(data, stats) {
    const dashboardData = [
      ['SOCCER MANAGEMENT SYSTEM - DASHBOARD'],
      [''],
      ['📊 STATISTICHE GENERALI'],
      ['Totale Atlete', stats.totalAthletes],
      ['Squadre Attive', data.teams?.length || 0],
      ['Partite Programmate', stats.upcomingMatches],
      ['Documenti in Scadenza', stats.expiringDocuments],
      ['Pagamenti in Sospeso', stats.pendingPayments],
      ['Utenti Trasporto', stats.busUsers],
      ['Anomalie Età', stats.ageViolations],
      [''],
      ['📅 GENERATO IL', new Date().toLocaleDateString('it-IT')],
      [''],
      ['🏆 SQUADRE'],
      ...((data.teams || []).map(team => [team.name, team.category, `${team.players} giocatrici`]))
    ];
    
    const worksheet = this.XLSX.utils.aoa_to_sheet(dashboardData);
    
    // Stile per il titolo
    if (worksheet['A1']) {
      worksheet['A1'].s = {
        font: { bold: true, sz: 16 },
        alignment: { horizontal: 'center' }
      };
    }
    
    this.XLSX.utils.book_append_sheet(this.workbook, worksheet, '📊 Dashboard', true);
  }

  addAthleteStatsSheet(athletes) {
    const teamStats = {};
    
    athletes.forEach(athlete => {
      const team = athlete.teamName;
      if (!teamStats[team]) {
        teamStats[team] = {
          total: 0,
          avgAge: 0,
          validDocs: 0,
          paidFees: 0,
          totalGoals: 0,
          totalGames: 0
        };
      }
      
      teamStats[team].total++;
      teamStats[team].avgAge += athlete.age;
      if (this.getDocumentStatus(athlete) === 'Valido') teamStats[team].validDocs++;
      if (athlete.feeStatus === 'paid') teamStats[team].paidFees++;
      teamStats[team].totalGoals += athlete.goals || 0;
      teamStats[team].totalGames += athlete.gamesPlayed || 0;
    });
    
    // Calcola medie
    Object.values(teamStats).forEach(stats => {
      stats.avgAge = Math.round(stats.avgAge / stats.total);
    });
    
    const statsData = [
      ['STATISTICHE PER SQUADRA'],
      [''],
      ['Squadra', 'Totale Atlete', 'Età Media', 'Doc. Validi', 'Pagamenti OK', 'Gol Totali', 'Partite Totali'],
      ...Object.entries(teamStats).map(([team, stats]) => [
        team,
        stats.total,
        stats.avgAge,
        stats.validDocs,
        stats.paidFees,
        stats.totalGoals,
        stats.totalGames
      ])
    ];
    
    const worksheet = this.XLSX.utils.aoa_to_sheet(statsData);
    this.formatWorksheet(worksheet, statsData.length);
    
    this.XLSX.utils.book_append_sheet(this.workbook, worksheet, '📈 Statistiche');
  }

  addTeamBreakdownSheet(athletes, teams) {
    const teamData = [];
    
    (teams || []).forEach(team => {
      const teamAthletes = athletes.filter(a => a.teamId === team.id);
      
      teamData.push([`SQUADRA: ${team.name.toUpperCase()}`]);
      teamData.push(['Categoria', team.category]);
      teamData.push(['Età Minima', team.minAge]);
      teamData.push(['Età Massima', team.maxAge]);
      teamData.push(['Budget', `€${team.budget}`]);
      teamData.push(['']);
      teamData.push(['Nome', 'Età', 'Posizione', 'Gol', 'Partite']);
      
      teamAthletes.forEach(athlete => {
        teamData.push([
          athlete.name,
          athlete.age,
          athlete.position,
          athlete.goals || 0,
          athlete.gamesPlayed || 0
        ]);
      });
      
      teamData.push(['']);
    });
    
    const worksheet = this.XLSX.utils.aoa_to_sheet(teamData);
    this.autoSizeColumns(worksheet);
    
    this.XLSX.utils.book_append_sheet(this.workbook, worksheet, '👥 Per Squadra');
  }

  addMatchStatsSheet(matches) {
    const competitionStats = {};
    const statusStats = { scheduled: 0, completed: 0, cancelled: 0 };
    
    matches.forEach(match => {
      const comp = match.competition;
      if (!competitionStats[comp]) {
        competitionStats[comp] = { total: 0, completed: 0 };
      }
      competitionStats[comp].total++;
      if (match.status === 'completed') competitionStats[comp].completed++;
      
      statusStats[match.status]++;
    });
    
    const statsData = [
      ['STATISTICHE PARTITE'],
      [''],
      ['📊 PER STATO'],
      ['Programmate', statusStats.scheduled],
      ['Completate', statusStats.completed],
      ['Annullate', statusStats.cancelled],
      [''],
      ['🏆 PER COMPETIZIONE'],
      ['Competizione', 'Totale', 'Completate', 'Percentuale'],
      ...Object.entries(competitionStats).map(([comp, stats]) => [
        comp,
        stats.total,
        stats.completed,
        `${Math.round((stats.completed / stats.total) * 100)}%`
      ])
    ];
    
    const worksheet = this.XLSX.utils.aoa_to_sheet(statsData);
    this.formatWorksheet(worksheet, statsData.length);
    
    this.XLSX.utils.book_append_sheet(this.workbook, worksheet, '⚽ Stats Partite');
  }

  addFinancialSummarySheet(athletes) {
    const totalMembership = athletes.reduce((sum, a) => sum + a.membershipFee, 0);
    const paidMembership = athletes.filter(a => a.feeStatus === 'paid').reduce((sum, a) => sum + a.membershipFee, 0);
    const pendingMembership = totalMembership - paidMembership;
    
    const totalTransport = athletes.filter(a => a.usesBus).reduce((sum, a) => sum + a.busFee, 0);
    const paidTransport = athletes.filter(a => a.usesBus && a.busFeeStatus === 'paid').reduce((sum, a) => sum + a.busFee, 0);
    const pendingTransport = totalTransport - paidTransport;
    
    const summaryData = [
      ['RIASSUNTO FINANZIARIO'],
      [''],
      ['💰 QUOTE SOCIALI'],
      ['Totale Previsto', `€${totalMembership}`],
      ['Incassato', `€${paidMembership}`],
      ['In Sospeso', `€${pendingMembership}`],
      ['Percentuale Incassata', `${Math.round((paidMembership / totalMembership) * 100)}%`],
      [''],
      ['🚌 TRASPORTI'],
      ['Totale Previsto', `€${totalTransport}`],
      ['Incassato', `€${paidTransport}`],
      ['In Sospeso', `€${pendingTransport}`],
      ['Percentuale Incassata', `${Math.round((paidTransport / totalTransport) * 100)}%`],
      [''],
      ['📊 TOTALI'],
      ['Ricavi Totali Previsti', `€${totalMembership + totalTransport}`],
      ['Ricavi Totali Incassati', `€${paidMembership + paidTransport}`],
      ['Ricavi Totali in Sospeso', `€${pendingMembership + pendingTransport}`]
    ];
    
    const worksheet = this.XLSX.utils.aoa_to_sheet(summaryData);
    this.formatWorksheet(worksheet, summaryData.length);
    
    this.XLSX.utils.book_append_sheet(this.workbook, worksheet, '💰 Riassunto');
  }

  // Utility methods

  formatWorksheet(worksheet, dataLength) {
    const range = this.XLSX.utils.decode_range(worksheet['!ref']);
    
    // Formatta header
    for (let col = range.s.c; col <= range.e.c; col++) {
      const headerCell = this.XLSX.utils.encode_cell({ r: 0, c: col });
      if (worksheet[headerCell]) {
        worksheet[headerCell].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "F3F4F6" } },
          alignment: { horizontal: 'center' }
        };
      }
    }
    
    // Applica bordi
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = this.XLSX.utils.encode_cell({ r: row, c: col });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            ...worksheet[cellAddress].s,
            border: {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' }
            }
          };
        }
      }
    }
  }

  autoSizeColumns(worksheet) {
    const range = this.XLSX.utils.decode_range(worksheet['!ref']);
    const cols = [];
    
    for (let col = range.s.c; col <= range.e.c; col++) {
      let maxLength = 0;
      
      for (let row = range.s.r; row <= range.e.r; row++) {
        const cellAddress = this.XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        
        if (cell && cell.v) {
          const length = cell.v.toString().length;
          if (length > maxLength) maxLength = length;
        }
      }
      
      cols.push({ wch: Math.min(Math.max(maxLength + 2, 10), 50) });
    }
    
    worksheet['!cols'] = cols;
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('it-IT');
  }

  getDocumentStatus(athlete) {
    const medicalExpiry = new Date(athlete.medicalExpiry);
    const insuranceExpiry = new Date(athlete.insuranceExpiry);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    if (medicalExpiry < today || insuranceExpiry < today) {
      return 'Scaduto';
    } else if (medicalExpiry < thirtyDaysFromNow || insuranceExpiry < thirtyDaysFromNow) {
      return 'In scadenza';
    } else {
      return 'Valido';
    }
  }

  getMatchStatusText(status) {
    const statusMap = {
      scheduled: 'Programmata',
      completed: 'Completata',
      cancelled: 'Annullata'
    };
    return statusMap[status] || status;
  }

  generateFilename(dataType) {
    const date = new Date().toISOString().split('T')[0];
    const typeMap = {
      athletes: 'atlete',
      matches: 'partite',
      payments: 'pagamenti',
      transport: 'trasporti',
      all: 'completo'
    };
    const type = typeMap[dataType] || 'export';
    return `soccer_management_${type}_${date}.xlsx`;
  }
}

export default ExcelExporter;