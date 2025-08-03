// components/export/PDFExporter.js
class PDFExporter {
  constructor() {
    this.pageWidth = 595.28; // A4 width in points
    this.pageHeight = 841.89; // A4 height in points
    this.margin = 50;
    this.currentY = this.margin;
    this.lineHeight = 20;
  }

  async export(dataType, data, stats, options) {
    try {
      // Usa jsPDF via CDN
      const { jsPDF } = window.jspdf || await this.loadJsPDF();
      
      const doc = new jsPDF();
      this.doc = doc;
      this.currentY = this.margin;
      
      // Header del documento
      this.addHeader(dataType, stats);
      
      // Contenuto specifico per tipo di dato
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
      
      // Footer
      this.addFooter();
      
      // Download del PDF
      const filename = this.generateFilename(dataType);
      doc.save(filename);
      
    } catch (error) {
      console.error('Errore export PDF:', error);
      throw error;
    }
  }

  async loadJsPDF() {
    // Carica jsPDF dinamicamente se non disponibile
    if (!window.jspdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      document.head.appendChild(script);
      
      return new Promise((resolve, reject) => {
        script.onload = () => resolve(window.jspdf);
        script.onerror = reject;
      });
    }
    return window.jspdf;
  }

  addHeader(dataType, stats) {
    const doc = this.doc;
    
    // Logo placeholder
    doc.setFillColor(59, 130, 246); // Blue-500
    doc.rect(this.margin, this.currentY, 40, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('LOGO', this.margin + 15, this.currentY + 20);
    
    // Titolo principale
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('⚽ Società Calcio Femminile', this.margin + 50, this.currentY + 20);
    
    // Sottotitolo
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text(this.getDataTypeTitle(dataType), this.margin + 50, this.currentY + 35);
    
    // Data generazione
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const now = new Date().toLocaleDateString('it-IT');
    doc.text(`Generato il ${now}`, this.pageWidth - this.margin - 80, this.currentY + 15);
    
    // Statistiche rapide
    if (stats) {
      doc.text(`Atlete: ${stats.totalAthletes}`, this.pageWidth - this.margin - 80, this.currentY + 25);
      doc.text(`Squadre: ${stats.totalTeams || 5}`, this.pageWidth - this.margin - 80, this.currentY + 35);
    }
    
    this.currentY += 60;
    this.addLine();
  }

  addFooter() {
    const doc = this.doc;
    
    // Linea separatore
    doc.setDrawColor(200, 200, 200);
    doc.line(this.margin, this.pageHeight - 40, this.pageWidth - this.margin, this.pageHeight - 40);
    
    // Testo footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Generato da Soccer Management System', this.margin, this.pageHeight - 25);
    doc.text(`Pagina ${doc.internal.getNumberOfPages()}`, this.pageWidth - this.margin - 30, this.pageHeight - 25);
  }

  async exportAthletes(data, options) {
    let athletes = data.athletes || [];
    
    // Filtra per squadra se specificato
    if (options.teamFilter !== 'all') {
      athletes = athletes.filter(a => a.teamId == options.teamFilter);
    }
    
    this.addSectionTitle('📋 Elenco Atlete');
    
    if (options.includeStats) {
      this.addStatsSection(athletes);
    }
    
    // Tabella atlete
    this.addTableHeader(['Nome', 'Squadra', 'Età', 'Posizione', 'Stato Doc.', 'Pagamenti']);
    
    athletes.forEach(athlete => {
      this.checkPageBreak();
      
      const docStatus = this.getDocumentStatus(athlete);
      const paymentStatus = athlete.feeStatus === 'paid' ? 'Pagato' : 'In sospeso';
      
      const row = [
        athlete.name,
        athlete.teamName,
        athlete.age.toString(),
        athlete.position,
        docStatus,
        paymentStatus
      ];
      
      this.addTableRow(row, paymentStatus === 'In sospeso' ? 'warning' : 'normal');
    });
    
    this.currentY += 20;
  }

  async exportMatches(data, options) {
    let matches = data.matches || [];
    
    this.addSectionTitle('📅 Calendario Partite');
    
    // Raggruppa per stato
    const groupedMatches = {
      scheduled: matches.filter(m => m.status === 'scheduled'),
      completed: matches.filter(m => m.status === 'completed'),
      cancelled: matches.filter(m => m.status === 'cancelled')
    };
    
    Object.entries(groupedMatches).forEach(([status, statusMatches]) => {
      if (statusMatches.length > 0) {
        this.addSubsectionTitle(this.getStatusTitle(status));
        
        this.addTableHeader(['Data', 'Squadra Casa', 'Squadra Ospite', 'Risultato', 'Competizione']);
        
        statusMatches.forEach(match => {
          this.checkPageBreak();
          
          const row = [
            new Date(match.date).toLocaleDateString('it-IT'),
            match.homeTeam,
            match.awayTeam,
            match.result || 'TBD',
            match.competition
          ];
          
          this.addTableRow(row);
        });
        
        this.currentY += 15;
      }
    });
  }

  async exportPayments(data, options) {
    const athletes = data.athletes || [];
    const pendingPayments = athletes.filter(a => a.feeStatus === 'pending' || (a.usesBus && a.busFeeStatus === 'pending'));
    
    this.addSectionTitle('💰 Stato Pagamenti');
    
    if (options.includeStats) {
      this.addPaymentStats(athletes);
    }
    
    // Pagamenti in sospeso
    if (pendingPayments.length > 0) {
      this.addSubsectionTitle('Pagamenti in Sospeso');
      this.addTableHeader(['Nome', 'Squadra', 'Quota Sociale', 'Trasporto', 'Totale']);
      
      pendingPayments.forEach(athlete => {
        this.checkPageBreak();
        
        const membershipAmount = athlete.feeStatus === 'pending' ? athlete.membershipFee : 0;
        const transportAmount = (athlete.usesBus && athlete.busFeeStatus === 'pending') ? athlete.busFee : 0;
        const total = membershipAmount + transportAmount;
        
        const row = [
          athlete.name,
          athlete.teamName,
          membershipAmount > 0 ? `€${membershipAmount}` : '-',
          transportAmount > 0 ? `€${transportAmount}` : '-',
          `€${total}`
        ];
        
        this.addTableRow(row, 'warning');
      });
    }
    
    this.currentY += 20;
  }

  async exportTransport(data, options) {
    const buses = data.buses || [];
    const zones = data.zones || [];
    
    this.addSectionTitle('🚌 Gestione Trasporti');
    
    // Pulmini
    this.addSubsectionTitle('Pulmini Disponibili');
    this.addTableHeader(['Nome', 'Capacità', 'Autista', 'Targa', 'Percorso']);
    
    buses.forEach(bus => {
      this.checkPageBreak();
      
      const row = [
        bus.name,
        bus.capacity.toString(),
        bus.driver,
        bus.plate,
        bus.route
      ];
      
      this.addTableRow(row);
    });
    
    this.currentY += 15;
    
    // Zone geografiche
    this.addSubsectionTitle('Zone Geografiche');
    this.addTableHeader(['Zona', 'Distanza', 'Tariffa Mensile', 'Utenti']);
    
    zones.forEach(zone => {
      this.checkPageBreak();
      
      const usersInZone = (data.athletes || []).filter(a => a.zone?.id === zone.id).length;
      
      const row = [
        zone.name,
        zone.distance,
        `€${zone.monthlyFee}`,
        usersInZone.toString()
      ];
      
      this.addTableRow(row);
    });
  }

  async exportComplete(data, stats, options) {
    this.addSectionTitle('📊 Report Completo Società');
    
    // Overview generale
    this.addSubsectionTitle('Panoramica Generale');
    this.doc.setFontSize(12);
    this.doc.text(`Totale Atlete: ${stats.totalAthletes}`, this.margin, this.currentY);
    this.currentY += this.lineHeight;
    this.doc.text(`Squadre Attive: ${data.teams?.length || 0}`, this.margin, this.currentY);
    this.currentY += this.lineHeight;
    this.doc.text(`Partite Programmate: ${stats.upcomingMatches}`, this.margin, this.currentY);
    this.currentY += this.lineHeight;
    this.doc.text(`Documenti in Scadenza: ${stats.expiringDocuments}`, this.margin, this.currentY);
    this.currentY += this.lineHeight;
    this.doc.text(`Pagamenti in Sospeso: ${stats.pendingPayments}`, this.margin, this.currentY);
    this.currentY += 30;
    
    // Sezioni sintetiche
    await this.exportAthletes(data, options);
    this.newPage();
    await this.exportMatches(data, options);
    this.newPage();
    await this.exportPayments(data, options);
  }

  // Utility methods
  addSectionTitle(title) {
    this.checkPageBreak(60);
    this.doc.setFontSize(16);
    this.doc.setFont(undefined, 'bold');
    this.doc.setTextColor(59, 130, 246); // Blue-500
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 30;
    this.addLine();
  }

  addSubsectionTitle(title) {
    this.checkPageBreak(40);
    this.doc.setFontSize(14);
    this.doc.setFont(undefined, 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 25;
  }

  addTableHeader(headers) {
    this.checkPageBreak(40);
    
    const colWidth = (this.pageWidth - 2 * this.margin) / headers.length;
    
    // Background header
    this.doc.setFillColor(243, 244, 246); // Gray-100
    this.doc.rect(this.margin, this.currentY - 15, this.pageWidth - 2 * this.margin, this.lineHeight, 'F');
    
    // Testo header
    this.doc.setFontSize(10);
    this.doc.setFont(undefined, 'bold');
    this.doc.setTextColor(0, 0, 0);
    
    headers.forEach((header, index) => {
      const x = this.margin + (index * colWidth) + 5;
      this.doc.text(header, x, this.currentY);
    });
    
    this.currentY += this.lineHeight;
  }

  addTableRow(data, style = 'normal') {
    const colWidth = (this.pageWidth - 2 * this.margin) / data.length;
    
    // Background per righe warning
    if (style === 'warning') {
      this.doc.setFillColor(254, 243, 199); // Yellow-100
      this.doc.rect(this.margin, this.currentY - 12, this.pageWidth - 2 * this.margin, this.lineHeight, 'F');
    }
    
    this.doc.setFontSize(9);
    this.doc.setFont(undefined, 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    data.forEach((cell, index) => {
      const x = this.margin + (index * colWidth) + 5;
      const text = cell?.toString() || '';
      
      // Trunca testo se troppo lungo
      const maxLength = Math.floor(colWidth / 6);
      const displayText = text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
      
      this.doc.text(displayText, x, this.currentY);
    });
    
    this.currentY += this.lineHeight;
  }

  addLine() {
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;
  }

  checkPageBreak(neededSpace = 40) {
    if (this.currentY + neededSpace > this.pageHeight - 60) {
      this.newPage();
    }
  }

  newPage() {
    this.doc.addPage();
    this.currentY = this.margin;
  }

  addStatsSection(athletes) {
    const stats = this.calculateAthleteStats(athletes);
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    
    const statsText = [
      `Totale: ${stats.total}`,
      `Età media: ${stats.avgAge}`,
      `Documenti OK: ${stats.validDocs}`,
      `Pagamenti completati: ${stats.paidFees}`
    ];
    
    statsText.forEach((stat, index) => {
      const x = this.margin + (index * 120);
      this.doc.text(stat, x, this.currentY);
    });
    
    this.currentY += 25;
  }

  addPaymentStats(athletes) {
    const totalPending = athletes.filter(a => a.feeStatus === 'pending').length;
    const totalAmount = athletes.reduce((sum, a) => {
      return sum + (a.feeStatus === 'pending' ? a.membershipFee : 0) + 
             (a.usesBus && a.busFeeStatus === 'pending' ? a.busFee : 0);
    }, 0);
    
    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(`Pagamenti in sospeso: ${totalPending}`, this.margin, this.currentY);
    this.currentY += this.lineHeight;
    this.doc.text(`Importo totale: €${totalAmount}`, this.margin, this.currentY);
    this.currentY += 30;
  }

  calculateAthleteStats(athletes) {
    const total = athletes.length;
    const avgAge = Math.round(athletes.reduce((sum, a) => sum + a.age, 0) / total);
    const validDocs = athletes.filter(a => 
      new Date(a.medicalExpiry) > new Date() && new Date(a.insuranceExpiry) > new Date()
    ).length;
    const paidFees = athletes.filter(a => a.feeStatus === 'paid').length;
    
    return { total, avgAge, validDocs, paidFees };
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

  getDataTypeTitle(dataType) {
    const titles = {
      athletes: 'Report Atlete',
      matches: 'Report Partite',
      payments: 'Report Pagamenti',
      transport: 'Report Trasporti',
      all: 'Report Completo'
    };
    return titles[dataType] || 'Report';
  }

  getStatusTitle(status) {
    const titles = {
      scheduled: 'Partite Programmate',
      completed: 'Partite Completate', 
      cancelled: 'Partite Annullate'
    };
    return titles[status] || status;
  }

  generateFilename(dataType) {
    const date = new Date().toISOString().split('T')[0];
    const type = this.getDataTypeTitle(dataType).replace(/\s+/g, '_').toLowerCase();
    return `soccer_management_${type}_${date}.pdf`;
  }
}

export default PDFExporter;