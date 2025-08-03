// components/export/ExportUtils.js

export class ExportUtils {
  static formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('it-IT');
  }

  static getDocumentStatus(athlete) {
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

  static getMatchStatusText(status) {
    const statusMap = {
      scheduled: 'Programmata',
      completed: 'Completata',
      cancelled: 'Annullata'
    };
    return statusMap[status] || status;
  }

  static filterDataByOptions(data, options) {
    let filteredData = { ...data };
    
    // Filtro per squadra
    if (options.teamFilter && options.teamFilter !== 'all') {
      filteredData.athletes = data.athletes.filter(a => a.teamId == options.teamFilter);
    }
    
    // Filtro per periodo (per ora solo placeholder)
    if (options.dateRange && options.dateRange !== 'all') {
      // Implementare filtri per data se necessario
      // filteredData.matches = data.matches.filter(m => /* logica data */);
    }
    
    return filteredData;
  }

  static calculateAthleteStats(athletes) {
    if (!athletes || athletes.length === 0) {
      return {
        total: 0,
        avgAge: 0,
        validDocs: 0,
        paidFees: 0,
        totalGoals: 0,
        totalGames: 0
      };
    }

    const total = athletes.length;
    const avgAge = Math.round(athletes.reduce((sum, a) => sum + a.age, 0) / total);
    const validDocs = athletes.filter(a => 
      ExportUtils.getDocumentStatus(a) === 'Valido'
    ).length;
    const paidFees = athletes.filter(a => a.feeStatus === 'paid').length;
    const totalGoals = athletes.reduce((sum, a) => sum + (a.goals || 0), 0);
    const totalGames = athletes.reduce((sum, a) => sum + (a.gamesPlayed || 0), 0);
    
    return { total, avgAge, validDocs, paidFees, totalGoals, totalGames };
  }

  static calculateFinancialStats(athletes) {
    if (!athletes || athletes.length === 0) {
      return {
        totalMembership: 0,
        paidMembership: 0,
        pendingMembership: 0,
        totalTransport: 0,
        paidTransport: 0,
        pendingTransport: 0
      };
    }

    const totalMembership = athletes.reduce((sum, a) => sum + a.membershipFee, 0);
    const paidMembership = athletes
      .filter(a => a.feeStatus === 'paid')
      .reduce((sum, a) => sum + a.membershipFee, 0);
    const pendingMembership = totalMembership - paidMembership;
    
    const athletesWithTransport = athletes.filter(a => a.usesBus);
    const totalTransport = athletesWithTransport.reduce((sum, a) => sum + a.busFee, 0);
    const paidTransport = athletesWithTransport
      .filter(a => a.busFeeStatus === 'paid')
      .reduce((sum, a) => sum + a.busFee, 0);
    const pendingTransport = totalTransport - paidTransport;
    
    return {
      totalMembership,
      paidMembership,
      pendingMembership,
      totalTransport,
      paidTransport,
      pendingTransport
    };
  }

  static calculateTransportStats(athletes, buses, zones) {
    const stats = {
      busUsage: {},
      zoneUsage: {},
      efficiency: {}
    };

    // Statistiche per pulmino
    buses.forEach(bus => {
      const assignedAthletes = athletes.filter(a => a.assignedBus?.id === bus.id);
      stats.busUsage[bus.id] = {
        name: bus.name,
        capacity: bus.capacity,
        users: assignedAthletes.length,
        efficiency: Math.round((assignedAthletes.length / bus.capacity) * 100),
        athletes: assignedAthletes
      };
    });

    // Statistiche per zona
    zones.forEach(zone => {
      const zoneAthletes = athletes.filter(a => a.zone?.id === zone.id);
      const athletesWithTransport = zoneAthletes.filter(a => a.usesBus);
      const revenue = athletesWithTransport.reduce((sum, a) => sum + a.busFee, 0);
      
      stats.zoneUsage[zone.id] = {
        name: zone.name,
        totalAthletes: zoneAthletes.length,
        transportUsers: athletesWithTransport.length,
        revenue: revenue,
        utilizationRate: zoneAthletes.length > 0 ? 
          Math.round((athletesWithTransport.length / zoneAthletes.length) * 100) : 0
      };
    });

    // Efficienza generale
    const totalCapacity = buses.reduce((sum, bus) => sum + bus.capacity, 0);
    const totalUsers = athletes.filter(a => a.usesBus).length;
    stats.efficiency.overall = totalCapacity > 0 ? 
      Math.round((totalUsers / totalCapacity) * 100) : 0;

    return stats;
  }

  static groupAthletesByTeam(athletes, teams) {
    const grouped = {};
    
    teams.forEach(team => {
      const teamAthletes = athletes.filter(a => a.teamId === team.id);
      grouped[team.id] = {
        team: team,
        athletes: teamAthletes,
        stats: ExportUtils.calculateAthleteStats(teamAthletes)
      };
    });
    
    return grouped;
  }

  static createFilename(type, format) {
    const date = new Date().toISOString().split('T')[0];
    const typeMap = {
      athletes: 'atlete',
      matches: 'partite',
      payments: 'pagamenti',
      transport: 'trasporti',
      all: 'completo'
    };
    
    const formatMap = {
      pdf: 'pdf',
      excel: 'xlsx',
      csv: 'csv'
    };
    
    const typeText = typeMap[type] || 'export';
    const extension = formatMap[format] || format;
    
    return `soccer_management_${typeText}_${date}.${extension}`;
  }

  static sanitizeForCSV(text) {
    if (!text) return '';
    
    // Converte a stringa e rimuove caratteri problematici
    const sanitized = text.toString()
      .replace(/"/g, '""')  // Escape quotes
      .replace(/\n/g, ' ')  // Remove line breaks
      .replace(/\r/g, ' ')  // Remove carriage returns
      .trim();
    
    // Aggiunge quotes se contiene virgole o spazi
    if (sanitized.includes(',') || sanitized.includes('"') || sanitized.includes('\n')) {
      return `"${sanitized}"`;
    }
    
    return sanitized;
  }

  static generateSummaryText(data, stats) {
    const summary = [];
    
    summary.push(`📊 RIEPILOGO SOCIETÀ`);
    summary.push(`Generato il: ${new Date().toLocaleDateString('it-IT')}`);
    summary.push(``);
    summary.push(`👥 ATLETE: ${stats.totalAthletes}`);
    summary.push(`🏆 SQUADRE: ${data.teams?.length || 0}`);
    summary.push(`⚽ PARTITE PROGRAMMATE: ${stats.upcomingMatches}`);
    summary.push(`📋 DOCUMENTI IN SCADENZA: ${stats.expiringDocuments}`);
    summary.push(`💰 PAGAMENTI IN SOSPESO: ${stats.pendingPayments}`);
    summary.push(`🚌 UTENTI TRASPORTO: ${stats.busUsers}`);
    
    if (stats.ageViolations > 0) {
      summary.push(`⚠️ ANOMALIE ETÀ: ${stats.ageViolations}`);
    }
    
    return summary.join('\n');
  }

  static downloadBlob(content, filename, mimeType = 'application/octet-stream') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export default ExportUtils;