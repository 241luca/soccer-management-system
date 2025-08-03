// components/export/CSVExporter.js
class CSVExporter {
  constructor() {
    this.delimiter = ',';
    this.enclosure = '"';
    this.lineBreak = '\n';
  }

  async export(dataType, data, stats, options) {
    try {
      let csvContent = '';
      let filename = '';
      
      switch (dataType) {
        case 'athletes':
          csvContent = await this.exportAthletes(data, options);
          filename = this.generateFilename('atlete');
          break;
        case 'matches':
          csvContent = await this.exportMatches(data, options);
          filename = this.generateFilename('partite');
          break;
        case 'payments':
          csvContent = await this.exportPayments(data, options);
          filename = this.generateFilename('pagamenti');
          break;
        case 'transport':
          csvContent = await this.exportTransport(data, options);
          filename = this.generateFilename('trasporti');
          break;
        case 'all':
          csvContent = await this.exportComplete(data, stats, options);
          filename = this.generateFilename('completo');
          break;
        default:
          throw new Error('Tipo di dato non supportato');
      }
      
      // Download del file CSV
      this.downloadCSV(csvContent, filename);
      
    } catch (error) {
      console.error('Errore export CSV:', error);
      throw error;
    }
  }

  async exportAthletes(data, options) {
    let athletes = data.athletes || [];
    
    // Filtra per squadra se specificato
    if (options.teamFilter !== 'all') {
      athletes = athletes.filter(a => a.teamId == options.teamFilter);
    }
    
    // Header CSV
    const headers = [
      'Nome',
      'Età',
      'Squadra',
      'Posizione',
      'Numero',
      'Telefono',
      'Email',
      'Indirizzo',
      'Scadenza_Medico',
      'Scadenza_Assicurazione',
      'Stato_Documenti',
      'Quota_Sociale',
      'Stato_Pagamento',
      'Usa_Trasporto',
      'Zona_Trasporto',
      'Tariffa_Trasporto',
      'Stato_Trasporto',
      'Pulmino_Assegnato',
      'Partite_Giocate',
      'Gol_Segnati',
      'Cartellini_Gialli',
      'Cartellini_Rossi',
      'Minuti_Giocati',
      'Conformità_Età',
      'Promozione_Necessaria',
      'Squadra_Suggerita'
    ];
    
    // Dati
    const rows = athletes.map(athlete => [
      athlete.name,
      athlete.age,
      athlete.teamName,
      athlete.position,
      athlete.number,
      athlete.phone,
      athlete.email,
      athlete.address,
      this.formatDate(athlete.medicalExpiry),
      this.formatDate(athlete.insuranceExpiry),
      this.getDocumentStatus(athlete),
      athlete.membershipFee,
      athlete.feeStatus === 'paid' ? 'Pagato' : 'In_sospeso',
      athlete.usesBus ? 'Sì' : 'No',
      athlete.zone?.name || 'N/A',
      athlete.usesBus ? athlete.busFee : 'N/A',
      athlete.usesBus ? (athlete.busFeeStatus === 'paid' ? 'Pagato' : 'In_sospeso') : 'N/A',
      athlete.assignedBus?.name || 'N/A',
      athlete.gamesPlayed || 0,
      athlete.goals || 0,
      athlete.yellowCards || 0,
      athlete.redCards || 0,
      athlete.minutesPlayed || 0,
      athlete.isAgeValid ? 'Conforme' : 'Non_conforme',
      athlete.needsPromotion ? 'Sì' : 'No',
      athlete.suggestedTeam || 'N/A'
    ]);
    
    return this.arrayToCSV([headers, ...rows]);
  }

  async exportMatches(data, options) {
    let matches = data.matches || [];
    
    const headers = [
      'Data',
      'Ora',
      'Squadra_Casa',
      'Squadra_Ospite',
      'Risultato',
      'Competizione',
      'Venue',
      'Stato',
      'Note',
      'Arbitro'
    ];
    
    const rows = matches.map(match => [
      this.formatDate(match.date),
      match.time || 'TBD',
      match.homeTeam,
      match.awayTeam,
      match.result || 'TBD',
      match.competition,
      match.venue,
      this.getMatchStatusText(match.status),
      match.notes || '',
      match.referee || 'TBD'
    ]);
    
    return this.arrayToCSV([headers, ...rows]);
  }

  async exportPayments(data, options) {
    const athletes = data.athletes || [];
    
    const headers = [
      'Nome',
      'Squadra',
      'Quota_Sociale',
      'Stato_Quota',
      'Usa_Trasporto',
      'Tariffa_Trasporto',
      'Stato_Trasporto',
      'Totale_Dovuto',
      'Zona',
      'Email',
      'Telefono'
    ];
    
    const rows = athletes.map(athlete => {
      const membershipAmount = athlete.feeStatus === 'pending' ? athlete.membershipFee : 0;
      const transportAmount = (athlete.usesBus && athlete.busFeeStatus === 'pending') ? athlete.busFee : 0;
      const totalPending = membershipAmount + transportAmount;
      
      return [
        athlete.name,
        athlete.teamName,
        athlete.membershipFee,
        athlete.feeStatus === 'paid' ? 'Pagata' : 'In_sospeso',
        athlete.usesBus ? 'Sì' : 'No',
        athlete.usesBus ? athlete.busFee : 'N/A',
        athlete.usesBus ? (athlete.busFeeStatus === 'paid' ? 'Pagato' : 'In_sospeso') : 'N/A',
        totalPending,
        athlete.zone?.name || 'N/A',
        athlete.email,
        athlete.phone
      ];
    });
    
    return this.arrayToCSV([headers, ...rows]);
  }

  async exportTransport(data, options) {
    const buses = data.buses || [];
    const zones = data.zones || [];
    const athletes = data.athletes || [];
    
    // CSV per pulmini
    const busHeaders = [
      'Nome_Pulmino',
      'Capacità',
      'Autista',
      'Targa',
      'Percorso',
      'Occupazione_Attuale',
      'Efficienza_Percentuale',
      'Atlete_Assegnate'
    ];
    
    const busRows = buses.map(bus => {
      const assignedAthletes = athletes.filter(a => a.assignedBus?.id === bus.id);
      const efficiency = Math.round((assignedAthletes.length / bus.capacity) * 100);
      
      return [
        bus.name,
        bus.capacity,
        bus.driver,
        bus.plate,
        bus.route,
        assignedAthletes.length,
        efficiency,
        assignedAthletes.map(a => a.name).join('; ')
      ];
    });
    
    let busCSV = this.arrayToCSV([busHeaders, ...busRows]);
    
    // CSV per zone
    const zoneHeaders = [
      'Zona',
      'Distanza',
      'Tariffa_Mensile',
      'Atlete_Totali',
      'Atlete_con_Trasporto',
      'Ricavi_Mensili',
      'Percentuale_Utilizzo'
    ];
    
    const zoneRows = zones.map(zone => {
      const zoneAthletes = athletes.filter(a => a.zone?.id === zone.id);
      const athletesWithTransport = zoneAthletes.filter(a => a.usesBus);
      const totalRevenue = athletesWithTransport.reduce((sum, a) => sum + a.busFee, 0);
      const utilizationRate = zoneAthletes.length > 0 ? Math.round((athletesWithTransport.length / zoneAthletes.length) * 100) : 0;
      
      return [
        zone.name,
        zone.distance,
        zone.monthlyFee,
        zoneAthletes.length,
        athletesWithTransport.length,
        totalRevenue,
        utilizationRate
      ];
    });
    
    let zoneCSV = this.arrayToCSV([zoneHeaders, ...zoneRows]);
    
    // Combina i due CSV con separatori
    return `# PULMINI\n${busCSV}\n\n# ZONE GEOGRAFICHE\n${zoneCSV}`;
  }

  async exportComplete(data, stats, options) {
    // Crea un CSV combinato con tutte le sezioni
    let completeCSV = '';
    
    // Sezione statistiche generali
    completeCSV += '# STATISTICHE GENERALI\n';
    completeCSV += this.arrayToCSV([
      ['Metrica', 'Valore'],
      ['Totale_Atlete', stats.totalAthletes],
      ['Squadre_Attive', data.teams?.length || 0],
      ['Partite_Programmate', stats.upcomingMatches],
      ['Documenti_in_Scadenza', stats.expiringDocuments],
      ['Pagamenti_in_Sospeso', stats.pendingPayments],
      ['Utenti_Trasporto', stats.busUsers],
      ['Anomalie_Età', stats.ageViolations]
    ]);
    
    completeCSV += '\n\n# DATI ATLETE\n';
    completeCSV += await this.exportAthletes(data, options);
    
    completeCSV += '\n\n# PARTITE\n';
    completeCSV += await this.exportMatches(data, options);
    
    completeCSV += '\n\n# PAGAMENTI\n';
    completeCSV += await this.exportPayments(data, options);
    
    completeCSV += '\n\n# TRASPORTI\n';
    completeCSV += await this.exportTransport(data, options);
    
    return completeCSV;
  }

  // Utility methods

  arrayToCSV(data) {
    return data.map(row => 
      row.map(cell => this.escapeCSVField(cell?.toString() || '')).join(this.delimiter)
    ).join(this.lineBreak);
  }

  escapeCSVField(field) {
    // Gestisce virgolette e caratteri speciali
    if (field.includes(this.delimiter) || field.includes(this.enclosure) || field.includes('\n') || field.includes('\r')) {
      return this.enclosure + field.replace(new RegExp(this.enclosure, 'g'), this.enclosure + this.enclosure) + this.enclosure;
    }
    return field;
  }

  downloadCSV(csvContent, filename) {
    // BOM per UTF-8 per Excel compatibility
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;
    
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
      return 'In_scadenza';
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

  generateFilename(type) {
    const date = new Date().toISOString().split('T')[0];
    return `soccer_management_${type}_${date}.csv`;
  }
}

export default CSVExporter;